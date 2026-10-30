/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Listing, Order, MarketPrice, User, CropType, CropGrade, USSDSession, PriceHistoryEntry } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Lazy-initialized Gemini Client to prevent app crashes on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGemini() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } else {
      console.warn("[Gemini API] GEMINI_API_KEY is missing or holds placeholder value. Running in simulation-fallback mode.");
    }
  }
  return aiClient;
}

// ==========================================
// IN-MEMORY DATA STORAGE (Simulating PostgreSQL + Redis Cache)
// ==========================================
let listings: Listing[] = [
  {
    id: "list-1",
    farmerId: "farm-wanjala",
    farmerName: "Wanjala Kiprop",
    crop: "maize",
    grade: "Grade 1",
    quantity: 120,
    unit: "90kg Bag",
    pricePerUnit: 4200,
    location: "Eldoret",
    imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop&q=60",
    status: "available",
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    priceHistory: [
      { price: 4050, changedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), note: "Initial harvest listing" },
      { price: 4200, previousPrice: 4050, changedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: "Adjusted to Eldoret NCPB market rate (+3.7%)" }
    ],
    lastSyncedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "list-2",
    farmerId: "farm-mwende",
    farmerName: "Grace Mwende",
    crop: "sorghum",
    grade: "Grade 1",
    quantity: 45,
    unit: "90kg Bag",
    pricePerUnit: 3800,
    location: "Meru",
    status: "available",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    priceHistory: [
      { price: 3800, changedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), note: "Initial harvest listing" }
    ],
    lastSyncedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "list-3",
    farmerId: "farm-kamau",
    farmerName: "Kamau Mwangi",
    crop: "chili",
    grade: "Grade 1",
    quantity: 250,
    unit: "kg",
    pricePerUnit: 280,
    location: "Nyandarua",
    imageUrl: "https://images.unsplash.com/photo-1588252303782-cb80119cb2bb?w=400&auto=format&fit=crop&q=60",
    status: "available",
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    priceHistory: [
      { price: 260, changedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: "Initial harvest listing" },
      { price: 280, previousPrice: 260, changedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), note: "Export grade quality premium (+7.7%)" }
    ],
    lastSyncedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: "list-4",
    farmerId: "farm-omondi",
    farmerName: "Amina Omondi",
    crop: "ginger",
    grade: "Grade 2",
    quantity: 180,
    unit: "kg",
    pricePerUnit: 190,
    location: "Kakamega",
    status: "available",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    priceHistory: [
      { price: 200, changedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), note: "Initial harvest listing" },
      { price: 190, previousPrice: 200, changedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: "Competitive local Kakamega discount (-5.0%)" }
    ],
    lastSyncedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "list-5",
    farmerId: "farm-wanjala",
    farmerName: "Wanjala Kiprop",
    crop: "millet",
    grade: "Grade 1",
    quantity: 80,
    unit: "90kg Bag",
    pricePerUnit: 5100,
    location: "Eldoret",
    status: "available",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    priceHistory: [
      { price: 5100, changedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), note: "Initial harvest listing" }
    ],
    lastSyncedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: "list-6",
    farmerId: "farm-kariuki",
    farmerName: "David Kariuki",
    crop: "maize",
    grade: "Grade 2",
    quantity: 150,
    unit: "90kg Bag",
    pricePerUnit: 3950,
    location: "Nakuru",
    imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop&q=60",
    status: "available",
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    priceHistory: [
      { price: 4100, changedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), note: "Initial harvest listing" },
      { price: 3950, previousPrice: 4100, changedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), note: "Fast-dispatch clearance discount (-3.7%)" }
    ],
    lastSyncedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: "list-7",
    farmerId: "farm-wanjala",
    farmerName: "Wanjala Kiprop",
    crop: "wheat",
    grade: "Grade 1",
    quantity: 90,
    unit: "90kg Bag",
    pricePerUnit: 4800,
    location: "Eldoret",
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=60",
    status: "available",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    priceHistory: [
      { price: 4800, changedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: "Initial harvest listing" }
    ],
    lastSyncedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "list-8",
    farmerId: "farm-otieno",
    farmerName: "Otieno Odhiambo",
    crop: "sorghum",
    grade: "Grade 2",
    quantity: 60,
    unit: "90kg Bag",
    pricePerUnit: 3600,
    location: "Kisumu",
    imageUrl: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&auto=format&fit=crop&q=60",
    status: "available",
    createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    priceHistory: [
      { price: 3600, changedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(), note: "Initial harvest listing" }
    ],
    lastSyncedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString()
  }
];

let orders: Order[] = [
  {
    id: "ord-1",
    listingId: "list-2",
    crop: "sorghum",
    quantity: 10,
    unit: "90kg Bag",
    buyerId: "user-dante",
    buyerName: "Dante Geeks",
    buyerPhone: "+254712345678",
    farmerId: "farm-mwende",
    farmerName: "Grace Mwende",
    totalAmount: 38000,
    escrowStatus: "Deposited",
    paymentStatus: "paid",
    status: "dispatched",
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    dispatchedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    waybillNumber: "WB-582914",
    deliveryNotes: "Cargo dispatched via NorthRift Freight lorry reg KCB 419X. Expected Eldoret-Nairobi depot delivery today 4:00 PM.",
    location: "Meru"
  },
  {
    id: "ord-2",
    listingId: "list-1",
    crop: "maize",
    quantity: 25,
    unit: "90kg Bag",
    buyerId: "user-dante",
    buyerName: "Dante Geeks",
    buyerPhone: "+254712345678",
    farmerId: "farm-wanjala",
    farmerName: "Wanjala Kiprop",
    totalAmount: 106200,
    escrowStatus: "Deposited",
    paymentStatus: "paid",
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    location: "Eldoret",
    deliveryNotes: "Awaiting farmer dispatch confirmation from Eldoret warehouse depot."
  },
  {
    id: "ord-3",
    listingId: "list-4",
    crop: "chili",
    quantity: 50,
    unit: "kg",
    buyerId: "user-dante",
    buyerName: "Dante Geeks",
    buyerPhone: "+254712345678",
    farmerId: "farm-wanjala",
    farmerName: "Wanjala Kiprop",
    totalAmount: 14700,
    escrowStatus: "Disbursed",
    paymentStatus: "paid",
    status: "completed",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    dispatchedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    waybillNumber: "WB-419082",
    deliveryNotes: "Quality verified upon receipt: moisture content 11.2%, pungency standard approved.",
    location: "Eldoret"
  },
  {
    id: "ord-4",
    listingId: "list-3",
    crop: "millet",
    quantity: 15,
    unit: "90kg Bag",
    buyerId: "user-dante",
    buyerName: "Dante Geeks",
    buyerPhone: "+254712345678",
    farmerId: "farm-mwende",
    farmerName: "Grace Mwende",
    totalAmount: 76200,
    escrowStatus: "Pending",
    paymentStatus: "unpaid",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    location: "Nakuru",
    deliveryNotes: "Provisional quotation reserved pending buyer Daraja STK escrow deposit."
  }
];

