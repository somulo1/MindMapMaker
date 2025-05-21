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
  wishlistItems, type WishlistItem, type InsertWishlistItem,
  carts, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem
} from "@shared/schema";

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

  // Cart operations
  getCartItem(userId: number, itemId: number): Promise<CartItem | undefined>;
  getUserCart(userId: number): Promise<CartItem[]>;
  addToCart(userId: number, itemId: number, quantity: number): Promise<CartItem>;
  updateCartItem(userId: number, itemId: number, data: Partial<CartItem>): Promise<CartItem | undefined>;
  removeFromCart(userId: number, itemId: number): Promise<void>;
  clearUserCart(userId: number): Promise<void>;

  // Order operations
  createOrder(userId: number, totalAmount: number, items: { itemId: number; quantity: number; price: number }[]): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Admin methods
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  getChamaMembershipsByUserId(userId: number): Promise<ChamaMember[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chamas: Map<number, Chama>;
  private chamaMembers: Map<number, ChamaMember>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private messages: Map<number, Message>;
  private learningResources: Map<number, LearningResource>;
  private marketplaceItems: Map<number, MarketplaceItem>;
  private aiConversations: Map<number, AiConversation>;
  private wishlistItems: Map<number, WishlistItem>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userIdCounter: number;
  private chamaIdCounter: number;
  private chamaMemberIdCounter: number;
  private walletIdCounter: number;
  private transactionIdCounter: number;
  private messageIdCounter: number;
  private learningResourceIdCounter: number;
  private marketplaceItemIdCounter: number;
  private aiConversationIdCounter: number;
  private wishlistItemIdCounter: number = 1;
  private cartItemIdCounter: number = 1;
  private orderIdCounter: number = 1;
  private orderItemIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.chamas = new Map();
    this.chamaMembers = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.messages = new Map();
    this.learningResources = new Map();
    this.marketplaceItems = new Map();
    this.aiConversations = new Map();
    this.wishlistItems = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userIdCounter = 1;
    this.chamaIdCounter = 1;
    this.chamaMemberIdCounter = 1;
    this.walletIdCounter = 1;
    this.transactionIdCounter = 1;
    this.messageIdCounter = 1;
    this.learningResourceIdCounter = 1;
    this.marketplaceItemIdCounter = 1;
    this.aiConversationIdCounter = 1;
    
    // Add some initial learning resources
    this.seedLearningResources();
  }

  // Seed initial learning resources
  private seedLearningResources() {
    const resources: InsertLearningResource[] = [
      {
        title: "Financial Literacy 101",
        description: "Learn the fundamentals of managing personal finances",
        category: "basics",
        type: "article",
        duration: 12,
        imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        content: "Introduction to financial literacy content here..."
      },
      {
        title: "Smart Investment Strategies",
        description: "Diversify your portfolio with these proven approaches",
        category: "intermediate",
        type: "video",
        duration: 8,
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        content: "Investment strategies video content link here..."
      },
      {
        title: "Business Planning Guide",
        description: "Create a solid business plan for your new venture",
        category: "advanced",
        type: "tutorial",
        duration: 20,
        imageUrl: "https://images.unsplash.com/photo-1664575599736-c5197c684128?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        content: "Business planning tutorial content here..."
      }
    ];
    
    resources.forEach(resource => {
      this.createLearningResource(resource);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      role: "user",
      isActive: true,
      lastActive: now,
      createdAt: now,
      profilePic: null,
      location: null,
      phoneNumber: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...data,
      // Don't allow updating these fields
      id: user.id,
      createdAt: user.createdAt,
      // Ensure required fields have default values
      username: data.username || user.username,
      email: data.email || user.email,
      password: data.password || user.password,
      fullName: data.fullName || user.fullName,
      role: data.role || user.role,
      isActive: data.isActive !== undefined ? data.isActive : user.isActive,
      lastActive: data.lastActive || user.lastActive,
      // Handle nullable fields
      profilePic: data.profilePic !== undefined ? data.profilePic : user.profilePic,
      location: data.location !== undefined ? data.location : user.location,
      phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : user.phoneNumber
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Chamas
  async getChama(id: number): Promise<Chama | undefined> {
    return this.chamas.get(id);
  }

  async getChamasByUserId(userId: number): Promise<Chama[]> {
    const memberRecords = Array.from(this.chamaMembers.values())
      .filter(member => member.userId === userId && member.isActive);
    
    return memberRecords.map(member => 
      this.chamas.get(member.chamaId)!
    ).filter(Boolean);
  }

  async createChama(insertChama: InsertChama): Promise<Chama> {
    const id = this.chamaIdCounter++;
    const now = new Date();
    const chama: Chama = {
      ...insertChama,
      id,
      memberCount: 1,
      balance: 0,
      establishedDate: now,
      createdAt: now
    };
    this.chamas.set(id, chama);
    
    // Create a wallet for the new chama
    await this.createWallet({ chamaId: id, currency: "KES" });
    
    // Add creator as a member with chairperson role
    await this.addChamaMember({
      chamaId: id,
      userId: insertChama.createdBy,
      role: "chairperson",
      isActive: true
    });
    
    return chama;
  }

  async updateChama(id: number, chamaData: Partial<Chama>): Promise<Chama | undefined> {
    const chama = await this.getChama(id);
    if (!chama) return undefined;
    
    const updatedChama: Chama = { ...chama, ...chamaData };
    this.chamas.set(id, updatedChama);
    return updatedChama;
  }

  // Chama members
  async getChamaMember(chamaId: number, userId: number): Promise<ChamaMember | undefined> {
    return Array.from(this.chamaMembers.values())
      .find(member => member.chamaId === chamaId && member.userId === userId);
  }

  async getChamaMembers(chamaId: number): Promise<ChamaMember[]> {
    return Array.from(this.chamaMembers.values())
      .filter(member => member.chamaId === chamaId);
  }

  async addChamaMember(insertMember: InsertChamaMember): Promise<ChamaMember> {
    const id = this.chamaMemberIdCounter++;
    const now = new Date();
    const member: ChamaMember = {
      ...insertMember,
      id,
      rating: 5,
      joinedAt: now
    };
    this.chamaMembers.set(id, member);
    
    // Update the member count in the chama
    const chama = await this.getChama(insertMember.chamaId);
    if (chama) {
      await this.updateChama(chama.id, { memberCount: chama.memberCount + 1 });
    }
    
    return member;
  }

  async updateChamaMember(id: number, memberData: Partial<ChamaMember>): Promise<ChamaMember | undefined> {
    const member = this.chamaMembers.get(id);
    if (!member) return undefined;
    
    const updatedMember: ChamaMember = { ...member, ...memberData };
    this.chamaMembers.set(id, updatedMember);
    return updatedMember;
  }

  // Wallets
  async getUserWallet(userId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values())
      .find(wallet => wallet.userId === userId);
  }

  async getChamaWallet(chamaId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values())
      .find(wallet => wallet.chamaId === chamaId);
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.walletIdCounter++;
    const now = new Date();
    const wallet: Wallet = {
      ...insertWallet,
      id,
      balance: 0,
      lastUpdated: now
    };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateWallet(id: number, walletData: Partial<Wallet>): Promise<Wallet | undefined> {
    const wallet = this.wallets.get(id);
    if (!wallet) return undefined;
    
    const updatedWallet: Wallet = {
      ...wallet,
      ...walletData,
      lastUpdated: new Date()
    };
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }

  // Transactions
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getChamaTransactions(chamaId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.chamaId === chamaId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: now
    };
    this.transactions.set(id, transaction);
    
    // Update wallet balances
    if (transaction.sourceWallet) {
      const sourceWallet = this.wallets.get(transaction.sourceWallet);
      if (sourceWallet) {
        await this.updateWallet(sourceWallet.id, {
          balance: sourceWallet.balance - transaction.amount
        });
      }
    }
    
    if (transaction.destinationWallet) {
      const destWallet = this.wallets.get(transaction.destinationWallet);
      if (destWallet) {
        await this.updateWallet(destWallet.id, {
          balance: destWallet.balance + transaction.amount
        });
      }
    }
    
    // Update chama balance if it's a chama transaction
    if (transaction.chamaId) {
      const chamaWallet = await this.getChamaWallet(transaction.chamaId);
      if (chamaWallet) {
        const chama = await this.getChama(transaction.chamaId);
        if (chama) {
          await this.updateChama(chama.id, {
            balance: chamaWallet.balance
          });
        }
      }
    }
    
    return transaction;
  }

  // Messages
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        message.senderId === userId || message.receiverId === userId
      )
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async getChamaMessages(chamaId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chamaId === chamaId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      sentAt: now
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: number, messageData: Partial<Message>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage: Message = { ...message, ...messageData };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Learning resources
  async getLearningResource(id: number): Promise<LearningResource | undefined> {
    return this.learningResources.get(id);
  }

  async getLearningResources(): Promise<LearningResource[]> {
    return Array.from(this.learningResources.values());
  }

  async getLearningResourcesByCategory(category: string): Promise<LearningResource[]> {
    return Array.from(this.learningResources.values())
      .filter(resource => resource.category === category);
  }

  async createLearningResource(insertResource: InsertLearningResource): Promise<LearningResource> {
    const id = this.learningResourceIdCounter++;
    const now = new Date();
    const resource: LearningResource = {
      ...insertResource,
      id,
      createdAt: now
    };
    this.learningResources.set(id, resource);
    return resource;
  }

  // Marketplace
  async getMarketplaceItem(id: number): Promise<MarketplaceItem | undefined> {
    return this.marketplaceItems.get(id);
  }

  async getMarketplaceItems(): Promise<MarketplaceItem[]> {
    return Array.from(this.marketplaceItems.values())
      .filter(item => item.isActive);
  }

  async getUserMarketplaceItems(userId: number): Promise<MarketplaceItem[]> {
    return Array.from(this.marketplaceItems.values())
      .filter(item => item.sellerId === userId && item.isActive);
  }

  async getChamaMarketplaceItems(chamaId: number): Promise<MarketplaceItem[]> {
    return Array.from(this.marketplaceItems.values())
      .filter(item => item.chamaId === chamaId && item.isActive);
  }

  async createMarketplaceItem(insertItem: InsertMarketplaceItem): Promise<MarketplaceItem> {
    const id = this.marketplaceItemIdCounter++;
    const now = new Date();
    const item: MarketplaceItem = {
      ...insertItem,
      id,
      isActive: true,
      createdAt: now
    };
    this.marketplaceItems.set(id, item);
    return item;
  }

  async updateMarketplaceItem(id: number, itemData: Partial<MarketplaceItem>): Promise<MarketplaceItem | undefined> {
    const item = this.marketplaceItems.get(id);
    if (!item) return undefined;
    
    const updatedItem: MarketplaceItem = { ...item, ...itemData };
    this.marketplaceItems.set(id, updatedItem);
    return updatedItem;
  }

  // AI Conversations
  async getAiConversation(id: number): Promise<AiConversation | undefined> {
    return this.aiConversations.get(id);
  }

  async getUserAiConversations(userId: number): Promise<AiConversation[]> {
    return Array.from(this.aiConversations.values())
      .filter(conversation => conversation.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async createAiConversation(insertConversation: InsertAiConversation): Promise<AiConversation> {
    const id = this.aiConversationIdCounter++;
    const now = new Date();
    const conversation: AiConversation = {
      ...insertConversation,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.aiConversations.set(id, conversation);
    return conversation;
  }

  async updateAiConversation(id: number, conversationData: Partial<AiConversation>): Promise<AiConversation | undefined> {
    const conversation = this.aiConversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation: AiConversation = {
      ...conversation,
      ...conversationData,
      updatedAt: new Date()
    };
    this.aiConversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Wishlist operations
  async getWishlistItem(userId: number, itemId: number): Promise<WishlistItem | undefined> {
    return Array.from(this.wishlistItems.values()).find(
      item => item.userId === userId && item.itemId === itemId
    );
  }

  async getUserWishlist(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values())
      .filter(item => item.userId === userId);
  }

  async addToWishlist(userId: number, itemId: number): Promise<WishlistItem> {
    const id = this.wishlistItemIdCounter++;
    const now = new Date();
    const wishlistItem: WishlistItem = {
      id,
      userId,
      itemId,
      createdAt: now
    };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: number, itemId: number): Promise<void> {
    const wishlistItem = await this.getWishlistItem(userId, itemId);
    if (wishlistItem) {
      this.wishlistItems.delete(wishlistItem.id);
    }
  }

  // Cart operations
  async getCartItem(userId: number, itemId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      item => item.userId === userId && item.itemId === itemId
    );
  }

  async getUserCart(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
  }

  async addToCart(userId: number, itemId: number, quantity: number): Promise<CartItem> {
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const cartItem: CartItem = {
      id,
      userId,
      itemId,
      quantity,
      createdAt: now
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(userId: number, itemId: number, data: Partial<CartItem>): Promise<CartItem | undefined> {
    const cartItem = await this.getCartItem(userId, itemId);
    if (!cartItem) return undefined;
    
    const updatedCartItem: CartItem = { ...cartItem, ...data };
    this.cartItems.set(cartItem.id, updatedCartItem);
    return updatedCartItem;
  }

  async removeFromCart(userId: number, itemId: number): Promise<void> {
    const cartItem = await this.getCartItem(userId, itemId);
    if (cartItem) {
      this.cartItems.delete(cartItem.id);
    }
  }

  async clearUserCart(userId: number): Promise<void> {
    const userCartItems = await this.getUserCart(userId);
    userCartItems.forEach(item => {
      this.cartItems.delete(item.id);
    });
  }

  // Order operations
  async createOrder(userId: number, totalAmount: number, items: { itemId: number; quantity: number; price: number }[]): Promise<Order> {
    const orderId = this.orderIdCounter++;
    const now = new Date();
    
    // Create order
    const order: Order = {
      id: orderId,
      userId,
      totalAmount,
      currency: 'KES',
      status: 'pending',
      createdAt: now
    };
    this.orders.set(orderId, order);

    // Create order items
    items.forEach(item => {
      const orderItemId = this.orderItemIdCounter++;
      const orderItem: OrderItem = {
        id: orderItemId,
        orderId,
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price,
        createdAt: now
      };
      this.orderItems.set(orderItemId, orderItem);
    });

    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId);
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<void> {
    // Delete user
    this.users.delete(id);

    // Delete associated data
    const userWallet = Array.from(this.wallets.values()).find(w => w.userId === id);
    if (userWallet) {
      this.wallets.delete(userWallet.id);
    }

    // Delete user's messages
    Array.from(this.messages.values())
      .filter(m => m.senderId === id || m.receiverId === id)
      .forEach(m => this.messages.delete(m.id));

    // Delete user's marketplace items
    Array.from(this.marketplaceItems.values())
      .filter(i => i.sellerId === id)
      .forEach(i => this.marketplaceItems.delete(i.id));

    // Delete user's chama memberships
    Array.from(this.chamaMembers.values())
      .filter(m => m.userId === id)
      .forEach(m => this.chamaMembers.delete(m.id));

    // Delete user's AI conversations
    Array.from(this.aiConversations.values())
      .filter(c => c.userId === id)
      .forEach(c => this.aiConversations.delete(c.id));

    // Delete user's wishlist items
    Array.from(this.wishlistItems.values())
      .filter(w => w.userId === id)
      .forEach(w => this.wishlistItems.delete(w.id));

    // Delete user's cart items
    Array.from(this.cartItems.values())
      .filter(c => c.userId === id)
      .forEach(c => this.cartItems.delete(c.id));

    // Delete user's orders
    Array.from(this.orders.values())
      .filter(o => o.userId === id)
      .forEach(o => {
        // Delete order items first
        Array.from(this.orderItems.values())
          .filter(oi => oi.orderId === o.id)
          .forEach(oi => this.orderItems.delete(oi.id));
        // Then delete the order
        this.orders.delete(o.id);
      });
  }

  async getChamaMembershipsByUserId(userId: number): Promise<ChamaMember[]> {
    return Array.from(this.chamaMembers.values())
      .filter(member => member.userId === userId);
  }
}

export const storage = new MemStorage();
