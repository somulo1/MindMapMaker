import { Request, Response } from "express";
import { storage } from "../storage";
import { notifications, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

const sendInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "secretary", "treasurer", "chairperson"]),
});

// Send invitation to a user
export async function sendInvitation(req: Request, res: Response) {
  try {
    const chamaId = parseInt(req.params.chamaId);
    if (isNaN(chamaId)) {
      return res.status(400).json({ message: "Invalid chama ID" });
    }

    // Validate request body
    const validatedData = sendInvitationSchema.parse(req.body);
    const { email, role } = validatedData;
    const invitedByUserId = (req.user as any).id;

    // Get the chama details
    const chama = await storage.getChama(chamaId);
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" });
    }

    // Get the invited user
    const invitedUser = await storage.getUserByEmail(email);
    if (!invitedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a member
    const existingMember = await storage.getChamaMember(chamaId, invitedUser.id);
    if (existingMember) {
      return res.status(400).json({ message: "User is already a member of this chama" });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await storage.getChamaInvitation(chamaId, invitedUser.id);
    if (existingInvitation && existingInvitation.status === "pending") {
      return res.status(400).json({ message: "User already has a pending invitation" });
    }

    // Create the invitation
    const invitation = await storage.createChamaInvitation({
      chamaId,
      invitedUserId: invitedUser.id,
      invitedByUserId,
      role,
    });

    // Create a notification for the invited user
    await storage.createNotification({
      userId: invitedUser.id,
      type: "chama_invitation",
      title: `Invitation to join ${chama.name}`,
      content: `You have been invited to join ${chama.name} as a ${role}. Please accept or decline the invitation.`,
      relatedId: invitation.id,
    });

    res.json(invitation);
  } catch (error) {
    console.error("Error sending invitation:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to send invitation" });
  }
}

// Handle invitation response (accept/reject)
export async function handleInvitationResponse(req: Request, res: Response) {
  try {
    const invitationId = parseInt(req.params.invitationId);
    const action = req.params.action;
    const userId = (req.user as any).id;

    if (isNaN(invitationId)) {
      return res.status(400).json({ message: "Invalid invitation ID" });
    }

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Get the invitation
    const invitation = await storage.getChamaInvitationById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Check if the invitation is for this user
    if (invitation.invitedUserId !== userId) {
      return res.status(403).json({ message: "Not authorized to respond to this invitation" });
    }

    // Check if the invitation is still pending
    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation has already been processed" });
    }

    // Get the chama details
    const chama = await storage.getChama(invitation.chamaId);
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" });
    }

    if (action === "accept") {
      // Add the user as a member
      await storage.createChamaMember({
        chamaId: invitation.chamaId,
        userId: invitation.invitedUserId,
        role: invitation.role,
      });

      // Update invitation status
      await storage.updateChamaInvitation(invitationId, {
        status: "accepted",
        respondedAt: new Date(),
      });

      // Create notification for the inviter
      await storage.createNotification({
        userId: invitation.invitedByUserId,
        type: "invitation_accepted",
        title: "Invitation Accepted",
        content: `Your invitation to join ${chama.name} has been accepted.`,
        relatedId: invitation.chamaId,
      });
    } else {
      // Update invitation status
      await storage.updateChamaInvitation(invitationId, {
        status: "rejected",
        respondedAt: new Date(),
      });

      // Create notification for the inviter
      await storage.createNotification({
        userId: invitation.invitedByUserId,
        type: "invitation_rejected",
        title: "Invitation Declined",
        content: `Your invitation to join ${chama.name} has been declined.`,
        relatedId: invitation.chamaId,
      });
    }

    res.json({ message: `Invitation ${action}ed successfully` });
  } catch (error) {
    console.error("Error handling invitation response:", error);
    res.status(500).json({ message: "Failed to process invitation response" });
  }
}

// Get chama invitations
export async function getChamaInvitations(req: Request, res: Response) {
  try {
    const chamaId = parseInt(req.params.chamaId);
    if (isNaN(chamaId)) {
      return res.status(400).json({ message: "Invalid chama ID" });
    }

    // Check if user is a member of the chama
    const member = await storage.getChamaMember(chamaId, (req.user as any).id);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this chama" });
    }

    const invitations = await storage.getChamaInvitations(chamaId);
    res.json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ message: "Failed to fetch invitations" });
  }
}

// Get user's invitations
export async function getUserInvitations(req: Request, res: Response) {
  try {
    const userId = (req.user as any).id;
    const invitations = await storage.getUserChamaInvitations(userId);
    res.json({ invitations });
  } catch (error) {
    console.error("Error fetching user invitations:", error);
    res.status(500).json({ message: "Failed to fetch invitations" });
  }
}

// Cancel invitation
export async function cancelInvitation(req: Request, res: Response) {
  try {
    const invitationId = parseInt(req.params.invitationId);
    if (isNaN(invitationId)) {
      return res.status(400).json({ message: "Invalid invitation ID" });
    }

    const userId = (req.user as any).id;

    const invitation = await storage.getChamaInvitationById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Check if user has permission to cancel
    const member = await storage.getChamaMember(invitation.chamaId, userId);
    if (!member || !["chairperson", "secretary"].includes(member.role)) {
      return res.status(403).json({ message: "You don't have permission to cancel invitations" });
    }

    // Get chama details
    const chama = await storage.getChama(invitation.chamaId);
    if (!chama) {
      return res.status(404).json({ message: "Chama not found" });
    }

    // Update invitation status and create notification
    await storage.transaction(async (tx) => {
      await storage.updateChamaInvitation(invitationId, {
        status: "cancelled",
        respondedAt: new Date(),
      });

      await storage.createNotification({
        userId: invitation.invitedUserId,
        type: "invitation_cancelled",
        title: "Invitation Cancelled",
        content: `Your invitation to join ${chama.name} has been cancelled`,
        relatedId: invitation.chamaId,
      });
    });

    res.json({ message: "Invitation cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    res.status(500).json({ message: "Failed to cancel invitation" });
  }
} 