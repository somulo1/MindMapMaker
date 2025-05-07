import { Request, Response } from "express";
import { storage } from "../storage";

// Get all learning resources
export async function getLearningResources(req: Request, res: Response) {
  const resources = await storage.getLearningResources();
  
  return res.status(200).json({ resources });
}

// Get learning resource by ID
export async function getLearningResourceById(req: Request, res: Response) {
  const resourceId = parseInt(req.params.id);
  
  const resource = await storage.getLearningResource(resourceId);
  if (!resource) {
    return res.status(404).json({ message: "Learning resource not found" });
  }
  
  return res.status(200).json({ resource });
}

// Get learning resources by category
export async function getLearningResourcesByCategory(req: Request, res: Response) {
  const category = req.params.category;
  
  // Validate category
  const validCategories = ["basics", "intermediate", "advanced"];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }
  
  const resources = await storage.getLearningResourcesByCategory(category);
  
  return res.status(200).json({ resources });
}
