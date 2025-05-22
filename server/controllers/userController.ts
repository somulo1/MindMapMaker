import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

const searchSchema = z.object({
  emailOrUsername: z.string().min(1),
});

export async function searchUsers(req: Request, res: Response) {
  try {
    const { emailOrUsername } = searchSchema.parse(req.body);

    // First try exact match
    const user = await storage.getUserByEmail(emailOrUsername) || 
                await storage.getUserByUsername(emailOrUsername);

    if (user) {
      // Return user with limited fields
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
      });
    }

    // If no exact match, return empty result
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
} 