const marketPrices: MarketPrice[] = [
  { id: "p-1", crop: "maize", grade: "Grade 1", avgPrice: 4250, unit: "90kg Bag", location: "Eldoret", changePercent: 1.8, updatedAt: new Date().toISOString() },
  { id: "p-2", crop: "maize", grade: "Grade 1", avgPrice: 4400, unit: "90kg Bag", location: "Nairobi", changePercent: 0.5, updatedAt: new Date().toISOString() },
  { id: "p-3", crop: "sorghum", grade: "Grade 1", avgPrice: 3850, unit: "90kg Bag", location: "Meru", changePercent: -0.8, updatedAt: new Date().toISOString() },
  { id: "p-4", crop: "millet", grade: "Grade 1", avgPrice: 5200, unit: "90kg Bag", location: "Nakuru", changePercent: 2.4, updatedAt: new Date().toISOString() },
  { id: "p-5", crop: "chili", grade: "Grade 1", avgPrice: 290, unit: "kg", location: "Nairobi", changePercent: 5.1, updatedAt: new Date().toISOString() },
  { id: "p-6", crop: "ginger", grade: "Grade 1", avgPrice: 210, unit: "kg", location: "Kakamega", changePercent: -1.2, updatedAt: new Date().toISOString() }
];

// Helper to sanitize & normalize Kenyan phone numbers to E.164 (+254...)
function normalizeKenyanPhone(raw: string): string {
  if (!raw) return "";
  let clean = raw.trim().replace(/[\s\-\(\)]/g, "");
  if (clean.startsWith("+254")) return clean;
  if (clean.startsWith("254")) return `+${clean}`;
  if (clean.startsWith("0")) return `+254${clean.slice(1)}`;
  if (/^[17]\d{8}$/.test(clean)) return `+254${clean}`;
  return clean.startsWith("+") ? clean : `+${clean}`;
}

let demoUsers: User[] = [
  {
    id: "user-dante",
    name: "Dante Geeks",
    phone: "+254712345678",
    role: "buyer",
    location: "Nairobi",
    locale: "en",
    pin: "1234",
    businessName: "Dante Millers & Grain Processors Ltd",
    businessType: "Miller / Flour Processor",
    monthlyDemandVolume: "500 - 1,000 Bags",
    kraPin: "P051289410A",
    payoutChannel: "Safaricom M-Pesa",
    mpesaNumber: "+254712345678",
    verified: true,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "farm-wanjala",
    name: "Wanjala Kiprop",
    phone: "+254701234567",
    role: "farmer",
    location: "Eldoret",
    locale: "en",
    pin: "1234",
    farmName: "Chepkoilel Grain & Wheat Estate",
    farmSizeAcres: "20 - 50 Acres",
    primaryCrops: ["maize", "wheat", "millet"],
    cooperative: "Uasin Gishu Grain Growers Coop",
    payoutChannel: "Safaricom M-Pesa",
    mpesaNumber: "+254701234567",
    verified: true,
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "farm-mwende",
    name: "Grace Mwende",
    phone: "+254722334455",
    role: "farmer",
    location: "Meru",
    locale: "sw",
    pin: "1234",
    farmName: "Mwende Mount Kenya Shamba",
    farmSizeAcres: "5 - 20 Acres",
    primaryCrops: ["sorghum", "beans"],
    cooperative: "Meru Central Coffee & Cereal Union",
    payoutChannel: "Safaricom M-Pesa",
    mpesaNumber: "+254722334455",
    verified: true,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: "farm-kamau",
    name: "Kamau Mwangi",
    phone: "+254733445566",
    role: "farmer",
    location: "Nyandarua",
    locale: "en",
    pin: "1234",
    farmName: "Aberdare Horticultural & Chili Ranch",
    farmSizeAcres: "5 - 20 Acres",
    primaryCrops: ["chili", "ginger"],
    cooperative: "Nyandarua Spice Growers Network",
    payoutChannel: "Safaricom M-Pesa",
    mpesaNumber: "+254733445566",
    verified: true,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  }
];

// Current session user initialized to null to allow separate login screens
let currentUser: User | null = null;

// State store for active USSD sessions
const ussdSessions: Record<string, USSDSession> = {};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Authenticated current user
app.get("/api/auth/me", (req: Request, res: Response) => {
  res.json(currentUser);
});

// Get all demo/registered profiles for login selection & inspection
app.get("/api/auth/demo-users", (req: Request, res: Response) => {
  res.json(demoUsers);
});

// First-class Account Creation / Registration Endpoint
app.post("/api/auth/register", (req: Request, res: Response) => {
  const {
    name,
    phone,
    role,
    location,
    locale,
    pin,
    email,
    farmName,
    farmSizeAcres,
    primaryCrops,
    cooperative,
    businessName,
    businessType,
    kraPin,
    monthlyDemandVolume,
    payoutChannel,
    mpesaNumber
  } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: "Full Name or Business Legal Name is required." });
    return;
  }

  if (!phone || !phone.trim()) {
    res.status(400).json({ error: "Kenyan Phone / M-Pesa Number is required." });
    return;
  }

  if (!role || !["farmer", "buyer"].includes(role)) {
    res.status(400).json({ error: "Valid Account Role (Farmer or Buyer) is required." });
    return;
  }

  const normalizedPhone = normalizeKenyanPhone(phone);

  // Check if an account already exists with this phone and role
  const existingUser = demoUsers.find(
    u => normalizeKenyanPhone(u.phone) === normalizedPhone && u.role === role
  );

  if (existingUser) {
    res.status(409).json({
      error: `An account already exists for ${normalizedPhone} as a ${role === "farmer" ? "Farmer" : "Wholesale Buyer"}. Please sign in with your PIN.`,
      user: existingUser
    });
    return;
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    phone: normalizedPhone,
    role: role as "farmer" | "buyer",
    location: location || (role === "farmer" ? "Eldoret" : "Nairobi"),
    locale: (locale || "en") as "en" | "sw",
    email: email?.trim() || undefined,
    pin: pin?.trim() || "1234",
    farmName: role === "farmer" ? (farmName?.trim() || `${name.trim()}'s Shamba`) : undefined,
    farmSizeAcres: role === "farmer" ? farmSizeAcres : undefined,
    primaryCrops: role === "farmer" ? (Array.isArray(primaryCrops) && primaryCrops.length > 0 ? primaryCrops : ["maize"]) : undefined,
    cooperative: role === "farmer" ? cooperative?.trim() : undefined,
    businessName: role === "buyer" ? (businessName?.trim() || `${name.trim()} Trading Enterprise`) : undefined,
    businessType: role === "buyer" ? businessType : undefined,
    kraPin: role === "buyer" ? kraPin?.trim() : undefined,
    monthlyDemandVolume: role === "buyer" ? monthlyDemandVolume : undefined,
    payoutChannel: payoutChannel || "Safaricom M-Pesa",
    mpesaNumber: mpesaNumber ? normalizeKenyanPhone(mpesaNumber) : normalizedPhone,
    verified: true,
    createdAt: new Date().toISOString()
  };

  demoUsers.unshift(newUser);
  currentUser = newUser;
  console.log(`[Auth Register] Successfully created new ${newUser.role} account for: ${newUser.name} (${newUser.phone})`);

  res.status(201).json({
    success: true,
    message: "Account created successfully with instant SafeTrade verification.",
    user: newUser
  });
});

