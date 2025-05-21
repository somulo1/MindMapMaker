import { apiRequest } from "@/lib/queryClient";
import { 
  User, Wallet, Chama, ChamaMember, 
  Contribution, Transaction, Meeting, 
  Message, ChamaRule, Notification,
  Product, InsertProduct 
} from "@shared/schema";

import { AIConversation, LearningModule } from "@/types";

// Extended types for API responses
type ChamaMemberWithUser = ChamaMember & {
  user: Pick<User, "id" | "username" | "fullName" | "email" | "profilePic" | "location" | "phoneNumber">;
};

type ChamaInvitationWithUser = {
  id: number;
  chamaId: number;
  role: string;
  invitedUserId: number;
  invitedByUserId: number;
  status: string;
  invitedAt: Date;
  respondedAt: Date | null;
  invitedUser: Pick<User, "id" | "username" | "fullName" | "email" | "profilePic">;
  invitedByUser: Pick<User, "id" | "username" | "fullName">;
};

type ChamaMembersResponse = {
  members: ChamaMemberWithUser[];
};

type ChamaInvitationsResponse = {
  invitations: ChamaInvitationWithUser[];
};

type ContributionsResponse = {
  contributions: Contribution[];
};

type ContributionResponse = {
  contribution: Contribution;
  transaction?: Transaction;
};

// Wallet API
export const getWallet = async (): Promise<Wallet> => {
  const res = await apiRequest("GET", "/api/wallet");
  return res.json();
};

export const updateWalletBalance = async (amount: number, type: string, description: string): Promise<Transaction> => {
  const res = await apiRequest("POST", "/api/transactions", {
    userId: 0, // Will be set by server from authenticated user
    type,
    amount: amount.toString(),
    status: "completed",
    description
  });
  return res.json();
};

// Transactions API
export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await apiRequest("GET", "/api/transactions");
  return res.json();
};

// Chama API
export const getChamas = async (): Promise<Chama[]> => {
  const res = await apiRequest("GET", "/api/chamas");
  return res.json();
};

export const getChama = async (chamaId: number): Promise<Chama> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}`);
  return res.json();
};

export const createChama = async (name: string, description: string): Promise<Chama> => {
  const res = await apiRequest("POST", "/api/chamas", {
    name,
    description
  });
  return res.json();
};

// Chama Members API
export const getChamaMembers = async (chamaId: number): Promise<ChamaMemberWithUser[]> => {
  try {
    const res = await apiRequest("GET", `/api/chamas/${chamaId}/members`);
    if (!res.ok) {
      throw new Error(`Failed to fetch members: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data.members || [];
  } catch (error) {
    console.error('Error in getChamaMembers:', error);
    throw error;
  }
};

export const addChamaMember = async (chamaId: number, userId: number, role: string): Promise<ChamaMember> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/members`, {
    userId,
    role
  });
  return res.json();
};

// Contributions API
export const getContributions = async (): Promise<Contribution[]> => {
  const res = await apiRequest("GET", `/api/contributions`);
  return res.json();
};

export const getChamaContributions = async (chamaId: number): Promise<Contribution[]> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/contributions`);
  const data = await res.json();
  return data.contributions;
};

export const createContribution = async (chamaId: number, amount: number): Promise<Contribution> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/contributions`, {
    amount: amount.toString(),
    dueDate: new Date().toISOString()
  });
  const data = await res.json();
  return data.contribution;
};

export const payContribution = async (contributionId: number): Promise<{ contribution: Contribution; transaction: Transaction }> => {
  const res = await apiRequest("POST", `/api/contributions/${contributionId}/pay`);
  return res.json();
};

// Meetings API
export const getChamaMeetings = async (chamaId: number): Promise<Meeting[]> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/meetings`);
  return res.json();
};

export const createMeeting = async (chamaId: number, data: {
  title: string;
  description?: string;
  scheduledFor: string;
  location?: string;
  agenda?: string;
}): Promise<Meeting> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/meetings`, data);
  return res.json();
};

export const uploadMeetingMinutes = async (chamaId: number, meetingId: number, data: {
  content: string;
  fileUrl?: string;
}): Promise<Meeting> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/meetings/${meetingId}/minutes`, data);
  return res.json();
};

// Chama Rules API
export const getChamaRules = async (chamaId: number): Promise<ChamaRule> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/rules`);
  return res.json();
};

export const createChamaRules = async (chamaId: number, rules: Omit<ChamaRule, 'id' | 'chamaId' | 'createdAt' | 'updatedAt'>): Promise<ChamaRule> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/rules`, {
    ...rules,
    chamaId
  });
  return res.json();
};

// Notifications API
export const getNotifications = async (): Promise<Notification[]> => {
  const res = await apiRequest("GET", "/api/notifications");
  return res.json();
};

export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  const res = await apiRequest("POST", `/api/notifications/${notificationId}/read`);
  return res.json();
};

