import {Request, Response} from "express";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {storage} from "../storage";
import {insertUserSchema} from "@shared/schema";

// Register validation schema
const registerSchema = insertUserSchema.extend({
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Register a new user
export async function register(req: Request, res: Response) {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
        return res.status(400).json({message: "Username already exists"});
    }

    const existingEmail = await storage.getUserByEmail(validatedData.email);
    if (existingEmail) {
        return res.status(400).json({message: "Email already exists"});
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create new user
    const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
    });

    // Create user wallet
    await storage.createWallet({
        userId: newUser.id,
        balance: 0,
        type: "user"
    });

    // Remove password from response
    const {password, ...userWithoutPassword} = newUser;

    return res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword
    });
}

// Login user
export async function login(req: Request, res: Response) {
    // Passport has already authenticated the user at this point
    if (!req.user) {
        return res.status(401).json({message: "Authentication failed"});
    }

    const user = req.user as any;
    const {password, ...userWithoutPassword} = user;

    return res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword
    });
}

// Get current user
export async function getCurrentUser(req: Request, res: Response) {
    if (!req.user) {
        return res.status(401).json({message: "Not authenticated"});
    }

    const user = req.user as any;
    const {password, ...userWithoutPassword} = user;

    return res.status(200).json({user: userWithoutPassword});
}

// Logout
export async function logout(req: Request, res: Response) {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({message: "Logout failed"});
        }
        res.status(200).json({message: "Logged out successfully"});
    });
}

// Get user by email/username
export async function getUserByEmailOrUsername(req: Request, res: Response) {
    const params = req.params;
    console.log(">> params: ", params);

    const body = req.body as {
        email: string | undefined,
        username: string | undefined,
        emailOrUsername: string | undefined,
    };

    body.emailOrUsername = body?.email || body?.username;
    if (!body?.emailOrUsername) {
        return res.status(400).json({
            detail: "Missing field `emailOrUsername`",
            code: 400,
            message: "Missing Email Or Username"
        });
    }

    // Check if a user with the given username/email exists
    const existingUser = await
            storage.getUserByUsername(body.emailOrUsername)
        || await storage.getUserByEmail(body.emailOrUsername);

    if (existingUser) {
        return res.status(200).json({
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email,
            name: existingUser.fullName,
            avatar: existingUser.profilePic,
        });
    }

    return res.status(404).json({
        code: 404,
        detail: "User not found",
        get message() {
            return this.detail;
        }
    });
}
