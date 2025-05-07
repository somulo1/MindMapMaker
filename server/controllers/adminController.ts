
import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
  throw new Error('MPESA credentials not set in environment variables');
}

// Initialize M-PESA config
const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: 'sandbox',
  baseUrl: 'https://sandbox.safaricom.co.ke'
};

// M-PESA auth token generation
async function getMpesaToken() {
  const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
  const response = await axios.get(`${mpesaConfig.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });
  return response.data.access_token;
}

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
    const token = await getMpesaToken();
    const { data: transactions } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    return res.status(200).json({ 
      data: transactions?.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        status: tx.status,
        created: tx.created_at,
        reference: tx.reference
      }))
    });
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
