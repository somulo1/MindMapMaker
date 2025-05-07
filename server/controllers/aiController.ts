import { Request, Response } from "express";
import { storage } from "../storage";
import OpenAI from "openai";
import { z } from "zod";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development"
});

// Default initial message for new conversations
const INITIAL_AI_MESSAGE = {
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
    let conversation;
    let messages;
    
    // Get or create conversation
    if (validatedData.conversationId) {
      conversation = await storage.getAiConversation(validatedData.conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      messages = conversation.messages;
    } else {
      // Create new conversation with initial AI greeting
      messages = [INITIAL_AI_MESSAGE];
      conversation = await storage.createAiConversation({
        userId,
        messages
      });
    }
    
    // Add user message to conversation history
    messages.push({
      role: "user",
      content: validatedData.message
    });
    
    // Get AI response
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a financial assistant for Tujifund, a group finance and community collaboration app. Provide helpful, concise advice on personal finance, investments, savings, group finances, and business planning. Use examples relevant to Kenyan and East African financial contexts when appropriate. Refer to the user's financial history and behavior when mentioned."
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    // Add AI response to conversation
    const aiResponse = completion.choices[0].message;
    messages.push({
      role: "assistant",
      content: aiResponse.content || "I'm sorry, I couldn't generate a response."
    });
    
    // Update conversation in storage
    await storage.updateAiConversation(conversation.id, {
      messages
    });
    
    return res.status(200).json({
      message: "AI response generated successfully",
      response: aiResponse.content,
      conversationId: conversation.id
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    
    // Provide a fallback response if OpenAI is unavailable
    return res.status(200).json({
      message: "AI response generated (fallback)",
      response: "I'm currently experiencing some issues with my AI capabilities. Please try again later or contact support if the problem persists.",
      conversationId: validatedData.conversationId || null,
      error: process.env.NODE_ENV === "development" ? error.message : undefined
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
