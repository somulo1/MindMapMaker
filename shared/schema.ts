import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  profilePic: text("profile_pic"),
  location: text("location"),
  phoneNumber: text("phone_number"),
  role: text("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  role: true,
  isActive: true,
  lastActive: true,
});

// Export types
export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  profilePic: string | null;
  location: string | null;
  phoneNumber: string | null;
  role: string;
  isActive: boolean;
  lastActive: Date | null;
  createdAt: Date;
};

export type InsertUser = z.infer<typeof insertUserSchema>;

// Chama (Group) model
export const chamas = pgTable("chamas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("groups"),
  iconBg: text("icon_bg").default("primary"),
  memberCount: integer("member_count").default(1).notNull(),
  balance: doublePrecision("balance").default(0).notNull(),
  establishedDate: timestamp("established_date").defaultNow().notNull(),
  nextMeeting: timestamp("next_meeting"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChamaSchema = createInsertSchema(chamas).omit({
  id: true,
  memberCount: true,
  balance: true,
  establishedDate: true,
  createdAt: true,
});

// Chama Membership and Roles
export const chamaMembers = pgTable("chama_members", {
  id: serial("id").primaryKey(),
  chamaId: integer("chama_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").default("member").notNull(),
  contributionAmount: doublePrecision("contribution_amount").default(0),
  contributionFrequency: text("contribution_frequency").default("monthly"),
  rating: integer("rating").default(5),
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertChamaMemberSchema = createInsertSchema(chamaMembers).omit({
  id: true,
  joinedAt: true,
});

// Export types
export type Chama = typeof chamas.$inferSelect;
export type InsertChama = z.infer<typeof insertChamaSchema>;

export type ChamaMember = typeof chamaMembers.$inferSelect;
export type InsertChamaMember = z.infer<typeof insertChamaMemberSchema>;

// Extended type for chama member with user details
export type ChamaMemberWithUser = ChamaMember & {
  user: Pick<User, "id" | "username" | "fullName" | "email" | "profilePic" | "location" | "phoneNumber">;
};

// Wallet model
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  chamaId: integer("chama_id"),
  balance: doublePrecision("balance").default(0).notNull(),
  currency: text("currency").default("KES").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  balance: true,
  lastUpdated: true,
});

// Transaction model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  chamaId: integer("chama_id"),
  type: text("type").notNull(), // deposit, withdrawal, transfer, contribution
  amount: doublePrecision("amount").notNull(),
  description: text("description"),
  sourceWallet: integer("source_wallet"),
  destinationWallet: integer("destination_wallet"),
  status: text("status").default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // contribution_due, meeting_scheduled, loan_approved, etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  relatedId: integer("related_id"), // Could reference a meeting, contribution, etc.
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id"),
  chamaId: integer("chama_id"),
  itemId: integer("item_id"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isSystemMessage: boolean("is_system_message").default(false).notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  isSystemMessage: true,
  sentAt: true,
});

// Learning resources
export const learningResources = pgTable("learning_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  imageUrl: text("image_url"),
  category: text("category").notNull(), // basics, intermediate, advanced
  type: text("type").notNull(), // article, video, tutorial
  duration: integer("duration"), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLearningResourceSchema = createInsertSchema(learningResources).omit({
  id: true,
  createdAt: true,
});

// Marketplace items
export const marketplaceItems = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  chamaId: integer("chama_id"),
  title: text("title").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  currency: text("currency").default("KES").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  quantity: integer("quantity").default(1).notNull(),
  condition: text("condition").default("new"),
  location: text("location"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

// Wishlist items
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cart items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  currency: text("currency").default("KES").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Assistant conversations
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  messages: jsonb("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, read: true });
// Export types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type LearningResource = typeof learningResources.$inferSelect;
export type InsertLearningResource = z.infer<typeof insertLearningResourceSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;

// Chama Invitations
export const chamaInvitations = pgTable("chama_invitations", {
  id: serial("id").primaryKey(),
  chamaId: integer("chama_id").notNull().references(() => chamas.id),
  invitedUserId: integer("invited_user_id").notNull().references(() => users.id),
  invitedByUserId: integer("invited_by_user_id").notNull().references(() => users.id),
  role: text("role").default("member").notNull(),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

export const insertChamaInvitationSchema = createInsertSchema(chamaInvitations).omit({
  id: true,
  invitedAt: true,
  respondedAt: true,
});

export type ChamaInvitation = typeof chamaInvitations.$inferSelect;
export type InsertChamaInvitation = z.infer<typeof insertChamaInvitationSchema>;

// Contributions
export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  chamaId: integer("chama_id").notNull(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").default("pending").notNull(), // pending, paid, overdue
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  paidAt: true,
  createdAt: true,
});

export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;

// Meetings
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  chamaId: integer("chama_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledFor: text("scheduled_for").notNull(),
  location: text("location"),
  agenda: text("agenda"),
  status: text("status").default("upcoming").notNull(), // upcoming, completed, cancelled
  minutes: jsonb("minutes"), // { content: string, fileUrl?: string }
  createdAt: text("created_at").default(new Date().toISOString()).notNull(),
  updatedAt: text("updated_at").default(new Date().toISOString()).notNull(),
});

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = typeof meetings.$inferInsert;
