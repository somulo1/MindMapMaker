
import { Request, Response } from 'express';
import axios from 'axios';
import { storage } from '../storage';

// M-PESA API URLs
const MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate';
const MPESA_STK_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

// Get M-PESA auth token
async function getMpesaToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const response = await axios.get(`${MPESA_AUTH_URL}?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return response.data.access_token;
}

// Initialize STK Push
export async function initializePayment(req: Request, res: Response) {
  try {
    const { amount, phoneNumber, description } = req.body;
    const userId = (req.user as any).id;

    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    const response = await axios.post(MPESA_STK_URL, {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64'),
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.BASE_URL}/api/mpesa/callback`,
      AccountReference: `User${userId}`,
      TransactionDesc: description || 'Wallet Top-up'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Store transaction request
    await storage.createTransaction({
      userId,
      type: 'mpesa_deposit',
      amount: Number(amount),
      description: description || 'M-PESA Deposit',
      status: 'pending',
      reference: response.data.CheckoutRequestID
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    return res.status(500).json({
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
}

// Handle M-PESA callback
export async function handleCallback(req: Request, res: Response) {
  try {
    const { Body } = req.body;
    const { ResultCode, CheckoutRequestID } = Body.stkCallback;

    const transaction = await storage.findTransactionByReference(CheckoutRequestID);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (ResultCode === 0) {
      // Update transaction status
      await storage.updateTransaction(transaction.id, {
        status: 'completed'
      });

      // Update user wallet
      await storage.updateWalletBalance(transaction.userId, transaction.amount);
    } else {
      await storage.updateTransaction(transaction.id, {
        status: 'failed'
      });
    }

    return res.status(200).json({ message: 'Callback processed successfully' });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Failed to process callback',
      error: error.message
    });
  }
}