// Core Login & Authentication Endpoint (by phone + role + optional PIN)
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { name, phone, role, location, locale, pin } = req.body;
  
  if (!phone || !role) {
    res.status(400).json({ error: "Phone and Role are required to login." });
    return;
  }

  const normalizedPhone = normalizeKenyanPhone(phone);

  // Find existing demo user or registered user
  let user = demoUsers.find(
    u => normalizeKenyanPhone(u.phone) === normalizedPhone && u.role === role
  );

  if (user) {
    // If PIN is provided and user has a PIN, verify
    if (pin && user.pin && pin !== user.pin) {
      res.status(401).json({ error: "Incorrect 4-digit security PIN. Default demo PIN is 1234." });
      return;
    }
  } else {
    // Register new user on-the-fly to support flexible arbitrary entries!
    const fallbackName = name || (role === "farmer" ? "Mama Kenya" : "Kip Bulk Trader");
    user = {
      id: `user-${Date.now()}`,
      name: fallbackName,
      phone: normalizedPhone,
      role: role as "farmer" | "buyer",
      location: location || (role === "farmer" ? "Eldoret" : "Nairobi"),
      locale: (locale || "en") as "en" | "sw",
      pin: pin || "1234",
      payoutChannel: "Safaricom M-Pesa",
      mpesaNumber: normalizedPhone,
      verified: true,
      createdAt: new Date().toISOString()
    };
    demoUsers.unshift(user);
    console.log(`[Auth Register] Quick-created user profile: ${user.name} (${user.role})`);
  }

  currentUser = user;
  res.json(currentUser);
});

// Logout endpoint
app.post("/api/auth/logout", (req: Request, res: Response) => {
  console.log(`[Auth Logout] Cleared active user session: ${currentUser?.name || "Guest"}`);
  currentUser = null;
  res.json({ success: true });
});

// Update user context (simulating profile edit, role toggle & Swahili locale toggle)
app.post("/api/auth/update", (req: Request, res: Response) => {
  const updates = req.body;
  if (currentUser) {
    Object.assign(currentUser, updates);
    // Also sync in demoUsers list
    const idx = demoUsers.findIndex(u => u.id === currentUser?.id);
    if (idx !== -1) {
      demoUsers[idx] = { ...demoUsers[idx], ...updates };
    }
  }
  res.json(currentUser);
});

// Get market prices (with fake redis speed optimization)
app.get("/api/market-prices", (req: Request, res: Response) => {
  // Simulate lightning-fast response as if retrieved from high-performance Redis Cache container
  res.setHeader("X-Cache", "HIT - Redis Container");
  res.json(marketPrices);
});

// GET crop listings with optional query filtering (Maize/Beans/Spice, Grade, Location)
app.get("/api/listings", (req: Request, res: Response) => {
  const { crop, grade, location } = req.query;
  let filtered = [...listings];

  if (crop && crop !== "all") {
    filtered = filtered.filter(l => l.crop === crop);
  }
  if (grade && grade !== "all") {
    filtered = filtered.filter(l => l.grade === grade);
  }
  if (location && location !== "all") {
    filtered = filtered.filter(l => l.location.toLowerCase() === (location as string).toLowerCase());
  }

  res.json(filtered);
});

// POST to create a crop listing from the web interface
app.post("/api/listings", (req: Request, res: Response) => {
  const { crop, grade, quantity, pricePerUnit, location, unit, imageUrl } = req.body;
  
  if (!crop || !grade || !quantity || !pricePerUnit || !location) {
    res.status(400).json({ error: "Missing required listing fields" });
    return;
  }

  const newListing: Listing = {
    id: `list-${Date.now()}`,
    farmerId: currentUser ? currentUser.id : "farm-wanjala",
    farmerName: currentUser ? currentUser.name : "Wanjala Kiprop",
    crop: crop as CropType,
    grade: grade as CropGrade,
    quantity: Number(quantity),
    unit: unit || (["chili", "ginger"].includes(crop) ? "kg" : "90kg Bag"),
    pricePerUnit: Number(pricePerUnit),
    location,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&auto=format&fit=crop&q=60",
    status: "available",
    createdAt: new Date().toISOString(),
    priceHistory: [
      {
        price: Number(pricePerUnit),
        changedAt: new Date().toISOString(),
        note: "Initial harvest listing"
      }
    ],
    lastSyncedAt: new Date().toISOString()
  };

  listings.unshift(newListing);
  console.log(`[Listing Created & Synced] #${newListing.id}: ${newListing.crop} (${newListing.quantity} ${newListing.unit}) @ KES ${newListing.pricePerUnit} in ${newListing.location}`);
  res.status(201).json(newListing);
});

// PUT to edit/update an existing crop listing with price tracking
app.put("/api/listings/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { crop, grade, quantity, pricePerUnit, location, unit, status, imageUrl, reason } = req.body;
  const idx = listings.findIndex(l => l.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const existing = listings[idx];
  const oldPrice = existing.pricePerUnit;
  const newPrice = pricePerUnit !== undefined && pricePerUnit !== null ? Number(pricePerUnit) : oldPrice;

  // Track price history if price changed or initialize if empty
  const history: PriceHistoryEntry[] = existing.priceHistory && existing.priceHistory.length > 0
    ? [...existing.priceHistory]
    : [
      { price: oldPrice, changedAt: existing.createdAt, note: "Initial harvest listing" }
    ];

  if (newPrice !== oldPrice) {
    const diff = newPrice - oldPrice;
    const diffPct = ((diff / oldPrice) * 100).toFixed(1);
    const sign = diff > 0 ? "+" : "";
    history.push({
      price: newPrice,
      previousPrice: oldPrice,
      changedAt: new Date().toISOString(),
      note: reason || `Price revision: ${sign}KES ${Math.abs(diff)} (${sign}${diffPct}%)`
    });
  }

  const updatedListing: Listing = {
    ...existing,
    crop: (crop || existing.crop) as CropType,
    grade: (grade || existing.grade) as CropGrade,
    quantity: quantity !== undefined && quantity !== null ? Number(quantity) : existing.quantity,
    pricePerUnit: newPrice,
    location: location || existing.location,
    unit: unit || existing.unit,
    status: (status || existing.status) as 'available' | 'sold',
    imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
    priceHistory: history,
    lastSyncedAt: new Date().toISOString()
  };

  listings[idx] = updatedListing;
  console.log(`[Listing Updated & Synced] #${id}: ${updatedListing.crop} (${updatedListing.quantity} ${updatedListing.unit}) @ KES ${updatedListing.pricePerUnit} (was KES ${oldPrice})`);
  res.json(updatedListing);
});

