import { db } from '../db';
import { mindMaps } from '../../shared/mindmap-schema';
import { eq } from 'drizzle-orm';
import { insertMindMapSchema } from '../../shared/mindmap-schema';
import type { Request, Response } from 'express';

export const mindMapController = {
  // Create a new mind map
  async create(req: Request, res: Response) {
    try {
      const validatedData = insertMindMapSchema.parse(req.body);
      const mindMap = await db.insert(mindMaps).values(validatedData).returning();
      res.json(mindMap[0]);
    } catch (error) {
      res.status(400).json({ error: 'Invalid mind map data' });
    }
  },

  // Get all mind maps for a user
  async getAllForUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const userMindMaps = await db.select().from(mindMaps).where(eq(mindMaps.userId, userId));
      res.json(userMindMaps);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch mind maps' });
    }
  },

  // Get a specific mind map
  async getOne(req: Request, res: Response) {
    try {
      const mindMapId = parseInt(req.params.id);
      const mindMap = await db.select().from(mindMaps).where(eq(mindMaps.id, mindMapId)).limit(1);
      if (mindMap.length === 0) {
        return res.status(404).json({ error: 'Mind map not found' });
      }
      res.json(mindMap[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch mind map' });
    }
  },

  // Update a mind map
  async update(req: Request, res: Response) {
    try {
      const mindMapId = parseInt(req.params.id);
      const validatedData = insertMindMapSchema.partial().parse(req.body);
      const updatedMindMap = await db
        .update(mindMaps)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(mindMaps.id, mindMapId))
        .returning();
      if (updatedMindMap.length === 0) {
        return res.status(404).json({ error: 'Mind map not found' });
      }
      res.json(updatedMindMap[0]);
    } catch (error) {
      res.status(400).json({ error: 'Invalid mind map data' });
    }
  },

  // Delete a mind map
  async delete(req: Request, res: Response) {
    try {
      const mindMapId = parseInt(req.params.id);
      const deletedMindMap = await db.delete(mindMaps).where(eq(mindMaps.id, mindMapId)).returning();
      if (deletedMindMap.length === 0) {
        return res.status(404).json({ error: 'Mind map not found' });
      }
      res.json({ message: 'Mind map deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete mind map' });
    }
  },
};