// Marketplace API
export const getProducts = async (): Promise<Product[]> => {
  const res = await apiRequest("GET", "/api/products");
  return res.json();
};

export const getUserProducts = async (): Promise<Product[]> => {
  const res = await apiRequest("GET", "/api/products/my");
  return res.json();
};

export const createProduct = async (productData: Omit<InsertProduct, 'sellerId'>): Promise<Product> => {
  const res = await apiRequest("POST", "/api/products", productData);
  return res.json();
};

// Messages API
export const getUserMessages = async (): Promise<Message[]> => {
  const res = await apiRequest("GET", "/api/messages");
  return res.json();
};

export const getChamaMessages = async (chamaId: number): Promise<Message[]> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/messages`);
  return res.json();
};

// AI Assistant API
export const chatWithAI = async (message: string): Promise<{response: string, timestamp: string}> => {
  const res = await apiRequest("POST", "/api/assistant/chat", { message });
  return res.json();
};

// Learning modules - these would be fetched from API in a real app
export const getLearningModules = async (): Promise<LearningModule[]> => {
  // Static data until backend implements learning modules
  return [
    {
      id: "module-1",
      title: "Introduction to Personal Finance",
      description: "Learn the basics of personal finance and budgeting to build a solid financial foundation.",
      tags: ["beginner", "finance"],
      duration: "30 min",
      imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80",
      progress: 100,
      completed: true
    },
    {
      id: "module-2",
      title: "Savings Strategies for Groups",
      description: "Discover effective strategies for group savings and investment clubs.",
      tags: ["intermediate", "chama"],
      duration: "45 min",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
      progress: 60,
      completed: false
    },
    {
      id: "module-3",
      title: "Investment Basics",
      description: "Learn about different investment vehicles and how to build a balanced portfolio.",
      tags: ["intermediate", "investment"],
      duration: "60 min",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
      progress: 0,
      completed: false
    },
    {
      id: "module-4",
      title: "Managing Chama Operations",
      description: "Best practices for running successful chama groups including governance and conflict resolution.",
      tags: ["advanced", "chama"],
      duration: "50 min",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      progress: 0,
      completed: false
    }
  ];
};

// Chama Wallet API
export const getChamaWallet = async (chamaId: number): Promise<Wallet> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/wallet`);
  return res.json();
};

export const transferToChama = async (
  chamaId: number, 
  amount: number, 
  description: string
): Promise<{ transaction: Transaction; contribution: Contribution }> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/transfer`, {
    amount: amount.toString(),
    description,
    type: "chama_contribution"
  });
  return res.json();
};

export const transferFromChama = async (
  chamaId: number, 
  amount: number, 
  description: string
): Promise<{ transaction: Transaction; contribution: Contribution }> => {
  const res = await apiRequest("POST", `/api/chamas/${chamaId}/withdraw`, {
    amount: amount.toString(),
    description,
    type: "chama_withdrawal"
  });
  return res.json();
};

// Document types
export interface ChamaDocument {
  id: number;
  chamaId: number;
  name: string;
  description?: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
  uploadedAt: string;
  updatedAt: string;
}

// Document API functions
export const uploadChamaDocument = async (
  chamaId: number,
  file: File,
  data: {
    category: string;
    description?: string;
  }
): Promise<ChamaDocument> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', data.category);
  if (data.description) {
    formData.append('description', data.description);
  }

  const res = await fetch(`/api/chamas/${chamaId}/documents`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (!res.ok) {
    throw new Error(`Failed to upload document: ${res.statusText}`);
  }

  return res.json();
};

export const getChamaDocuments = async (chamaId: number): Promise<ChamaDocument[]> => {
  try {
    const res = await apiRequest("GET", `/api/chamas/${chamaId}/documents`);
    
    // Check if we got a valid response
    if (!res.ok) {
      throw new Error(`Failed to fetch documents: ${res.statusText}`);
    }

    // Check the content type
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Invalid content type:", contentType);
      throw new Error("Invalid response format from server");
    }

    const text = await res.text(); // Get the raw text first
    if (!text) {
      return []; // Return empty array if no content
    }

    try {
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : data.documents || [];
    } catch (parseError) {
      console.error("JSON Parse Error:", { text, error: parseError });
      throw new Error("Failed to parse server response");
    }
  } catch (error) {
    console.error("Error in getChamaDocuments:", error);
    throw error;
  }
};

export const downloadChamaDocument = async (chamaId: number, documentId: number): Promise<Blob> => {
  const res = await apiRequest("GET", `/api/chamas/${chamaId}/documents/${documentId}/download`);
  return res.blob();
};

export const deleteChamaDocument = async (chamaId: number, documentId: number): Promise<void> => {
  await apiRequest("DELETE", `/api/chamas/${chamaId}/documents/${documentId}`);
};