// DELETE endpoint to remove a listing
app.delete("/api/listings/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = listings.findIndex(l => l.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const removed = listings.splice(idx, 1)[0];
  console.log(`[Listing Deleted] #${id}: ${removed.crop} by ${removed.farmerName}`);
  res.json({ success: true, removedId: id });
});

// POST endpoint using Gemini API to parse voice translation / unstructured text for farmer listings
app.post("/api/listings/create-from-voice", async (req: Request, res: Response): Promise<void> => {
  const { rawText, farmerName } = req.body;
  if (!rawText) {
    res.status(400).json({ error: "Raw translation text is required" });
    return;
  }

  const gemini = getGemini();

  if (!gemini) {
    // Elegant fallback mock algorithm parser when Gemini key is not provided (perfect local coverage)
    console.log("[Simulation] No Gemini API key located. Running internal keywords parser.");
    const textLower = rawText.toLowerCase();
    
    // Parse crop
    let crop: CropType = "maize";
    if (textLower.includes("sorghum") || textLower.includes("mtama")) crop = "sorghum";
    else if (textLower.includes("millet") || textLower.includes("wimbi")) crop = "millet";
    else if (textLower.includes("chili") || textLower.includes("pilipili")) crop = "chili";
    else if (textLower.includes("ginger") || textLower.includes("tangawizi")) crop = "ginger";
    else if (textLower.includes("beans") || textLower.includes("maharagwe")) crop = "beans";
    else if (textLower.includes("wheat") || textLower.includes("ngano")) crop = "wheat";

    // Parse grade
    let grade: CropGrade = "Grade 1";
    if (textLower.includes("grade 2") || textLower.includes("daraja la pili")) grade = "Grade 2";
    else if (textLower.includes("grade 3") || textLower.includes("daraja la tatu")) grade = "Grade 3";

    // Parse location
    let location = "Eldoret";
    if (textLower.includes("nyandarua")) location = "Nyandarua";
    else if (textLower.includes("meru")) location = "Meru";
    else if (textLower.includes("nakuru")) location = "Nakuru";
    else if (textLower.includes("uasin gishu")) location = "Eldoret";
    else if (textLower.includes("kakamega")) location = "Kakamega";

    // Parse quantity
    const quantityMatch = rawText.match(/\d+/);
    const quantity = quantityMatch ? parseInt(quantityMatch[0]) : 50;

    // Parse price
    const priceMatch = rawText.match(/(?:bei ya|kes|sh|shilingi|\d+\s*sh)\s*(\d+)/i) || rawText.match(/\d+/g);
    let pricePerUnit = 3500;
    if (priceMatch && priceMatch.length > 1) {
      pricePerUnit = parseInt(priceMatch[1]);
    } else if (priceMatch && priceMatch.length === 1) {
      pricePerUnit = parseInt(priceMatch[0]) > 1000 ? parseInt(priceMatch[0]) : 3500;
    }

    const unit = ["chili", "ginger"].includes(crop) ? "kg" : "90kg Bag";

    const simulatedListing: Listing = {
      id: `list-${Date.now()}`,
      farmerId: "farm-voice",
      farmerName: farmerName || "Kamau Kiprop",
      crop,
      grade,
      quantity,
      unit,
      pricePerUnit,
      location,
      status: "available",
      createdAt: new Date().toISOString()
    };

    listings.unshift(simulatedListing);
    res.json({ success: true, listing: simulatedListing, mode: "simulated-local" });
    return;
  }

  try {
    // Generate content using gemini-3.5-flash as prescribed in general text tasks
    const systemInstruction = 
      "You are an African Agri-Tech intelligence parsing engine for Kilimo Marketplace. " +
      "Analyze the farmer's English or Swahili unstructured spoken transcription text. " +
      "Extract: crop, grade, quantity, pricePerUnit, location, and unit.\n" +
      "Supported metrics:\n" +
      "- crop: must be exactly one of: 'maize', 'sorghum', 'millet', 'chili', 'ginger', 'beans', 'wheat'\n" +
      "- grade: must be exactly 'Grade 1', 'Grade 2', or 'Grade 3'\n" +
      "- quantity: integer number representing volume\n" +
      "- pricePerUnit: integer representing KES price per unit\n" +
      "- location: Kenyan county/town name, standard capitalized (e.g. 'Nyandarua', 'Eldoret', 'Meru')\n" +
      "- unit: grains (maize, sorghum, millet, beans, wheat) default to '90kg Bag'. Spices (chili, ginger) default to 'kg'.\n" +
      "Always return valid JSON parsing matches of the required schema.";

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: rawText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING, description: "Crop name matching maize/sorghum/millet/chili/ginger/beans/wheat" },
            grade: { type: Type.STRING, description: "Grade 1, Grade 2, or Grade 3" },
            quantity: { type: Type.INTEGER, description: "Total quantity volume" },
            pricePerUnit: { type: Type.INTEGER, description: "KES price per bag or kg" },
            location: { type: Type.STRING, description: "Kenyan origin town or county" },
            unit: { type: Type.STRING, description: "90kg Bag or kg" },
          },
          required: ["crop", "grade", "quantity", "pricePerUnit", "location", "unit"]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    const extracted = JSON.parse(resultText);

    const generatedListing: Listing = {
      id: `list-${Date.now()}`,
      farmerId: "farm-voice",
      farmerName: farmerName || "Kamau Kiprop",
      crop: (extracted.crop || "maize") as CropType,
      grade: (extracted.grade || "Grade 1") as CropGrade,
      quantity: Number(extracted.quantity) || 50,
      unit: extracted.unit || (["chili", "ginger"].includes(extracted.crop) ? "kg" : "90kg Bag"),
      pricePerUnit: Number(extracted.pricePerUnit) || 4000,
      location: extracted.location || "Eldoret",
      status: "available",
      createdAt: new Date().toISOString(),
      priceHistory: [
        {
          price: Number(extracted.pricePerUnit) || 4000,
          changedAt: new Date().toISOString(),
          note: "Voice-assisted harvest listing parsed via Gemini"
        }
      ],
      lastSyncedAt: new Date().toISOString()
    };

    listings.unshift(generatedListing);
    res.json({ success: true, listing: generatedListing, mode: "gemini-powered" });
  } catch (error: any) {
    console.error("[Gemini API Error] Failed to generate structured listing:", error.message);
    res.status(500).json({ error: "Gemini voice-text analysis stalled. Reverting to manual entry form inputs." });
  }
});

// GET orders
app.get("/api/orders", (req: Request, res: Response) => {
  res.json(orders);
});

