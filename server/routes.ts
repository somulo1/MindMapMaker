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
    const chamaId = parseInt(req.params.chamaId);
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
  app.get("/api/chamas/:chamaId/members", requireAuth, verifyChamaMembership, async (req, res) => {
    try {
      const chamaId = parseInt(req.params.chamaId);
      const members = await storage.getChamaMembers(chamaId);
      res.json(members);
    } catch (error) {
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

  // Wallet routes
  app.get("/api/wallets/user", isAuthenticated, handleErrors(walletController.getUserWallet));
  app.get("/api/wallets/chama/:chamaId", isAuthenticated, handleErrors(walletController.getChamaWallet));
  app.post("/api/transactions", isAuthenticated, handleErrors(walletController.createTransaction));
  app.get("/api/transactions/user", isAuthenticated, handleErrors(walletController.getUserTransactions));
  app.get("/api/transactions/chama/:chamaId", isAuthenticated, handleErrors(walletController.getChamaTransactions));

  // Marketplace routes
  app.get("/api/marketplace", handleErrors(marketplaceController.getMarketplaceItems));
  app.get("/api/marketplace/user", isAuthenticated, handleErrors(marketplaceController.getUserMarketplaceItems));
  app.post("/api/marketplace", isAuthenticated, handleErrors(marketplaceController.createMarketplaceItem));
  app.get("/api/marketplace/:id", handleErrors(marketplaceController.getMarketplaceItemById));

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

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  handleChat(wss, storage);

  return httpServer;
}
