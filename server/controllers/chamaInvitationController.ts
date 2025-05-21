import { Request, Response } from "express";
import { storage } from "../storage";
import { notifications } from "@shared/schema";

// Send invitation to a user
export async function sendInvitation(req: Request, res: Response) {
  const chamaId = parseInt(req.params.chamaId);
  const { email, role } = req.body;
  const invitedByUserId = (req.user as any).id;

  // Check if user has permission to invite
  const member = await storage.getChamaMember(chamaId, invitedByUserId);
  if (!member || !["chairperson", "secretary"].includes(member.role)) {
    return res.status(403).json({ message: "You don't have permission to invite members" });
  }

  // Get user by email
  const invitedUser = await storage.getUserByEmail(email);
  if (!invitedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if user is already a member
  const existingMember = await storage.getChamaMember(chamaId, invitedUser.id);
  if (existingMember) {
    return res.status(400).json({ message: "User is already a member of this chama" });
  }

  // Check if there's a pending invitation
  const existingInvitation = await storage.getChamaInvitation(chamaId, invitedUser.id);
  if (existingInvitation && existingInvitation.status === "pending") {
    return res.status(400).json({ message: "User already has a pending invitation" });
  }

  // Create invitation
  const invitation = await storage.createChamaInvitation({
    chamaId,
    invitedUserId: invitedUser.id,
    invitedByUserId,
    role,
  });

  // Get chama details for the notification
  const chama = await storage.getChama(chamaId);

  // Create notification
  await storage.createNotification({
    userId: invitedUser.id,
    type: "chama_invitation",
    title: "New Chama Invitation",
    content: `You have been invited to join ${chama.name} as a ${role}.`,
    relatedId: invitation.id,
  });

  res.status(201).json({ message: "Invitation sent successfully" });
}

// Accept invitation
export async function acceptInvitation(req: Request, res: Response) {
  const invitationId = parseInt(req.params.invitationId);
  const userId = (req.user as any).id;

  const invitation = await storage.getChamaInvitationById(invitationId);
  if (!invitation) {
    return res.status(404).json({ message: "Invitation not found" });
  }

  if (invitation.invitedUserId !== userId) {
    return res.status(403).json({ message: "This invitation is not for you" });
  }

  if (invitation.status !== "pending") {
    return res.status(400).json({ message: "Invitation is no longer pending" });
  }

  // Add user to chama
  await storage.addChamaMember({
    chamaId: invitation.chamaId,
    userId: invitation.invitedUserId,
    role: invitation.role,
  });

  // Update invitation status
  await storage.updateChamaInvitation(invitationId, {
    status: "accepted",
    respondedAt: new Date(),
  });

  // Get chama details for the notification
  const chama = await storage.getChama(invitation.chamaId);

  // Create notification for the inviter
  await storage.createNotification({
    userId: invitation.invitedByUserId,
    type: "invitation_accepted",
    title: "Invitation Accepted",
    content: `${(req.user as any).fullName} has accepted your invitation to join ${chama.name}.`,
    relatedId: invitation.chamaId,
  });

  res.json({ message: "Invitation accepted successfully" });
}

// Reject invitation
export async function rejectInvitation(req: Request, res: Response) {
  const invitationId = parseInt(req.params.invitationId);
  const userId = (req.user as any).id;

  const invitation = await storage.getChamaInvitationById(invitationId);
  if (!invitation) {
    return res.status(404).json({ message: "Invitation not found" });
  }

  if (invitation.invitedUserId !== userId) {
    return res.status(403).json({ message: "This invitation is not for you" });
  }

  if (invitation.status !== "pending") {
    return res.status(400).json({ message: "Invitation is no longer pending" });
  }

  // Update invitation status
  await storage.updateChamaInvitation(invitationId, {
    status: "rejected",
    respondedAt: new Date(),
  });

  // Get chama details for the notification
  const chama = await storage.getChama(invitation.chamaId);

  // Create notification for the inviter
  await storage.createNotification({
    userId: invitation.invitedByUserId,
    type: "invitation_rejected",
    title: "Invitation Rejected",
    content: `${(req.user as any).fullName} has declined your invitation to join ${chama.name}.`,
    relatedId: invitation.chamaId,
  });

  res.json({ message: "Invitation rejected successfully" });
}

// Get chama invitations
export async function getChamaInvitations(req: Request, res: Response) {
  const chamaId = parseInt(req.params.chamaId);
  const invitations = await storage.getChamaInvitations(chamaId);
  res.json(invitations);
}

// Get user's pending invitations
export async function getUserInvitations(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const invitations = await storage.getUserChamaInvitations(userId);
  res.json(invitations);
}

// Cancel invitation (for chama admins)
export async function cancelInvitation(req: Request, res: Response) {
  const invitationId = parseInt(req.params.invitationId);
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

  // Update invitation status
  await storage.updateChamaInvitation(invitationId, {
    status: "cancelled",
    respondedAt: new Date(),
  });

  res.json({ message: "Invitation cancelled successfully" });
} 