// POST to create standard order + Initialize Escrow Pending
app.post("/api/orders", (req: Request, res: Response) => {
  const { listingId, quantity } = req.body;
  const targetListing = listings.find(l => l.id === listingId);

  if (!targetListing) {
    res.status(404).json({ error: "Crop listing not resolved" });
    return;
  }

  if (targetListing.quantity < quantity) {
    res.status(400).json({ error: "Inadequate crop volume remaining" });
    return;
  }

  // Calculate logistics + Escrow sums
  const totalAmount = (targetListing.pricePerUnit * quantity) + 1200; // 1200 logi handling KES

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    listingId: targetListing.id,
    crop: targetListing.crop,
    quantity: Number(quantity),
    unit: targetListing.unit,
    buyerId: currentUser ? currentUser.id : "user-dante",
    buyerName: currentUser ? currentUser.name : "Dante Geeks",
    buyerPhone: currentUser ? currentUser.phone : "+254712345678",
    farmerId: targetListing.farmerId,
    farmerName: targetListing.farmerName,
    totalAmount,
    escrowStatus: "Pending",
    paymentStatus: "unpaid",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// PUT to update Order lifecycle (Dispatched, Dispatch status, Escrow Released, Notes)
app.put("/api/orders/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    status,
    escrowStatus,
    paymentStatus,
    cancellationReason,
    cancelledBy,
    waybillNumber,
    deliveryNotes
  } = req.body;
  const idx = orders.findIndex(o => o.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Order not registered" });
    return;
  }

  if (status) orders[idx].status = status;
  if (escrowStatus) orders[idx].escrowStatus = escrowStatus;
  if (paymentStatus) orders[idx].paymentStatus = paymentStatus;
  if (waybillNumber) orders[idx].waybillNumber = waybillNumber;
  if (deliveryNotes) orders[idx].deliveryNotes = deliveryNotes;

  // Mark dispatch timestamp & generated waybill if missing
  if (status === "dispatched") {
    orders[idx].dispatchedAt = new Date().toISOString();
    if (!orders[idx].waybillNumber) {
      orders[idx].waybillNumber = `WB-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    console.log(`[Order Dispatched] Order #${id} dispatched with Waybill: ${orders[idx].waybillNumber}`);
  }

  // Mark crop listing details as Sold out if completed & disburse escrow
  if (status === "completed") {
    orders[idx].status = "completed";
    orders[idx].escrowStatus = "Disbursed";
    orders[idx].completedAt = new Date().toISOString();
    const listingIdx = listings.findIndex(l => l.id === orders[idx].listingId);
    if (listingIdx !== -1) {
      listings[listingIdx].quantity = Math.max(0, listings[listingIdx].quantity - orders[idx].quantity);
      if (listings[listingIdx].quantity === 0) {
        listings[listingIdx].status = "sold";
      }
    }
    console.log(`[Order Completed] Order #${id} completed. Escrow released to ${orders[idx].farmerName}.`);
  }

  // Handle cancellation
  if (status === "cancelled") {
    orders[idx].status = "cancelled";
    orders[idx].escrowStatus = "Refunded";
    orders[idx].cancellationReason = cancellationReason || "Order cancelled by counterparty.";
    orders[idx].cancelledBy = cancelledBy || (currentUser?.role || "buyer");
    orders[idx].cancelledAt = new Date().toISOString();
    console.log(`[Order Cancelled] Order #${id} cancelled by ${orders[idx].cancelledBy}. Reason: ${orders[idx].cancellationReason}`);
  }

  res.json(orders[idx]);
});

// Dedicated Cancel Order endpoint with refund escrow handling
app.post("/api/orders/:id/cancel", (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, cancelledBy, notes } = req.body;
  const idx = orders.findIndex(o => o.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const existing = orders[idx];
  if (existing.status === "completed") {
    res.status(400).json({ error: "Completed orders with disbursed escrow cannot be cancelled directly. Please contact SafeTrade mediation." });
    return;
  }

  orders[idx] = {
    ...existing,
    status: "cancelled",
    escrowStatus: "Refunded",
    cancellationReason: reason || "Cancelled by participant",
    cancelledBy: cancelledBy || (currentUser?.role || "buyer"),
    cancelledAt: new Date().toISOString(),
    deliveryNotes: notes ? `${existing.deliveryNotes || ''}\n[Cancellation Note]: ${notes}`.trim() : existing.deliveryNotes
  };

  console.log(`[SafeTrade Escrow Refund] Order #${id} cancelled. Escrow refund triggered to ${orders[idx].buyerPhone}`);
  res.json({
    success: true,
    message: "Order successfully cancelled and M-Pesa escrow custody set to Refunded.",
    order: orders[idx]
  });
});

// ==========================================
// INTEGRATIONS: M-PESA DARAJA STK PUSH (ESCROW)
// ==========================================

/**
 * 🔒 CRITICAL: M-PESA DARAJA API INTEGRATION
 * Inside a production environment, you will make a secure HTTPS request to:
 * https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
 * passing a Bearer Access Token generated via consumer consumer key authorization.
 * Below is our robust execution that manages payment states and triggers callback.
 */
app.post("/api/payments/stk-push", (req: Request, res: Response) => {
  const { orderId, phoneNumber } = req.body;
  const orderIdx = orders.findIndex(o => o.id === orderId);

  if (orderIdx === -1) {
    res.status(404).json({ error: "Associated order could not be located" });
    return;
  }

  const order = orders[orderIdx];
  console.log(`[M-Pesa STK Push] Generating STK command for Order ${orderId} against ${phoneNumber}. Amount: KES ${order.totalAmount}`);

  // Transition Order status to 'pending_payment'
  orders[orderIdx].paymentStatus = "pending_payment";

  // Simulate Daraja response instant success
  res.json({
    MerchantRequestID: "29183-1938219-1",
    CheckoutRequestID: `ws_CO_${Date.now()}`,
    ResponseCode: "0",
    ResponseDescription: "Success. Request accepted for processing",
    CustomerMessage: "Single-tap confirmation popup launched on device."
  });

  // Safe lazy trigger for standard Daraja STK Push Callback URL inside Express
  // This simulates Safaricom server confirming payment validation inside 2 sec
  setTimeout(() => {
    // Calling internal Callback simulation handler
    const mockCallbackPayload = {
      Body: {
        stkCallback: {
          MerchantRequestID: "29183-1938219-1",
          CheckoutRequestID: `ws_CO_${Date.now()}`,
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: order.totalAmount },
              { Name: "MpesaReceiptNumber", Value: "QHD391HDJU" },
              { Name: "TransactionDate", Value: Date.now() },
              { Name: "PhoneNumber", Value: phoneNumber }
            ]
          }
        }
      }
    };

    // Forwarding to callback handler
    triggerMpesaCallback(orderId, mockCallbackPayload);
  }, 2200);
});

// Core callback processor function (the code block where devs write processing logic)
function triggerMpesaCallback(orderId: string, payload: any) {
  const orderIdx = orders.findIndex(o => o.id === orderId);
  if (orderIdx === -1) return;

  const code = payload.Body.stkCallback.ResultCode;
  if (code === 0) {
    console.log(`[Callback Success] M-Pesa verified KES ${orders[orderIdx].totalAmount} loaded. Escrow status: Deposited.`);
    orders[orderIdx].paymentStatus = "paid";
    // Escrow logic: Funds held in safe secure escrow custody till buyer confirms Delivery
    orders[orderIdx].escrowStatus = "Deposited";
  } else {
    console.warn(`[Callback Cancel] M-Pesa client rejected authorization code. Code: ${code}`);
    orders[orderIdx].paymentStatus = "unpaid";
    orders[orderIdx].escrowStatus = "Pending";
  }
}

