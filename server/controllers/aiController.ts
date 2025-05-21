import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import OpenAI from 'openai';

type Role = 'user' | 'assistant' | 'system';

interface StorageMessage {
  role: Role;
  content: string;
}

interface Conversation {
  id: number;
  userId: number;
  messages: StorageMessage[];
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt for the AI assistant
const SYSTEM_PROMPT = "You are a financial assistant for Tujifund, a group finance and community collaboration app. Provide helpful, concise advice on personal finance, investments, savings, group finances, and business planning. Use examples relevant to Kenyan and East African financial contexts when appropriate. Refer to the user's financial history and behavior when mentioned.";

// Default initial message for new conversations
const INITIAL_AI_MESSAGE: StorageMessage = {
  role: "assistant",
  content: "Hello! I'm your Tujifund financial AI assistant. How can I help with your finances today?"
};

// Send message to AI assistant
export async function sendAiMessage(req: Request, res: Response) {
  const userId = (req.user as any).id;
  
  const messageSchema = z.object({
    message: z.string().min(1),
    conversationId: z.number().optional()
  });
  
  const validatedData = messageSchema.parse(req.body);
  
  try {
    let conversation: Conversation;
    let messages: StorageMessage[];
    
    // Get or create conversation
    if (validatedData.conversationId) {
      const existingConversation = await storage.getAiConversation(validatedData.conversationId) as Conversation;
      if (!existingConversation || existingConversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      conversation = existingConversation;
      messages = existingConversation.messages;
    } else {
      // Create new conversation with initial AI greeting
      messages = [INITIAL_AI_MESSAGE];
      conversation = await storage.createAiConversation({
        userId,
        messages
      }) as Conversation;
    }
    
    // Add user message to conversation history
    const userMessage: StorageMessage = {
      role: "user",
      content: validatedData.message
    };
    messages.push(userMessage);
    
    // Get AI response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      max_tokens: 4096,
      temperature: 0.7
    });
    
    // Extract the response text
    const aiResponseText = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    // Add AI response to conversation
    const assistantMessage: StorageMessage = {
      role: "assistant",
      content: aiResponseText
    };
    messages.push(assistantMessage);
    
    // Update conversation in storage
    await storage.updateAiConversation(conversation.id, {
      messages
    });
    
    return res.status(200).json({
      message: "AI response generated successfully",
      response: aiResponseText,
      conversationId: conversation.id
    });
  } catch (error: unknown) {
    console.error("AI Assistant error:", error);
    
    // Provide a fallback response if OpenAI is unavailable
    return res.status(200).json({
      message: "AI response generated (fallback)",
      response: "I'm currently experiencing some issues with my AI capabilities. Please try again later or contact support if the problem persists.",
      conversationId: validatedData.conversationId || null,
      error: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
}

// Get user's AI conversations
export async function getUserConversations(req: Request, res: Response) {
  const userId = (req.user as any).id;
  
  const conversations = await storage.getUserAiConversations(userId);
  
  return res.status(200).json({ conversations });
}

// Get conversation by ID
export async function getConversationById(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const conversationId = parseInt(req.params.id);
  
  const conversation = await storage.getAiConversation(conversationId);
  
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }
  
  // Verify the conversation belongs to the user
  if (conversation.userId !== userId) {
    return res.status(403).json({ message: "Not authorized to access this conversation" });
  }
  
  return res.status(200).json({ conversation });
}
