import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { handleChat } from "./ws/chatHandler";
import { insertUserSchema, insertChamaSchema, insertWalletSchema, insertTransactionSchema, insertMessageSchema, insertLearningResourceSchema, insertMarketplaceItemSchema } from "@shared/schema";

// Controllers
import * as authController from "./controllers/authController";
import * as chamaController from "./controllers/chamaController";
import * as walletController from "./controllers/walletController";
import * as marketplaceController from "./controllers/marketplaceController";
import * as learningController from "./controllers/learningController";
import * as aiController from "./controllers/aiController";
import * as chatController from "./controllers/chatController";
import * as wishlistController from "./controllers/wishlistController";
import * as cartController from "./controllers/cartController";
import * as adminController from "./controllers/adminController";
import * as chamaInvitationController from "./controllers/chamaInvitationController";
import * as userController from "./controllers/userController";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "tujifund-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 24 hours
      store: new SessionStore({ checkPeriod: 86400000 }), // prune expired entries every 24h
    })
  );

  // Set up passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Admin middleware
  const isAdmin = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && (req.user as any).role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden: Admin access required" });
  };

  // Error handler middleware
  const handleErrors = (handler: (req: Request, res: Response) => Promise<any>) => {
    return async (req: Request, res: Response) => {
      try {
        await handler(req, res);
      } catch (error) {
        if (error instanceof ZodError) {
          const readableError = fromZodError(error);
          return res.status(400).json({ message: "Validation error", errors: readableError.message });
        }
        console.error("API Error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    };
  };

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  // Helper function to verify chama membership
  const verifyChamaMembership = async (req: any, res: any, next: any) => {
    const chamaId = parseInt(req.params.id);
    if (isNaN(chamaId)) {
      return res.status(400).json({ message: "Invalid chama ID" });
    }

    const member = await storage.getChamaMember(chamaId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: "Not a member of this chama" });
    }

    req.chamaMember = member;
    next();
  };
  // CHAMA MEMBERS API
  app.get("/api/chamas/:id/members", requireAuth, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const members = await storage.getChamaMembers(chamaId);
      res.json({ members });
    } catch (error) {
      console.error('Error getting chama members:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update member rating
  app.put("/api/chamas/:id/members/:memberId/rating", requireAuth, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const memberId = parseInt(req.params.memberId);
      const { rating } = req.body;

      // Validate rating
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
      }

      // Update the rating
      const updatedMember = await storage.updateChamaMember(memberId, { rating });
      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }

      res.json({ member: updatedMember });
    } catch (error) {
      console.error('Error updating member rating:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", handleErrors(wishlistController.getUserWishlist));
  app.post("/api/wishlist/:itemId", handleErrors(wishlistController.addToWishlist));
  app.delete("/api/wishlist/:itemId", handleErrors(wishlistController.removeFromWishlist));

  // Cart routes
  app.get("/api/cart", handleErrors(cartController.getUserCart));
  app.post("/api/cart", handleErrors(cartController.addToCart));
  app.put("/api/cart/:itemId", handleErrors(cartController.updateCartItem));
  app.delete("/api/cart/:itemId", handleErrors(cartController.removeFromCart));
  app.post("/api/cart/checkout", handleErrors(cartController.checkoutCart));
  
  // Auth routes
  app.post("/api/auth/register", handleErrors(authController.register));
  app.post("/api/auth/login", passport.authenticate("local"), handleErrors(authController.login));
  app.get("/api/auth/me", isAuthenticated, handleErrors(authController.getCurrentUser));
  app.post("/api/auth/logout", handleErrors(authController.logout));
  app.post("/api/users/search", handleErrors(authController.getUserByEmailOrUsername));

  // Chama routes
  app.get("/api/chamas", isAuthenticated, handleErrors(chamaController.getUserChamas));
  app.post("/api/chamas", isAuthenticated, handleErrors(chamaController.createChama));
  app.get("/api/chamas/:id", isAuthenticated, handleErrors(chamaController.getChamaById));
  app.post("/api/chamas/:id/members", isAuthenticated, handleErrors(chamaController.addChamaMember));
  app.get("/api/chamas/:id/members", isAuthenticated, handleErrors(chamaController.getChamaMembers));

  // Document routes
  app.get("/api/chamas/:id/documents", isAuthenticated, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const documents = await storage.getChamaDocuments(chamaId);
      res.setHeader('Content-Type', 'application/json');
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/chamas/:id/documents", isAuthenticated, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      const document = await storage.createChamaDocument({
        ...req.body,
        chamaId,
        uploadedBy: userId
      });
      res.setHeader('Content-Type', 'application/json');
      res.status(201).json(document);
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.get("/api/chamas/:id/documents/:documentId/download", isAuthenticated, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const documentId = parseInt(req.params.documentId);
      const document = await storage.getChamaDocument(chamaId, documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.setHeader('Content-Type', document.fileType);
      res.download(document.fileUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  app.delete("/api/chamas/:id/documents/:documentId", isAuthenticated, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const documentId = parseInt(req.params.documentId);
      await storage.deleteChamaDocument(chamaId, documentId);
      res.setHeader('Content-Type', 'application/json');
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Chama invitation routes
  app.post("/api/chamas/:chamaId/invitations", isAuthenticated, chamaInvitationController.sendInvitation);
  app.post("/api/chamas/invitations/:invitationId/:action", isAuthenticated, chamaInvitationController.handleInvitationResponse);
  app.get("/api/chamas/:chamaId/invitations", isAuthenticated, handleErrors(chamaInvitationController.getChamaInvitations));
  app.get("/api/invitations", isAuthenticated, handleErrors(chamaInvitationController.getUserInvitations));

  // Wallet routes
  app.get("/api/wallets/user", isAuthenticated, handleErrors(walletController.getUserWallet));
  app.get("/api/wallets/chama/:chamaId", isAuthenticated, handleErrors(walletController.getChamaWallet));
  app.post("/api/transactions", isAuthenticated, handleErrors(walletController.createTransaction));
  app.get("/api/transactions/user", isAuthenticated, handleErrors(walletController.getUserTransactions));
  app.get("/api/transactions/chama/:chamaId", isAuthenticated, handleErrors(walletController.getChamaTransactions));

  // Contribution routes
  app.get("/api/chamas/:id/contributions", isAuthenticated, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const contributions = await storage.getChamaContributions(chamaId);
      
      // Enrich contributions with member data
      const enrichedContributions = await Promise.all(
        contributions.map(async (contribution) => {
          const user = await storage.getUser(contribution.userId);
          return {
            ...contribution,
            member: user ? {
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              email: user.email,
              profilePic: user.profilePic,
              location: user.location,
              phoneNumber: user.phoneNumber
            } : null
          };
        })
      );
      
      res.json({ contributions: enrichedContributions });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/chamas/:id/contributions", isAuthenticated, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const { amount } = req.body;
      const userId = (req.user as any).id;

      // Create contribution
      const contribution = await storage.createContribution({
        chamaId,
        userId,
        amount: parseFloat(amount),
        dueDate: new Date(),
        status: "pending"
      });

      // Immediately try to pay the contribution
      try {
        const result = await storage.payContribution(contribution.id);
        res.status(201).json(result);
      } catch (error) {
        // If payment fails, still return the created contribution
        res.status(201).json({ contribution });
      }
    } catch (error) {
      console.error("Error creating contribution:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/contributions/:contributionId/pay", isAuthenticated, async (req, res) => {
    try {
      const contributionId = parseInt(req.params.contributionId);
      const userId = (req.user as any).id;

      // Get the contribution
      const contribution = await storage.getContribution(contributionId);
      if (!contribution) {
        return res.status(404).json({ message: "Contribution not found" });
      }

      // Verify the user is the contributor
      if (contribution.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to pay this contribution" });
      }

      // Get user's wallet
      const userWallet = await storage.getUserWallet(userId);
      if (!userWallet) {
        return res.status(404).json({ message: "User wallet not found" });
      }

      // Check if user has enough balance
      if (userWallet.balance < contribution.amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Get chama wallet
      const chamaWallet = await storage.getChamaWallet(contribution.chamaId);
      if (!chamaWallet) {
        return res.status(404).json({ message: "Chama wallet not found" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        chamaId: contribution.chamaId,
        type: "contribution",
        amount: contribution.amount,
        description: `Contribution payment #${contributionId}`,
        sourceWallet: userWallet.id,
        destinationWallet: chamaWallet.id,
        status: "completed"
      });

      // Update contribution status
      const updatedContribution = await storage.updateContribution(contributionId, {
        status: "paid",
        paidAt: new Date()
      });

      res.json({
        message: "Contribution paid successfully",
        contribution: updatedContribution,
        transaction
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Marketplace routes
  app.get("/api/marketplace", handleErrors(marketplaceController.getMarketplaceItems));
  app.get("/api/marketplace/user", isAuthenticated, handleErrors(marketplaceController.getUserMarketplaceItems));
  app.post("/api/marketplace", isAuthenticated, handleErrors(marketplaceController.createMarketplaceItem));
  app.get("/api/marketplace/:id", handleErrors(marketplaceController.getMarketplaceItemById));
  app.delete("/api/marketplace/item/:id", isAuthenticated, handleErrors(marketplaceController.deleteMarketplaceItem));
  app.put("/api/marketplace/item/:id", isAuthenticated, handleErrors(marketplaceController.updateMarketplaceItem));

  // Learning routes
  app.get("/api/learning", handleErrors(learningController.getLearningResources));
  app.get("/api/learning/:id", handleErrors(learningController.getLearningResourceById));
  app.get("/api/learning/category/:category", handleErrors(learningController.getLearningResourcesByCategory));

  // AI Assistant routes
  app.post("/api/ai/message", isAuthenticated, handleErrors(aiController.sendAiMessage));
  app.get("/api/ai/conversations", isAuthenticated, handleErrors(aiController.getUserConversations));
  app.get("/api/ai/conversations/:id", isAuthenticated, handleErrors(aiController.getConversationById));

  // Chat routes
  app.get("/api/messages/user", isAuthenticated, handleErrors(chatController.getUserMessages));
  app.get("/api/messages/chama/:chamaId", isAuthenticated, handleErrors(chatController.getChamaMessages));
  app.post("/api/messages", isAuthenticated, handleErrors(chatController.createMessage));

  // Admin routes
  app.get("/api/admin/users", isAdmin, handleErrors(adminController.getUsers));
  app.get("/api/admin/users/stats", isAdmin, handleErrors(adminController.getUserStats));
  app.get("/api/admin/users/:id/activity", isAdmin, handleErrors(adminController.getUserActivity));
  app.put("/api/admin/users/:id", isAdmin, handleErrors(adminController.updateUser));
  app.post("/api/admin/users/:id/toggle-block", isAdmin, handleErrors(adminController.toggleUserBlock));
  app.delete("/api/admin/users/:id", isAdmin, handleErrors(adminController.deleteUser));

  // Meeting routes
  app.get("/api/chamas/:id/meetings", isAuthenticated, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const meetings = await storage.getChamaMeetings(chamaId);
      
      // Update meeting statuses based on scheduled time
      const updatedMeetings = await Promise.all(meetings.map(async meeting => {
        const meetingDate = new Date(meeting.scheduledFor);
        const now = new Date();
        
        if (meeting.status === "upcoming" && meetingDate < now) {
          const updated = await storage.updateMeeting(meeting.id, {
            status: "completed"
          });
          return updated;
        }
        return meeting;
      }));
      
      res.json(updatedMeetings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/chamas/:id/meetings", isAuthenticated, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const { title, description, scheduledFor, location, agenda } = req.body;
      
      // Validate scheduledFor date
      const meetingDate = new Date(scheduledFor);
      if (isNaN(meetingDate.getTime())) {
        return res.status(400).json({ message: "Invalid meeting date" });
      }
      
      const meeting = await storage.createMeeting({
        chamaId,
        title,
        description: description || null,
        scheduledFor: meetingDate.toISOString(), // Pass as ISO string
        location: location || null,
        agenda: agenda || null,
        status: meetingDate > new Date() ? "upcoming" : "completed"
      });

      // Format the response
      const response = {
        ...meeting,
        scheduledFor: meeting.scheduledFor.toISOString(),
        createdAt: meeting.createdAt.toISOString(),
        updatedAt: meeting.updatedAt.toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating meeting:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/chamas/:id/meetings/:meetingId/minutes", isAuthenticated, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.id);
      const meetingId = parseInt(req.params.meetingId);
      const { content, fileUrl } = req.body;

      const meeting = await storage.updateMeeting(meetingId, {
        minutes: { content, fileUrl: fileUrl || null },
        status: "completed"
      });

      res.json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User routes
  app.get("/api/users/me", isAuthenticated, handleErrors(userController.getCurrentUser));
  app.post("/api/users/search", isAuthenticated, handleErrors(userController.searchUsers));

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const notifications = await storage.getUserNotifications(userId);
      
      // Format the response
      const formattedNotifications = notifications.map(notification => ({
        ...notification,
        createdAt: new Date(Number(notification.createdAt)),
        updatedAt: notification.updatedAt ? new Date(Number(notification.updatedAt)) : null
      }));
      
      res.json(formattedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      const notification = await storage.getNotification(notificationId);
      if (!notification || notification.userId !== userId) {
        return res.status(404).json({ message: "Notification not found" });
      }

      await storage.updateNotification(notificationId, { read: true });
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  handleChat(wss, storage);

  return httpServer;
}