// Actual Callback target controller in routing (where Safaricom posts real webhook)
app.post("/api/payments/callback", (req: Request, res: Response) => {
  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = req.body;
  
  /**
   * 💡 PRODUCTION CALL NOTE:
   * To link a Callback packet back to an order, you normally extract the MerchantRequestID 
   * or CheckoutRequestID from your local transactions state register, and match.
   * e.g., const transaction = db.query("SELECT * FROM transactions WHERE checkout_id = ?", CheckoutRequestID);
   */
  console.log(`[M-Pesa Webhook Callback] Received callback from Safaricom. ResultCode: ${ResultCode}`);
  res.status(200).json({ ResultCode: 0, ResultDesc: "Callback received and registered successfully" });
});

// ==========================================
// INTEGRATIONS: AFRICA'S TALKING USSD GATEWAY
// ==========================================

/**
 * USSD Gateway endpoint simulating Africa's Talking integrations (*384*#)
 * Receives POST requests from AT Servers with string parameters:
 * @param sessionId - Unique session ID of calling cellular network channel
 * @param serviceCode - Dialed extension prefix code e.g. *384*#
 * @param phoneNumber - Client mobile phone number (+254...)
 * @param text - Cumulative asterisk-appended inputs string (e.g. "1*2*4")
 */
app.post("/api/ussd", (req: Request, res: Response) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  const textChain = text ? String(text).split("*") : [];
  const currentInput = textChain[textChain.length - 1] || "";
  
  let responseText = "";

  // Set default USSD Session State
  if (!ussdSessions[sessionId]) {
    ussdSessions[sessionId] = {
      phoneNumber,
      step: "welcome",
      locale: "en"
    };
  }

  const session = ussdSessions[sessionId];

  // Root screen routing
  if (text === "" || !text) {
    responseText = 
      "CON Welcome to Kilimo Cereals & Spices Marketplace\n" +
      "Chagua Lugha / Select Language:\n" +
      "1. English\n" +
      "2. Kiswahili";
    session.step = "role_select";
  } else if (textChain[0] === "1") {
    // English Menu Flow
    session.locale = "en";
    responseText = handleEnglishUSSD(textChain, session);
  } else if (textChain[0] === "2") {
    // Swahili Menu Flow
    session.locale = "sw";
    responseText = handleSwahiliUSSD(textChain, session);
  } else {
    responseText = "END Invalid entry. Jaribu tena.";
  }

  res.send(responseText);
});

// English USSD State Interpreter
function handleEnglishUSSD(chain: string[], session: USSDSession): string {
  // Chain looks like ["1"] (Language select English)
  if (chain.length === 1) {
    return (
      "CON Selected: English\n" +
      "Identify your business view:\n" +
      "1. Kenyan Farmer\n" +
      "2. Bulk Buyer"
    );
  }

  const roleSelect = chain[1];
  if (roleSelect === "1") {
    // Farmer Menu
    return handleFarmerEnglish(chain, session);
  } else if (roleSelect === "2") {
    // Buyer Menu
    return handleBuyerEnglish(chain, session);
  }

  return "END Invalid business selection.";
}

function handleFarmerEnglish(chain: string[], session: USSDSession): string {
  // Chain: ["1", "1"] (Eng, Farmer)
  if (chain.length === 2) {
    return (
      "CON FARMER MENU\n" +
      "1. List New Harvest For Sale\n" +
      "2. Review Active Orders\n" +
      "3. Current County Maize Prices"
    );
  }

  const action = chain[2];
  if (action === "1") {
    // List New Harvest: Chain: ["1", "1", "1", ...]
    // 1st step of List process: Select Crop
    if (chain.length === 3) {
      return (
        "CON Crop type:\n" +
        "1. Maize (Mahindi)\n" +
        "2. Sorghum (Mtama)\n" +
        "3. Millet (Wimbi)\n" +
        "4. Birds Eye Chili (Pilipili)"
      );
    }
    const cropChoice = chain[3];
    let cropName: CropType = "maize";
    if (cropChoice === "2") cropName = "sorghum";
    else if (cropChoice === "3") cropName = "millet";
    else if (cropChoice === "4") cropName = "chili";

    // Ask Grade
    if (chain.length === 4) {
      return (
        `CON Selected: ${cropName.toUpperCase()}\n` +
        "Choose Quality Standard:\n" +
        "1. Grade 1 (Superb)\n" +
        "2. Grade 2 (Average)\n" +
        "3. Grade 3 (Feed Grade)"
      );
    }
    const gradeChoice = chain[4];
    let gradeLabel: CropGrade = "Grade 1";
    if (gradeChoice === "2") gradeLabel = "Grade 2";
    else if (gradeChoice === "3") gradeLabel = "Grade 3";

    // Ask Quantity Volume
    if (chain.length === 5) {
      const u = ["chili", "ginger"].includes(cropName) ? "kg" : "bags";
      return `CON Standard: ${gradeLabel}\nHow many ${u} are you listing?`;
    }
    const quantity = parseInt(chain[5]) || 0;

    // Ask Price per unit
    if (chain.length === 6) {
      const u = ["chili", "ginger"].includes(cropName) ? "kg" : "Bag";
      return `CON Volume: ${quantity}\nSpecify asking price in KES per ${u}:`;
    }
    const price = parseInt(chain[6]) || 0;

    // Ask Location County
    if (chain.length === 7) {
      return (
        `CON Price: KES ${price}\n` +
        "Specify your loading county location:\n" +
        "1. Eldoret\n" +
        "2. Nyandarua\n" +
        "3. Meru\n" +
        "4. Nakuru"
      );
    }
    const locChoice = chain[7];
    let locationStr = "Eldoret";
    if (locChoice === "2") locationStr = "Nyandarua";
    else if (locChoice === "3") locationStr = "Meru";
    else if (locChoice === "4") locationStr = "Nakuru";

    // Final execution confirmation
    if (chain.length === 8) {
      const finalUnit = ["chili", "ginger"].includes(cropName) ? "kg" : "90kg Bag";
      const newSimulated: Listing = {
        id: `list-ussd-${Date.now()}`,
        farmerId: "farm-ussd",
        farmerName: "Farmer Phone USSD",
        crop: cropName,
        grade: gradeLabel,
        quantity,
        unit: finalUnit,
        pricePerUnit: price,
        location: locationStr,
        status: "available",
        createdAt: new Date().toISOString(),
        priceHistory: [
          {
            price,
            changedAt: new Date().toISOString(),
            note: "Listed via Africa's Talking USSD feature phone interface"
          }
        ],
        lastSyncedAt: new Date().toISOString()
      };
      
      // Persist to listings array
      listings.unshift(newSimulated);

      return (
        `END Listing complete!\n` +
        `Harvest details: ${quantity} x ${cropName.toUpperCase()} (${gradeLabel}) at KES ${price} posted from ${locationStr}. Asanteni.`
      );
    }
  } else if (action === "2") {
    // Review Active Orders
    const farmerOrders = orders.filter(o => o.farmerId === "farm-wanjala" || o.farmerId === "farm-ussd");
    if (farmerOrders.length === 0) {
      return "CON No active buyer requests pending shipment at this time.\nPress 0 to exit.";
    }
    let orderInfo = "CON ACTIVE SHIPMENTS:\n";
    farmerOrders.slice(0, 2).forEach((fo, idx) => {
      orderInfo += `${idx + 1}. KES ${fo.totalAmount} for ${fo.quantity} ${fo.crop.toUpperCase()} (${fo.escrowStatus})\n`;
    });
    orderInfo += "Select index to mark as DISPATCHED:";
    
    if (chain.length === 3) {
      return orderInfo;
    }
    
    const choiceOrderIdx = parseInt(chain[3]) - 1;
    if (farmerOrders[choiceOrderIdx]) {
      const selectedOrd = farmerOrders[choiceOrderIdx];
      // Mark as dispatched
      const finalOrdIdx = orders.findIndex(o => o.id === selectedOrd.id);
      if (finalOrdIdx !== -1) {
        orders[finalOrdIdx].status = "dispatched";
      }
      return `END Order marked as dispatched. Cargo logistics notified. Escrow status remains ${orders[finalOrdIdx].escrowStatus} until delivery.`;
    }
    return "END Irregular selection index list.";
  } else if (action === "3") {
    // Current County Maize Prices
    let priceText = "CON MAIZE PRICES TODAY:\n";
    const maizeFeed = marketPrices.filter(m => m.crop === "maize");
    maizeFeed.forEach(m => {
      priceText += `● ${m.location}: KES ${m.avgPrice} per Bag\n`;
    });
    priceText += "Press 0 to Exit.";
    return priceText;
  }

  return "END Farmer logic invalid state.";
}

