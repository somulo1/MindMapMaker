
import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { Stripe } from 'stripe';
import { createClient } from '@supabase/supabase-js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export async function createBackup(req: Request, res: Response) {
  try {
    const timestamp = new Date().toISOString();
    const { data, error } = await supabase.storage
      .from('backups')
      .upload(`backup-${timestamp}.json`, JSON.stringify(await storage.exportData()));
      
    if (error) throw error;
    
    return res.status(200).json({ 
      message: 'Backup created successfully',
      backup: data
    });
  } catch (error: any) {
    return res.status(500).json({ 
      message: 'Failed to create backup',
      error: error.message 
    });
  }
}

export async function getPayments(req: Request, res: Response) {
  try {
    const payments = await stripe.paymentIntents.list({
      limit: 100,
    });
    
    return res.status(200).json(payments);
  } catch (error: any) {
    return res.status(500).json({
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
}

export async function createTicket(req: Request, res: Response) {
  const ticketSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    priority: z.enum(['low', 'medium', 'high']),
    userId: z.number()
  });

  try {
    const ticket = ticketSchema.parse(req.body);
    const { data, error } = await supabase
      .from('support_tickets')
      .insert(ticket)
      .select()
      .single();
      
    if (error) throw error;
    
    return res.status(201).json(data);
  } catch (error: any) {
    return res.status(400).json({
      message: 'Failed to create ticket',
      error: error.message
    });
  }
}
