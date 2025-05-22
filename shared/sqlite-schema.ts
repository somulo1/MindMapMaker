import { sql } from 'drizzle-orm';
import { text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  profilePic: text("profile_pic"),
  location: text("location"),
  phoneNumber: text("phone_number"),
  role: text("role").default("user").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  lastActive: integer("last_active", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Chama (Group) model
export const chamas = sqliteTable("chamas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("groups"),
  iconBg: text("icon_bg").default("primary"),
  memberCount: integer("member_count").default(1).notNull(),
  balance: real("balance").default(0).notNull(),
  establishedDate: integer("established_date", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  nextMeeting: integer("next_meeting", { mode: "timestamp" }),
  createdBy: integer("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Chama Membership and Roles
export const chamaMembers = sqliteTable("chama_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chamaId: integer("chama_id").notNull().references(() => chamas.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").default("member").notNull(),
  contributionAmount: real("contribution_amount").default(0),
  contributionFrequency: text("contribution_frequency").default("monthly"),
  rating: integer("rating").default(5),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  joinedAt: integer("joined_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Wallet model
export const wallets = sqliteTable("wallets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  chamaId: integer("chama_id").references(() => chamas.id),
  balance: real("balance").default(0).notNull(),
  currency: text("currency").default("KES").notNull(),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Transaction model
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  chamaId: integer("chama_id").references(() => chamas.id),
  type: text("type").notNull(), // deposit, withdrawal, transfer, contribution
  amount: real("amount").notNull(),
  description: text("description"),
  sourceWallet: integer("source_wallet").references(() => wallets.id),
  destinationWallet: integer("destination_wallet").references(() => wallets.id),
  status: text("status").default("completed").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Notifications
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  relatedId: integer("related_id"),
});

// Messages
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  chamaId: integer("chama_id").references(() => chamas.id),
  itemId: integer("item_id"),
  content: text("content").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false).notNull(),
  isSystemMessage: integer("is_system_message", { mode: "boolean" }).default(false).notNull(),
  sentAt: integer("sent_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Learning resources
export const learningResources = sqliteTable("learning_resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  type: text("type").notNull(),
  duration: integer("duration"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Marketplace items
export const marketplaceItems = sqliteTable("marketplace_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  chamaId: integer("chama_id").references(() => chamas.id),
  title: text("title").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  currency: text("currency").default("KES").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  quantity: integer("quantity").default(1).notNull(),
  condition: text("condition").default("new"),
  location: text("location"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// MindMap model
export const mindMaps = sqliteTable("mind_maps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull().references(() => users.id),
  nodes: text("nodes").notNull().default('[]'), // Store JSON as text in SQLite
  edges: text("edges").notNull().default('[]'), // Store JSON as text in SQLite
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// AI Conversations
export const aiConversations = sqliteTable("ai_conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  messages: text("messages").notNull().default('[]'), // Store JSON as text
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Wishlist items
export const wishlistItems = sqliteTable("wishlist_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => marketplaceItems.id),
  addedAt: integer("added_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Chama invitations
export const chamaInvitations = sqliteTable("chama_invitations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chamaId: integer("chama_id").notNull().references(() => chamas.id),
  invitedUserId: integer("invited_user_id").notNull().references(() => users.id),
  invitedByUserId: integer("invited_by_user_id").notNull().references(() => users.id),
  role: text("role").default("member").notNull(),
  status: text("status").default("pending").notNull(),
  invitedAt: integer("invited_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  respondedAt: integer("responded_at", { mode: "timestamp" }),
});

// Cart items
export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => marketplaceItems.id),
  quantity: integer("quantity").default(1).notNull(),
  addedAt: integer("added_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Orders
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").default("pending").notNull(),
  totalAmount: real("total_amount").notNull(),
  currency: text("currency").default("KES").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Order items
export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id),
  itemId: integer("item_id").notNull().references(() => marketplaceItems.id),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  currency: text("currency").default("KES").notNull(),
});

// Contributions
export const contributions = sqliteTable("contributions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  chamaId: integer("chama_id").notNull().references(() => chamas.id),
  amount: real("amount").notNull(),
  currency: text("currency").default("KES").notNull(),
  status: text("status").default("pending").notNull(),
  paymentMethod: text("payment_method"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Meetings
export const meetings = sqliteTable("meetings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chamaId: integer("chama_id").notNull().references(() => chamas.id),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  scheduledFor: integer("scheduled_for", { mode: "timestamp" }).notNull(),
  duration: integer("duration").default(60), // in minutes
  status: text("status").default("scheduled").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  role: true,
  isActive: true,
  lastActive: true,
});

export const insertChamaSchema = createInsertSchema(chamas).omit({
  id: true,
  memberCount: true,
  balance: true,
  establishedDate: true,
  createdAt: true,
});

export const insertChamaMemberSchema = createInsertSchema(chamaMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  balance: true,
  lastUpdated: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  isSystemMessage: true,
  sentAt: true,
});

export const insertLearningResourceSchema = createInsertSchema(learningResources).omit({
  id: true,
  createdAt: true,
});

export const insertMindMapSchema = createInsertSchema(mindMaps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChamaInvitationSchema = createInsertSchema(chamaInvitations).omit({
  id: true,
  invitedAt: true,
  respondedAt: true,
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({
  id: true,
  addedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Chama = typeof chamas.$inferSelect;
export type InsertChama = z.infer<typeof insertChamaSchema>;

export type ChamaMember = typeof chamaMembers.$inferSelect;
export type InsertChamaMember = z.infer<typeof insertChamaMemberSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Notification = typeof notifications.$inferSelect;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type LearningResource = typeof learningResources.$inferSelect;
export type InsertLearningResource = z.infer<typeof insertLearningResourceSchema>;

export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;

export type MindMap = typeof mindMaps.$inferSelect;
export type InsertMindMap = z.infer<typeof insertMindMapSchema>;

// Extended type for chama member with user details
export type ChamaMemberWithUser = ChamaMember & {
  user: Pick<User, "id" | "username" | "fullName" | "email" | "profilePic" | "location" | "phoneNumber">;
};

// Export types for new tables
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;

export type ChamaInvitation = typeof chamaInvitations.$inferSelect;
export type InsertChamaInvitation = z.infer<typeof insertChamaInvitationSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>; 