function handleBuyerEnglish(chain: string[], session: USSDSession): string {
  // Chain: ["1", "2"] (Eng, Buyer)
  if (chain.length === 2) {
    return (
      "CON BUYER HARVEST CONSOLE\n" +
      "1. Browse Available Crop Listings\n" +
      "2. Monitor Escrow Cargo Status"
    );
  }

  const action = chain[2];
  if (action === "1") {
    // Browse Crops
    if (chain.length === 3) {
      let bulkList = "CON AVAILABLE CROP LISTS:\n";
      listings.slice(0, 3).forEach((l, idx) => {
        bulkList += `${idx + 1}. ${l.crop.toUpperCase()} (${l.grade}) - ${l.quantity} bags at KES ${l.pricePerUnit} in ${l.location}\n`;
      });
      bulkList += "Select listing index to purchase: ";
      return bulkList;
    }

    const listingSelIdx = parseInt(chain[3]) - 1;
    const targetListing = listings[listingSelIdx];
    if (!targetListing) {
      return "END Listing index invalid.";
    }

    if (chain.length === 4) {
      return `CON BUY FOR: KES ${targetListing.pricePerUnit}/${targetListing.unit}\nListing Volume: ${targetListing.quantity}\nEnter purchase quantity volume:`;
    }

    const orderQty = parseInt(chain[4]) || 1;
    const orderCost = targetListing.pricePerUnit * orderQty;

    if (chain.length === 5) {
      return (
        `CON ORDER SUMMARY\n` +
        `Crop: ${targetListing.crop.toUpperCase()}\n` +
        `Qty: ${orderQty} ${targetListing.unit}\n` +
        `Sum: KES ${orderCost}\n` +
        `1. Confirm Transaction (triggers M-Pesa STK)\n` +
        `2. Cancel Request`
      );
    }

    const confirmChoice = chain[5];
    if (confirmChoice === "1") {
      // Create order
      const newOrder: Order = {
        id: `ord-ussd-${Date.now()}`,
        listingId: targetListing.id,
        crop: targetListing.crop,
        quantity: orderQty,
        unit: targetListing.unit,
        buyerId: "user-ussd",
        buyerName: "Buyer Phone USSD",
        buyerPhone: session.phoneNumber,
        farmerId: targetListing.farmerId,
        farmerName: targetListing.farmerName,
        totalAmount: orderCost + 1200,
        escrowStatus: "Deposited", // Hardcode mock deposit on USSD
        paymentStatus: "paid",
        status: "pending",
        createdAt: new Date().toISOString()
      };
      orders.unshift(newOrder);

      return (
        `END Transaction Success!\n` +
        `M-Pesa payment of KES ${orderCost + 1200} validated. Funds are secured in ESCROW. Cargo shipment is on standby for delivery dispatch.`
      );
    } else {
      return "END Order cancelled by buyer.";
    }
  } else if (action === "2") {
    // Monitor Escrow Status
    const userOrders = orders.filter(o => o.buyerId === (currentUser?.id || "user-dante") || o.buyerId === "user-ussd");
    if (userOrders.length === 0) {
      return "CON You have no pending escrow orders currently.\nPress 0 to exit.";
    }
    let statusText = "CON ESCROW STATUS REPORT:\n";
    userOrders.slice(0, 2).forEach((uo, idx) => {
      statusText += `${idx + 1}. ${uo.crop.toUpperCase()} (${uo.quantity} units) -> Escrow: ${uo.escrowStatus} / State: ${uo.status.toUpperCase()}\n`;
    });
    statusText += "Confirm delivery (Releases Escrow) index: ";

    if (chain.length === 3) {
      return statusText;
    }

    const deliveryIdx = parseInt(chain[3]) - 1;
    if (userOrders[deliveryIdx]) {
      const activeOrd = userOrders[deliveryIdx];
      const mainIdx = orders.findIndex(o => o.id === activeOrd.id);
      if (mainIdx !== -1) {
        orders[mainIdx].status = "completed";
        orders[mainIdx].escrowStatus = "Disbursed";
        
        // Sold logic
        const listIdx = listings.findIndex(l => l.id === orders[mainIdx].listingId);
        if (listIdx !== -1) {
          listings[listIdx].quantity = Math.max(0, listings[listIdx].quantity - orders[mainIdx].quantity);
          if (listings[listIdx].quantity === 0) {
            listings[listIdx].status = "sold";
          }
        }
      }
      return `END Thank you for confirming! Escrow disbursed to ${activeOrd.farmerName} instantly. Kilimo SafeTrade successfully wrapped.`;
    }
    return "END Irregular selection index list.";
  }

  return "END Buyer flow invalid state.";
}

// Swahili USSD State Interpreter
function handleSwahiliUSSD(chain: string[], session: USSDSession): string {
  if (chain.length === 1) {
    return (
      "CON Umefanikiwa: Kiswahili\n" +
      "Chagua aina ya huduma:\n" +
      "1. Mkulima wa Mazao\n" +
      "2. Mnunuzi wa Jumla"
    );
  }

  const roleSelect = chain[1];
  if (roleSelect === "1") {
    return handleFarmerSwahili(chain, session);
  } else if (roleSelect === "2") {
    return handleBuyerSwahili(chain, session);
  }

  return "END Chaguo si sahihi.";
}

