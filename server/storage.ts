import { 
  users, type User, type InsertUser,
  chamas, type Chama, type InsertChama,
  chamaMembers, type ChamaMember, type InsertChamaMember,
  wallets, type Wallet, type InsertWallet,
  transactions, type Transaction, type InsertTransaction,
  messages, type Message, type InsertMessage,
  learningResources, type LearningResource, type InsertLearningResource,
  marketplaceItems, type MarketplaceItem, type InsertMarketplaceItem,
  aiConversations, type AiConversation, type InsertAiConversation,
  wishlistItems, type WishlistItem,
  notifications,
  chamaInvitations, type ChamaInvitation, type InsertChamaInvitation,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  contributions, type Contribution, type InsertContribution,
  meetings, type Meeting, type InsertMeeting,
  mindMaps, type MindMap, type InsertMindMap
} from "@shared/sqlite-schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getDrizzle } from "./drizzle";

// Define storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Chamas
  getChama(id: number): Promise<Chama | undefined>;
  getChamasByUserId(userId: number): Promise<Chama[]>;
  createChama(chama: InsertChama): Promise<Chama>;
  updateChama(id: number, chama: Partial<Chama>): Promise<Chama | undefined>;
  
  // Chama members
  getChamaMember(chamaId: number, userId: number): Promise<ChamaMember | undefined>;
  getChamaMembers(chamaId: number): Promise<ChamaMember[]>;
  addChamaMember(member: InsertChamaMember): Promise<ChamaMember>;
  updateChamaMember(id: number, member: Partial<ChamaMember>): Promise<ChamaMember | undefined>;
  
  // Wallets
  getUserWallet(userId: number): Promise<Wallet | undefined>;
  getChamaWallet(chamaId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, wallet: Partial<Wallet>): Promise<Wallet | undefined>;
  
  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getChamaTransactions(chamaId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getUserMessages(userId: number): Promise<Message[]>;
  getChamaMessages(chamaId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<Message>): Promise<Message | undefined>;
  
  // Learning resources
  getLearningResource(id: number): Promise<LearningResource | undefined>;
  getLearningResources(): Promise<LearningResource[]>;
  getLearningResourcesByCategory(category: string): Promise<LearningResource[]>;
  createLearningResource(resource: InsertLearningResource): Promise<LearningResource>;
  
  // Marketplace
  getMarketplaceItem(id: number): Promise<MarketplaceItem | undefined>;
  getMarketplaceItems(): Promise<MarketplaceItem[]>;
  getUserMarketplaceItems(userId: number): Promise<MarketplaceItem[]>;
  getChamaMarketplaceItems(chamaId: number): Promise<MarketplaceItem[]>;
  createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem>;
  updateMarketplaceItem(id: number, item: Partial<MarketplaceItem>): Promise<MarketplaceItem | undefined>;
  deleteMarketplaceItem(id: number): Promise<void>;
  
  // AI Conversations
  getAiConversation(id: number): Promise<AiConversation | undefined>;
  getUserAiConversations(userId: number): Promise<AiConversation[]>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  updateAiConversation(id: number, conversation: Partial<AiConversation>): Promise<AiConversation | undefined>;

  // Wishlist operations
  getWishlistItem(userId: number, itemId: number): Promise<WishlistItem | undefined>;
  getUserWishlist(userId: number): Promise<WishlistItem[]>;
  addToWishlist(userId: number, itemId: number): Promise<WishlistItem>;
  removeFromWishlist(userId: number, itemId: number): Promise<void>;

  // Admin methods
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  getChamaMembershipsByUserId(userId: number): Promise<ChamaMember[]>;

  // Contribution methods
  getContribution(id: number): Promise<Contribution | undefined>;
  getChamaContributions(chamaId: number): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  updateContribution(id: number, data: Partial<Contribution>): Promise<Contribution | undefined>;

  // Meeting methods
  getChamaMeetings(chamaId: number): Promise<Meeting[]>;
  createMeeting(data: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, data: Partial<Meeting>): Promise<Meeting>;

  // Cart methods
  getUserCart(userId: number): Promise<CartItem[]>;
  getCartItem(userId: number, itemId: number): Promise<CartItem | undefined>;
  addToCart(userId: number, itemId: number, quantity: number): Promise<CartItem>;
  updateCartItem(userId: number, itemId: number, data: Partial<CartItem>): Promise<CartItem>;
  removeFromCart(userId: number, itemId: number): Promise<void>;
  clearUserCart(userId: number): Promise<void>;
  createOrder(userId: number, totalAmount: number, items: any[]): Promise<Order>;

  // Chama invitation methods
  createChamaInvitation(data: {
    chamaId: number;
    invitedUserId: number;
    invitedByUserId: number;
    role: string;
  }): Promise<ChamaInvitation>;

  getChamaInvitation(chamaId: number, userId: number): Promise<ChamaInvitation | undefined>;

  getChamaInvitationById(invitationId: number): Promise<ChamaInvitation | undefined>;

  updateChamaInvitation(invitationId: number, data: {
    status: string;
    respondedAt: Date;
  } | any, tx?: any): Promise<ChamaInvitation>;

  getChamaInvitations(chamaId: number): Promise<any[]>;

  getUserChamaInvitations(userId: number): Promise<any[]>;

  getUserNotifications(userId: number): Promise<any[]>;

  getNotification(id: number): Promise<any>;

  updateNotification(id: number, data: Partial<typeof notifications.$inferInsert>): Promise<any>;

  createNotification(data: {
    userId: number;
    type: string;
    title: string;
    content: string;
    relatedId?: number;
  }, tx?: any): Promise<any>;
}