function handleFarmerSwahili(chain: string[], session: USSDSession): string {
  if (chain.length === 2) {
    return (
      "CON MENU YA MKULIMA\n" +
      "1. Weka Mazao Yanayouzwa\n" +
      "2. Angalia Maagizo Yanayokuja\n" +
      "3. Bei ya Mahindi Leo"
    );
  }

  const action = chain[2];
  if (action === "1") {
    if (chain.length === 3) {
      return (
        "CON Aina ya Mazao:\n" +
        "1. Mahindi (Maize)\n" +
        "2. Mtama (Sorghum)\n" +
        "3. Wimbi (Millet)\n" +
        "4. Pilipili Kali (Chili)"
      );
    }
    const cropChoice = chain[3];
    let cropName = "mahindi";
    if (cropChoice === "2") cropName = "mtama";
    else if (cropChoice === "3") cropName = "wimbi";
    else if (cropChoice === "4") cropName = "pilipili";

    if (chain.length === 4) {
      return (
        "CON Chagua Ubora (Daraja):\n" +
        "1. Grade 1 (Bora Kabisa)\n" +
        "2. Grade 2 (Wastani)\n" +
        "3. Grade 3 (Lishe)"
      );
    }

    if (chain.length === 5) {
      return "CON Weka IDADI ya magunia unayouza:";
    }
    const quantity = parseInt(chain[5]) || 0;

    if (chain.length === 6) {
      return `CON Idadi: magunia ${quantity}\nWeka BEI unayotaka kulingana na gunia (KES):`;
    }
    const price = parseInt(chain[6]) || 0;

    if (chain.length === 7) {
      return (
        `CON Bei: KES ${price}\n` +
        "Chagua eneo la kupakia mizigo:\n" +
        "1. Eldoret\n" +
        "2. Nyandarua\n" +
        "3. Meru\n" +
        "4. Nakuru"
      );
    }
    const locChoice = chain[7];
    let locationStr = "Eldoret";
    if (locChoice === "2") locationStr = "Nyandarua";
    else if (locChoice === "3") locationStr = "Meru";
    else if (locChoice === "4") locationStr = "Nakuru";

    if (chain.length === 8) {
      // Create listing
      const newSimulated: Listing = {
        id: `list-ussd-${Date.now()}`,
        farmerId: "farm-ussd",
        farmerName: "Mkulima Simu USSD",
        crop: (cropChoice === "2" ? "sorghum" : cropChoice === "3" ? "millet" : cropChoice === "4" ? "chili" : "maize") as CropType,
        grade: "Grade 1",
        quantity,
        unit: cropChoice === "4" ? "kg" : "90kg Bag",
        pricePerUnit: price,
        location: locationStr,
        status: "available",
        createdAt: new Date().toISOString()
      };
      listings.unshift(newSimulated);

      return (
        `END Mazao yamewekwa sokoni!\n` +
        `Ulizotuma: Magunia ${quantity} za ${cropName.toUpperCase()} kutoka ${locationStr} kwa bei ya KES ${price} kila gunia. Soko Safi.`
      );
    }
  } else if (action === "2") {
    return "CON Hakuna amri mpya za usafirishaji kwa sasa.\nBonyeza 0 kutoka.";
  } else if (action === "3") {
    let pText = "CON BEI YA MAHINDI LEO:\n";
    marketPrices.filter(m => m.crop === "maize").forEach(m => {
      pText += `● ${m.location}: KES ${m.avgPrice} kwa kila gunia\n`;
    });
    pText += "Bonyeza 0 kutoka.";
    return pText;
  }

  return "END Huduma kwa mkulima imehitimishwa.";
}

function handleBuyerSwahili(chain: string[], session: USSDSession): string {
  if (chain.length === 2) {
    return (
      "CON CONSOLE YA MNUNUZI\n" +
      "1. Tafuta na Nunua Mazao Sokoni\n" +
      "2. Angalia Hali ya Mizigo na Escrow"
    );
  }

  const action = chain[2];
  if (action === "1") {
    if (chain.length === 3) {
      let bList = "CON MAZAO YALIYOUNDWA LEO:\n";
      listings.slice(0, 2).forEach((l, idx) => {
        const swCrop = l.crop === "maize" ? "Mahindi" : l.crop === "chili" ? "Pilipili" : l.crop;
        bList += `${idx + 1}. ${swCrop} (${l.grade}) - KES ${l.pricePerUnit} eneo la ${l.location}\n`;
      });
      bList += "Chagua nambari ya bidhaa kununua: ";
      return bList;
    }

    const lIdx = parseInt(chain[3]) - 1;
    const target = listings[lIdx];
    if (!target) return "END Bidhaa haikupatikana.";

    if (chain.length === 4) {
      return `CON BEI: KES ${target.pricePerUnit} kwa kila ${target.unit}\nWeka idadi ya magunia unayohitaji:`;
    }

    const q = parseInt(chain[4]) || 1;
    const cost = target.pricePerUnit * q;

    if (chain.length === 5) {
      return (
        `CON MUHTASARI WA UNUNUZI\n` +
        `Mazao: ${target.crop.toUpperCase()}\n` +
        `Idadi: ${q} ${target.unit}\n` +
        `Bei: KES ${cost}\n` +
        `1. Thibitisha (Tuma malipo ya M-Pesa)\n` +
        `2. Hairisha ununuzi`
      );
    }

    const confirmation = chain[5];
    if (confirmation === "1") {
      const orderSim: Order = {
        id: `ord-ussd-${Date.now()}`,
        listingId: target.id,
        crop: target.crop,
        quantity: q,
        unit: target.unit,
        buyerId: "user-ussd",
        buyerName: "Mnunuzi Simu USSD",
        buyerPhone: session.phoneNumber,
        farmerId: target.farmerId,
        farmerName: target.farmerName,
        totalAmount: cost + 1200,
        escrowStatus: "Deposited",
        paymentStatus: "paid",
        status: "pending",
        createdAt: new Date().toISOString()
      };
      orders.unshift(orderSim);

      return `END Ununuzi umekubalika! Tumepokea malipo ya KES ${cost + 1200} kupitia M-Pesa. Pesa zako zimehifadhiwa salama kwenye akaunti ya Escrow.`;
    }
    return "END Umelighairi ombi.";
  } else if (action === "2") {
    return "CON Mizigo yako ishawasilishwa kwenye bandari ya upakiaji.\nBonyeza 0 kutoka.";
  }

  return "END Huduma ya mnunuzi imekamilika.";
}

// ==========================================
// STATIC ASSET AND VITE ROUTING
// ==========================================

// Vite middleware setup to blend in during development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production delivery files targeting unified dist output
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Kilimo Full-Stack Server] SafeTrade engine live on http://0.0.0.0:${PORT}`);
  });
}

startServer();