export class SQLiteStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const db = await getDrizzle();
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await getDrizzle();
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await getDrizzle();
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await getDrizzle();
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const db = await getDrizzle();
    const result = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getChama(id: number): Promise<Chama | undefined> {
    const db = await getDrizzle();
    const result = await db.select().from(chamas).where(eq(chamas.id, id));
    return result[0];
  }

  async getChamasByUserId(userId: number): Promise<Chama[]> {
    const db = await getDrizzle();
    const result = await db
      .select()
      .from(chamas)
      .innerJoin(chamaMembers, eq(chamas.id, chamaMembers.chamaId))
      .where(eq(chamaMembers.userId, userId));
    return result.map(r => r.chamas);
  }

  async createChama(insertChama: InsertChama): Promise<Chama> {
    const db = await getDrizzle();
    const result = await db.insert(chamas).values(insertChama).returning();
    return result[0];
  }

  async updateChama(id: number, data: Partial<Chama>): Promise<Chama | undefined> {
    const db = await getDrizzle();
    const result = await db.update(chamas)
      .set(data)
      .where(eq(chamas.id, id))
      .returning();
    return result[0];
  }

  async getChamaMember(chamaId: number, userId: number): Promise<ChamaMember | undefined> {
    const db = await getDrizzle();
    const result = await db
      .select()
      .from(chamaMembers)
      .where(
        and(
          eq(chamaMembers.chamaId, chamaId),
          eq(chamaMembers.userId, userId)
        )
      );
    return result[0];
  }

  async getChamaMembers(chamaId: number): Promise<ChamaMember[]> {
    const db = await getDrizzle();
    const result = await db
      .select({
        id: chamaMembers.id,
        chamaId: chamaMembers.chamaId,
        userId: chamaMembers.userId,
        role: chamaMembers.role,
        contributionAmount: chamaMembers.contributionAmount,
        contributionFrequency: chamaMembers.contributionFrequency,
        rating: chamaMembers.rating,
        isActive: chamaMembers.isActive,
        joinedAt: chamaMembers.joinedAt,
        user: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          email: users.email,
          profilePic: users.profilePic,
          location: users.location,
          phoneNumber: users.phoneNumber
        }
      })
      .from(chamaMembers)
      .leftJoin(users, eq(chamaMembers.userId, users.id))
      .where(eq(chamaMembers.chamaId, chamaId));
    
    return result.map(r => ({
      id: r.id,
      chamaId: r.chamaId,
      userId: r.userId,
      role: r.role,
      contributionAmount: r.contributionAmount,
      contributionFrequency: r.contributionFrequency,
      rating: r.rating,
      isActive: r.isActive,
      joinedAt: r.joinedAt,
      user: r.user
    }));
  }

  async addChamaMember(member: InsertChamaMember): Promise<ChamaMember> {
    const db = await getDrizzle();
    const result = await db.insert(chamaMembers).values(member).returning();
    return result[0];
  }

  async updateChamaMember(id: number, data: Partial<ChamaMember>): Promise<ChamaMember | undefined> {
    const db = await getDrizzle();
    const result = await db.update(chamaMembers)
      .set(data)
      .where(eq(chamaMembers.id, id))
      .returning();
    return result[0];
  }

  async getUserWallet(userId: number): Promise<Wallet | undefined> {
    const db = await getDrizzle();
    const result = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    return result[0];
  }

  async getChamaWallet(chamaId: number): Promise<Wallet | undefined> {
    const db = await getDrizzle();
    const result = await db
      .select()
      .from(wallets)
      .where(eq(wallets.chamaId, chamaId));
    return result[0];
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const db = await getDrizzle();
    const result = await db.insert(wallets).values(insertWallet).returning();
    return result[0];
  }

  async updateWallet(id: number, data: Partial<Wallet>): Promise<Wallet | undefined> {
    const db = await getDrizzle();
    const result = await db.update(wallets)
      .set(data)
      .where(eq(wallets.id, id))
      .returning();
    return result[0];
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const db = await getDrizzle();
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return result[0];
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const db = await getDrizzle();
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt);
  }

  async getChamaTransactions(chamaId: number): Promise<Transaction[]> {
    const db = await getDrizzle();
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.chamaId, chamaId))
      .orderBy(transactions.createdAt);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const db = await getDrizzle();
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const db = await getDrizzle();
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return result[0];
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    const db = await getDrizzle();
    return db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(messages.sentAt);
  }

  async getChamaMessages(chamaId: number): Promise<Message[]> {
    const db = await getDrizzle();
    return db
      .select()
      .from(messages)
      .where(eq(messages.chamaId, chamaId))
      .orderBy(messages.sentAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const db = await getDrizzle();
    const result = await db.insert(messages).values(insertMessage).returning();
    return result[0];
  }

  async updateMessage(id: number, data: Partial<Message>): Promise<Message | undefined> {
    const db = await getDrizzle();
    const result = await db.update(messages)
      .set(data)
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  }

  async getLearningResource(id: number): Promise<LearningResource | undefined> {
    const db = await getDrizzle();
    const result = await db.select().from(learningResources).where(eq(learningResources.id, id));
    return result[0];
  }

  async getLearningResources(): Promise<LearningResource[]> {
    const db = await getDrizzle();
    return db.select().from(learningResources).orderBy(learningResources.id);
  }

  async getLearningResourcesByCategory(category: string): Promise<LearningResource[]> {
    const db = await getDrizzle();
    return db.select().from(learningResources).where(eq(learningResources.category, category)).orderBy(learningResources.id);
  }

  async createLearningResource(insertResource: InsertLearningResource): Promise<LearningResource> {
    const db = await getDrizzle();
    const result = await db.insert(learningResources).values(insertResource).returning();
    return result[0];
  }

  async getMarketplaceItem(id: number): Promise<MarketplaceItem | undefined> {
    const db = await getDrizzle();
    const result = await db.select().from(marketplaceItems).where(eq(marketplaceItems.id, id));
    return result[0];
  }

  async getMarketplaceItems(): Promise<MarketplaceItem[]> {
    const db = await getDrizzle();
    return db.select().from(marketplaceItems).where(eq(marketplaceItems.isActive, true)).orderBy(marketplaceItems.id);
  }

  async getUserMarketplaceItems(userId: number): Promise<MarketplaceItem[]> {
    const db = await getDrizzle();
    return db.select().from(marketplaceItems).where(and(eq(marketplaceItems.sellerId, userId), eq(marketplaceItems.isActive, true))).orderBy(marketplaceItems.id);
  }

  async getChamaMarketplaceItems(chamaId: number): Promise<MarketplaceItem[]> {
    const db = await getDrizzle();
    return db.select().from(marketplaceItems).where(and(eq(marketplaceItems.chamaId, chamaId), eq(marketplaceItems.isActive, true))).orderBy(marketplaceItems.id);
  }

  async createMarketplaceItem(insertItem: InsertMarketplaceItem): Promise<MarketplaceItem> {
    const db = await getDrizzle();
    const result = await db.insert(marketplaceItems).values(insertItem).returning();
    return result[0];
  }

  async updateMarketplaceItem(id: number, data: Partial<MarketplaceItem>): Promise<MarketplaceItem | undefined> {
    const db = await getDrizzle();
    const result = await db.update(marketplaceItems)
      .set(data)
      .where(eq(marketplaceItems.id, id))
      .returning();
    return result[0];
  }

  async deleteMarketplaceItem(id: number): Promise<void> {
    const db = await getDrizzle();
    await db.delete(marketplaceItems).where(eq(marketplaceItems.id, id));
  }

  async getAiConversation(id: number): Promise<AiConversation | undefined> {
    const db = await getDrizzle();
    const result = await db.select().from(aiConversations).where(eq(aiConversations.id, id));
    return result[0];
  }

  async getUserAiConversations(userId: number): Promise<AiConversation[]> {
    const db = await getDrizzle();
    return db.select().from(aiConversations).where(eq(aiConversations.userId, userId)).orderBy(aiConversations.updatedAt);
  }

  async createAiConversation(insertConversation: InsertAiConversation): Promise<AiConversation> {
    const db = await getDrizzle();
    const result = await db.insert(aiConversations).values(insertConversation).returning();
    return result[0];
  }

  async updateAiConversation(id: number, data: Partial<AiConversation>): Promise<AiConversation | undefined> {
    const db = await getDrizzle();
    const result = await db.update(aiConversations)
      .set(data)
      .where(eq(aiConversations.id, id))
      .returning();
    return result[0];
  }

  async getWishlistItem(userId: number, itemId: number): Promise<WishlistItem | undefined> {
    const db = await getDrizzle();
    const result = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.itemId, itemId)));
    return result[0];
  }

  async getUserWishlist(userId: number): Promise<WishlistItem[]> {
    const db = await getDrizzle();
    return db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId)).orderBy(wishlistItems.id);
  }

  async addToWishlist(userId: number, itemId: number): Promise<WishlistItem> {
    const db = await getDrizzle();
    const result = await db.insert(wishlistItems).values({ userId, itemId }).returning();
    return result[0];
  }

  async removeFromWishlist(userId: number, itemId: number): Promise<void> {
    const db = await getDrizzle();
    await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.itemId, itemId)));
  }

  async getAllUsers(): Promise<User[]> {
    const db = await getDrizzle();
    return db.select().from(users).orderBy(users.id);
  }

  async deleteUser(id: number): Promise<void> {
    const db = await getDrizzle();
    await db.delete(users).where(eq(users.id, id));
    await db.delete(wallets).where(eq(wallets.userId, id));
    await db.delete(messages).where(and(eq(messages.senderId, id), eq(messages.receiverId, id)));
    await db.delete(marketplaceItems).where(eq(marketplaceItems.sellerId, id));
    await db.delete(chamaMembers).where(eq(chamaMembers.userId, id));
    await db.delete(aiConversations).where(eq(aiConversations.userId, id));
    await db.delete(wishlistItems).where(eq(wishlistItems.userId, id));
    await db.delete(cartItems).where(eq(cartItems.userId, id));
    await db.delete(orders).where(eq(orders.userId, id));
    await db.delete(orderItems).where(eq(orderItems.orderId, orders.id));
    await db.delete(contributions).where(eq(contributions.userId, id));
    await db.delete(mindMaps).where(eq(mindMaps.userId, id));
  }

  async getChamaMembershipsByUserId(userId: number): Promise<ChamaMember[]> {
    const db = await getDrizzle();
    return db.select().from(chamaMembers).where(eq(chamaMembers.userId, userId));
  }

  async getContribution(id: number): Promise<Contribution | undefined> {
    const db = await getDrizzle();
    const result = await db.select().from(contributions).where(eq(contributions.id, id));
    return result[0];
  }

  async getChamaContributions(chamaId: number): Promise<Contribution[]> {
    const db = await getDrizzle();
    return db.select().from(contributions).where(eq(contributions.chamaId, chamaId)).orderBy(contributions.createdAt);
  }

  async createContribution(insertContribution: InsertContribution): Promise<Contribution> {
    const db = await getDrizzle();
    const result = await db.insert(contributions).values(insertContribution).returning();
    return result[0];
  }

  async updateContribution(id: number, data: Partial<Contribution>): Promise<Contribution | undefined> {
    const db = await getDrizzle();
    const result = await db.update(contributions)
      .set(data)
      .where(eq(contributions.id, id))
      .returning();
    return result[0];
  }

  async getChamaMeetings(chamaId: number): Promise<Meeting[]> {
    const db = await getDrizzle();
    const results = await db.select().from(meetings).where(eq(meetings.chamaId, chamaId)).orderBy(meetings.scheduledFor);
    
    // Convert Unix timestamps to Date objects
    return results.map(meeting => ({
      ...meeting,
      scheduledFor: new Date(Number(meeting.scheduledFor) * 1000),
      createdAt: new Date(Number(meeting.createdAt) * 1000),
      updatedAt: new Date(Number(meeting.updatedAt) * 1000)
    }));
  }

  async createMeeting(data: InsertMeeting): Promise<Meeting> {
    const db = await getDrizzle();
    
    // Convert Date objects to Date type for SQLite
    const meetingData = {
      ...data,
      scheduledFor: new Date(data.scheduledFor),
      status: data.status || 'upcoming'
    };

    const result = await db.insert(meetings).values(meetingData).returning();
    
    // Convert timestamps back to Date objects in the response
    return {
      ...result[0],
      scheduledFor: result[0].scheduledFor instanceof Date ? result[0].scheduledFor : new Date(result[0].scheduledFor),
      createdAt: result[0].createdAt instanceof Date ? result[0].createdAt : new Date(result[0].createdAt),
      updatedAt: result[0].updatedAt instanceof Date ? result[0].updatedAt : new Date(result[0].updatedAt)
    };
  }

  async updateMeeting(id: number, data: Partial<Meeting>): Promise<Meeting> {
    const db = await getDrizzle();
    
    // Ensure scheduledFor is a Date object
    const updateData = {
      ...data,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined
    };

    const result = await db.update(meetings)
      .set(updateData)
      .where(eq(meetings.id, id))
      .returning();

    // Convert timestamps back to Date objects in the response
    return {
      ...result[0],
      scheduledFor: result[0].scheduledFor instanceof Date ? result[0].scheduledFor : new Date(result[0].scheduledFor),
      createdAt: result[0].createdAt instanceof Date ? result[0].createdAt : new Date(result[0].createdAt),
      updatedAt: result[0].updatedAt instanceof Date ? result[0].updatedAt : new Date(result[0].updatedAt)
    };
  }

  // Cart methods implementation
  async getUserCart(userId: number): Promise<CartItem[]> {
    const db = await getDrizzle();
    return db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async getCartItem(userId: number, itemId: number): Promise<CartItem | undefined> {
    const db = await getDrizzle();
    const result = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.itemId, itemId)));
    return result[0];
  }

  async addToCart(userId: number, itemId: number, quantity: number): Promise<CartItem> {
    const db = await getDrizzle();
    const result = await db
      .insert(cartItems)
      .values({
        userId,
        itemId,
        quantity,
      } satisfies InsertCartItem)
      .returning();
    return result[0];
  }

  async updateCartItem(userId: number, itemId: number, data: Partial<CartItem>): Promise<CartItem> {
  const db = await getDrizzle();
    const result = await db
      .update(cartItems)
      .set(data)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.itemId, itemId)))
      .returning();
  return result[0];
}

  async removeFromCart(userId: number, itemId: number): Promise<void> {
    const db = await getDrizzle();
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.itemId, itemId)));
  }

  async clearUserCart(userId: number): Promise<void> {
    const db = await getDrizzle();
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async createOrder(userId: number, totalAmount: number, items: any[]): Promise<Order> {
    const db = await getDrizzle();
    
    // Create the order first
    const [order] = await db
      .insert(orders)
      .values({
        userId,
        totalAmount,
        status: 'completed',
        currency: 'KES'
      } satisfies InsertOrder)
      .returning();

    // Create order items and update marketplace items
    for (const item of items) {
      // Create order item
      await db
        .insert(orderItems)
        .values({
          orderId: order.id,
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
          currency: 'KES'
        } satisfies InsertOrderItem);

      // Update marketplace item quantity
      const [marketplaceItem] = await db
        .select()
        .from(marketplaceItems)
        .where(eq(marketplaceItems.id, item.itemId))
        .limit(1);

      if (marketplaceItem) {
        const newQuantity = marketplaceItem.quantity - item.quantity;
        await db
          .update(marketplaceItems)
          .set({
            quantity: newQuantity,
            isActive: newQuantity > 0
          })
          .where(eq(marketplaceItems.id, item.itemId));
      }
    }

    return order;
  }

  // Chama invitation methods
  async createChamaInvitation(data: {
    chamaId: number;
    invitedUserId: number;
    invitedByUserId: number;
    role: string;
  }): Promise<ChamaInvitation> {
    const db = await getDrizzle();
    
    try {
      // First check if there's already a pending invitation
      const existingInvitation = await this.getChamaInvitation(data.chamaId, data.invitedUserId);
      if (existingInvitation && existingInvitation.status === "pending") {
        throw new Error("User already has a pending invitation");
      }

      // Check if user is already a member
      const existingMember = await this.getChamaMember(data.chamaId, data.invitedUserId);
      if (existingMember) {
        throw new Error("User is already a member of this chama");
      }

      const result = await db.insert(chamaInvitations)
        .values({
          chamaId: data.chamaId,
          invitedUserId: data.invitedUserId,
          invitedByUserId: data.invitedByUserId,
          role: data.role,
          status: "pending",
        })
        .returning();
      
      return result[0];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create invitation");
    }
  }

  async getChamaInvitation(chamaId: number, userId: number): Promise<ChamaInvitation | undefined> {
  const db = await getDrizzle();
  const result = await db
    .select()
    .from(chamaInvitations)
    .where(and(
      eq(chamaInvitations.chamaId, chamaId),
      eq(chamaInvitations.invitedUserId, userId)
    ))
    .orderBy(desc(chamaInvitations.invitedAt))
    .limit(1);
  return result[0];
}

  async getChamaInvitationById(invitationId: number): Promise<ChamaInvitation | undefined> {
  const db = await getDrizzle();
  const result = await db
    .select()
    .from(chamaInvitations)
    .where(eq(chamaInvitations.id, invitationId))
    .limit(1);
  return result[0];
}

  async updateChamaInvitation(invitationId: number, data: {
    status: string;
    respondedAt: Date;
  } | any, tx?: any): Promise<ChamaInvitation> {
    const db = tx || await getDrizzle();
    try {
      const result = await db.update(chamaInvitations)
    .set(data)
    .where(eq(chamaInvitations.id, invitationId))
    .returning();
  return result[0];
    } catch (error) {
      console.error('Error updating chama invitation:', error);
      throw new Error('Failed to update chama invitation');
    }
}

  async getChamaInvitations(chamaId: number): Promise<any[]> {
  const db = await getDrizzle();
  const invitedUsers = users;
  const invitedByUsers = users;
  
    try {
  const result = await db
    .select({
      id: chamaInvitations.id,
      chamaId: chamaInvitations.chamaId,
          invitedUserId: chamaInvitations.invitedUserId,
          invitedByUserId: chamaInvitations.invitedByUserId,
      invitedUser: {
        id: invitedUsers.id,
            username: invitedUsers.username,
        fullName: invitedUsers.fullName,
        email: invitedUsers.email,
        profilePic: invitedUsers.profilePic,
      },
      invitedByUser: {
        id: invitedByUsers.id,
            username: invitedByUsers.username,
        fullName: invitedByUsers.fullName,
      },
      role: chamaInvitations.role,
      status: chamaInvitations.status,
      invitedAt: chamaInvitations.invitedAt,
      respondedAt: chamaInvitations.respondedAt,
    })
    .from(chamaInvitations)
    .innerJoin(invitedUsers, eq(chamaInvitations.invitedUserId, invitedUsers.id))
    .innerJoin(invitedByUsers, eq(chamaInvitations.invitedByUserId, invitedByUsers.id))
    .where(eq(chamaInvitations.chamaId, chamaId))
    .orderBy(desc(chamaInvitations.invitedAt));
  
  return result;
    } catch (error) {
      console.error('Error fetching chama invitations:', error);
      throw new Error("Failed to fetch invitations");
    }
}

  async getUserChamaInvitations(userId: number): Promise<any[]> {
  const db = await getDrizzle();
  const invitedByUsers = users;
  
  const result = await db
    .select({
      id: chamaInvitations.id,
      chama: {
        id: chamas.id,
        name: chamas.name,
        icon: chamas.icon,
        iconBg: chamas.iconBg,
      },
      invitedByUser: {
        id: invitedByUsers.id,
        fullName: invitedByUsers.fullName,
      },
      role: chamaInvitations.role,
      status: chamaInvitations.status,
      invitedAt: chamaInvitations.invitedAt,
      respondedAt: chamaInvitations.respondedAt,
    })
    .from(chamaInvitations)
    .innerJoin(chamas, eq(chamaInvitations.chamaId, chamas.id))
    .innerJoin(invitedByUsers, eq(chamaInvitations.invitedByUserId, invitedByUsers.id))
    .where(eq(chamaInvitations.invitedUserId, userId))
    .orderBy(desc(chamaInvitations.invitedAt));
  
  return result;
  }

  async getUserNotifications(userId: number) {
    const db = await getDrizzle();
    try {
      const result = await db.select({
        id: notifications.id,
        userId: notifications.userId,
        type: notifications.type,
        title: notifications.title,
        content: notifications.content,
        read: notifications.read,
        createdAt: notifications.createdAt,
        relatedId: notifications.relatedId,
      })
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

      return result.map(notification => ({
        ...notification,
        createdAt: new Date(Number(notification.createdAt)),
      }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get user notifications');
    }
  }

  async getNotification(id: number) {
    const db = await getDrizzle();
    try {
      const result = await db.select()
        .from(notifications)
        .where(eq(notifications.id, id))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting notification:', error);
      throw new Error('Failed to get notification');
    }
  }

  async updateNotification(id: number, data: Partial<typeof notifications.$inferInsert>) {
    const db = await getDrizzle();
    try {
      const result = await db.update(notifications)
        .set(data)
        .where(eq(notifications.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating notification:', error);
      throw new Error('Failed to update notification');
    }
  }

  async createNotification(data: {
    userId: number;
    type: string;
    title: string;
    content: string;
    relatedId?: number;
  }, tx?: any) {
    const db = tx || await getDrizzle();
    try {
      const result = await db.insert(notifications)
        .values({
          userId: data.userId,
          type: data.type,
          title: data.title,
          content: data.content,
          relatedId: data.relatedId,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }
}

export const storage = new SQLiteStorage();

// Transaction support
export async function transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
  const db = await getDrizzle();
  return db.transaction(callback);
}

// Update addChamaMember to accept transaction
export async function addChamaMember(data: {
  chamaId: number;
  userId: number;
  role: string;
}, tx?: any) {
  const db = tx || await getDrizzle();
  try {
    const result = await db.insert(chamaMembers)
      .values({
        chamaId: data.chamaId,
        userId: data.userId,
        role: data.role,
      })
      .returning();
    
    // Update chama member count
    await db.update(chamas)
      .set({ memberCount: sql`${chamas.memberCount} + 1` })
      .where(eq(chamas.id, data.chamaId));
    
    return result[0];
  } catch (error) {
    console.error('Error adding chama member:', error);
    throw new Error('Failed to add chama member');
  }
}

// Update updateChamaInvitation to accept transaction
export async function updateChamaInvitation(invitationId: number, data: {
  status: string;
  respondedAt: Date;
} | any, tx?: any) {
  const db = tx || await getDrizzle();
  try {
    const result = await db.update(chamaInvitations)
      .set(data)
      .where(eq(chamaInvitations.id, invitationId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error updating chama invitation:', error);
    throw new Error('Failed to update chama invitation');
  }
}
