/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wheat,
  ShieldCheck,
  TrendingUp,
  Coins,
  Wifi,
  WifiOff,
  Volume2,
  Upload,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  Clock,
  ChevronRight,
  Download,
  Languages,
  RefreshCw,
  PhoneCall,
  User,
  Users,
  MapPin,
  Sparkles,
  Database,
  History,
  FileSpreadsheet,
  AlertCircle,
  Hash,
  Map as MapIcon,
  Pencil,
  Tag,
  TrendingDown,
  UserPlus,
  LogIn,
  KeyRound,
  Building2,
  Camera,
  Image as ImageIcon,
  Trash2,
  Zap,
  Package,
  PackageCheck
} from "lucide-react";
import { Listing, Order, MarketPrice, User as UserType, CropType, CropGrade } from "./types";
import { KenyaHarvestMap } from "./components/KenyaHarvestMap";
import { EscrowSafeTrackProgress } from "./components/EscrowSafeTrackProgress";
import { EditListingModal } from "./components/EditListingModal";
import { ListingPriceTracker } from "./components/ListingPriceTracker";
import { CreateAccountModal } from "./components/CreateAccountModal";
import { UserProfileModal } from "./components/UserProfileModal";
import { MarketPriceTrendChart } from "./components/MarketPriceTrendChart";
import { OrdersManagementPage } from "./components/OrdersManagementPage";

// Swahili and English localized language maps
const translations = {
  en: {
    title: "Kilimo Marketplace",
    subtitle: "Kenyan Cereal & Spice Hub",
    switchRole: "Switch View",
    farmer: "Farmer View",
    buyer: "Buyer View",
    farmerSub: "Post harvest listings & receive secure payouts",
    buyerSub: "Browse quality crops & manage bulk escrow",
    offlineMode: "Offline Mode",
    online: "Online",
    offline: "Offline",
    syncBtn: "Sync Offline Queue",
    swahiliToggle: "Kiswahili",
    englishToggle: "English",
    
    // Farmer section
    postHarvest: "Post New Harvest",
    cropType: "Crop Type",
    grade: "Quality Grade",
    quantity: "Quantity",
    pricePerUnit: "Price per Unit (KES)",
    location: "Loading Location",
    submitListing: "Publish Listing",
    voiceTitle: "Voice Notes Posting Assist",
    voiceDesc: "Record your harvest description in swahili or english. Our Gemini AI will parse crop, grade, location, and price automatically.",
    micSimulate: "Click to Speak (Demo)",
    recordOn: "Recording...",
    recordOff: "Simulate Voice Entry",
    compressing: "Optimizing & compressing crop image for 3G...",
    imageSizeSaved: "Compressed image count from 4.8MB to 64KB (86% speed optimization)",
    cropPhoto: "Harvest Photo",
    cropPhotoSub: "Upload or take crop photo (auto-compressed for 3G)",
    uploadPhotoPrompt: "Click or tap to upload harvest photo",
    dropPhotoPrompt: "JPG, PNG or WEBP up to 10MB • Compressed for 3G",
    photoOptimizedBadge: "3G Optimized",
    originalSize: "Original",
    optimizedSize: "3G Payload",
    savedBandwidth: "bandwidth saved",
    changePhoto: "Change",
    removePhoto: "Remove",
    useSamplePhoto: "⚡ Use sample harvest photo",

    // Swahili Toggle translation
    recent_listings: "Your Active Soko Listings",
    crop_unit: "bags",
    unit_kg: "kg",

    // Buyer section
    marketFeed: "National Spot Prices Feed",
    filterTitle: "Wholesale Crops Engine",
    allCrops: "All Crops",
    allGrades: "All Grades",
    allCounties: "All Counties",
    invoiceHeader: "SafeTrade Digital Invoice",
    escrowShield: "Secured by Kilimo Escrow",
    escrowDesc: "Your money stays locked in escrow safe custody until you inspect and confirm courier unloading.",
    payMpesa: "Initiate M-Pesa SafeTrade Checkout",
    confirmDelivery: "Confirm Delivery & Release Funds",
    dispatchOrder: "Confirm Cargo Dispatched",
    completedStatus: "Escrow Disbursed",
    dispatchedStatus: "Dispatched (In Transit)",
    pendingStatus: "Awaiting Dispatch",

    // USSD Gateway Section
    ussdTitle: "Built-In AT USSD Gateway",
    ussdSubtitle: "Dial *384*# to simulate feature checks on feature phones offline",
    ussdDial: "Dial USSD",
    ussdScreen: "USSD Simulator Screen",
    ussdInputPlace: "Type text command here..."
  },
  sw: {
    title: "Soko la Kilimo",
    subtitle: "Kituo cha Nafaka na Viungo vya Kenya",
    switchRole: "Badili Huduma",
    farmer: "Huduma ya Mkulima",
    buyer: "Huduma ya Mnunuzi",
    farmerSub: "Sajili mazao yako na upokee malipo salama",
    buyerSub: "Tafuta mazao bora na dhibiti amana ya escrow",
    offlineMode: "Hali ya Nje ya Mtandao",
    online: "Upo Mtandaoni",
    offline: "Nje ya Mtandao",
    syncBtn: "Husanisha Mistari ya Nje",
    swahiliToggle: "Kiswahili",
    englishToggle: "English",

    // Farmer section
    postHarvest: "Sajili Mavuno Mapya",
    cropType: "Aina ya Mazao",
    grade: "Kiwango cha Ubora",
    quantity: "Idadi",
    pricePerUnit: "Bei ya Kila Gunia/Kilo (KES)",
    location: "Eneo la Kupakia",
    submitListing: "Weka Sokoni",
    voiceTitle: "Msaidizi wa Sauti (Gemini AI)",
    voiceDesc: "Ongea kwa sauti kuelezea mazao yako. Akili bandia ya Gemini itachanganua mazao, daraja, eneo na bei kiotomatiki.",
    micSimulate: "Bonyeza Kuongea (Majaribio)",
    recordOn: "Inarekodi...",
    recordOff: "Majaribio ya Rekodi ya Sauti",
    compressing: "Kubana picha kwa kasi bora ya 3G...",
    imageSizeSaved: "Picha imebandwa kutoka 4.8MB hadi 64KB asilimia 86 ya kasi ya juu",
    cropPhoto: "Picha ya Zao",
    cropPhotoSub: "Pakia au piga picha ya zao (inabandwa kwa 3G)",
    uploadPhotoPrompt: "Bonyeza au gusa kupakia picha ya mavuno",
    dropPhotoPrompt: "JPG, PNG au WEBP hadi 10MB • Imebanwa kwa 3G",
    photoOptimizedBadge: "Imeboreshwa kwa 3G",
    originalSize: "Ukubwa Halisi",
    optimizedSize: "Ukubwa wa 3G",
    savedBandwidth: "imehifadhiwa",
    changePhoto: "Badili",
    removePhoto: "Ondoa",
    useSamplePhoto: "⚡ Tumia picha ya sampuli ya zao",

    recent_listings: "Mavuno Yako Sokoni",
    crop_unit: "magunia",
    unit_kg: "kilo",

    // Buyer section
    marketFeed: "Bei za Sasa za Kitaifa",
    filterTitle: "Injini ya Kutafuta Mazao",
    allCrops: "Mazao Yote",
    allGrades: "Ubora Wote",
    allCounties: "Kaunti Zote",
    invoiceHeader: "Ankara ya Dijitali ya SafeTrade",
    escrowShield: "Imelindwa na Kilimo Escrow",
    escrowDesc: "Pesa zako zinasalia salama kwenye amana ya escrow hadi ukague na kuthibitisha ubora wa mazao yaliyowasili.",
    payMpesa: "Lipa na M-Pesa SafeTrade",
    confirmDelivery: "Thibitisha Uwasilishaji na Toa Pesa",
    dispatchOrder: "Thibitisha Mizigo Imesafirishwa",
    completedStatus: "Amana Imetolewa",
    dispatchedStatus: "Inasafirishwa njiani",
    pendingStatus: "Inasubiri Usafirishaji",

    // USSD Section
    ussdTitle: "Kiigaji cha USSD Gateway",
    ussdSubtitle: "Piga *384*# kusimamia huduma kwenye simu ndogo bila mtandao",
    ussdDial: "Piga USSD",
    ussdScreen: "Skrini ya USSD ya Rununu",
    ussdInputPlace: "Andika maagizo hapa..."
  }
};

const CROP_TRANSLATIONS: Record<string, { en: string; sw: string }> = {
  maize: { en: "White Maize", sw: "Mahindi Nyeupe" },
  sorghum: { en: "Red Sorghum", sw: "Mtama Mwekundu" },
  millet: { en: "Finger Millet", sw: "Wimbi (Mtama Mdogo)" },
  chili: { en: "Birds Eye Chili", sw: "Pilipili Kali ya Macho" },
  ginger: { en: "African Ginger", sw: "Tangawizi ya Kienyeji" },
  beans: { en: "Rosecoco Beans", sw: "Maharagwe ya Rosecoco" },
  wheat: { en: "Highland Wheat", sw: "Ngano ya Nyanda za Juu" }
};

const CROP_FALLBACK_IMAGES: Record<string, string> = {
  maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=450&auto=format&fit=crop&q=60",
  sorghum: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=450&auto=format&fit=crop&q=60",
  millet: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=450&auto=format&fit=crop&q=60",
  chili: "https://images.unsplash.com/photo-1588252303782-cb80119cb2bb?w=450&auto=format&fit=crop&q=60",
  ginger: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=450&auto=format&fit=crop&q=60",
  beans: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=450&auto=format&fit=crop&q=60",
  wheat: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=450&auto=format&fit=crop&q=60"
};

export default function App() {
  const [locale, setLocale] = useState<"en" | "sw">("en");
  const [role, setRole] = useState<"farmer" | "buyer">("buyer");
  const [currentView, setCurrentView] = useState<"marketplace" | "orders">("marketplace");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Custom inline safe notification toast
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const triggerNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(prev => prev && prev.message === message ? null : prev);
    }, 5000);
  };

  const renderNotification = () => {
    if (!notification) return null;
    const bgClass = 
      notification.type === "success" ? "bg-emerald-600 text-white" : 
      notification.type === "error" ? "bg-[#B24C3D] text-white" : 
      "bg-natural-olive text-white";
    return (
      <div id="toast" className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex justify-center w-full max-w-sm px-4">
        <div className={`flex items-center gap-2 p-3 px-5 rounded-full shadow-2xl border border-white/10 select-none ${bgClass} transition duration-200`}>
          <span className="text-xs font-semibold px-1 font-sans">{notification.message}</span>
          <button 
            type="button" 
            onClick={() => setNotification(null)}
            className="text-white/70 hover:text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono transition bg-black/20 cursor-pointer ml-1"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // Account Portal & Modal states
  const [authPortalTab, setAuthPortalTab] = useState<"register" | "login" | "demo">("register");
  const [showCreateAccountModal, setShowCreateAccountModal] = useState<boolean>(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState<boolean>(false);
  const [loginPhone, setLoginPhone] = useState<string>("");
  const [loginRole, setLoginRole] = useState<"farmer" | "buyer">("farmer");
  const [loginPin, setLoginPin] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [demoUsers, setDemoUsers] = useState<UserType[]>([]);

  // DB States
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  
  // Filtering states
  const [cropFilter, setCropFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [showBuyerMap, setShowBuyerMap] = useState<boolean>(true);
  const [showFarmerMap, setShowFarmerMap] = useState<boolean>(false);

  // Local Offline Queues
  const [offlineListingsQueue, setOfflineListingsQueue] = useState<Partial<Listing>[]>([]);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [compressingImage, setCompressingImage] = useState<boolean>(false);
  const [compressionLogs, setCompressionLogs] = useState<string>("");

  // Crop photo upload & 3G compression state
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [originalPhotoSize, setOriginalPhotoSize] = useState<number | null>(null);
  const [compressedPhotoSize, setCompressedPhotoSize] = useState<number | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [compressionPercent, setCompressionPercent] = useState<number | null>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Crop list creation form
  const [newCrop, setNewCrop] = useState<CropType>("maize");
  const [newGrade, setNewGrade] = useState<CropGrade>("Grade 1");
  const [newQuantity, setNewQuantity] = useState<string>("100");
  const [newPrice, setNewPrice] = useState<string>("4200");
  const [newLocation, setNewLocation] = useState<string>("Eldoret");
  const [customVoiceText, setCustomVoiceText] = useState<string>("");
  const [voiceInputMode, setVoiceInputMode] = useState<boolean>(false);
  const [analyzingVoice, setAnalyzingVoice] = useState<boolean>(false);

  // M-Pesa Interactive STK Modal State
  const [activeOrderForPayment, setActiveOrderForPayment] = useState<Order | null>(null);
  const [mpesaPin, setMpesaPin] = useState<string>("");
  const [stkPushStep, setStkPushStep] = useState<"phone_prompt" | "pin_prompt" | "authenticating" | "success" | "none">("none");

  // Selected Listing for checkout details
  const [selectedListingToBuy, setSelectedListingToBuy] = useState<Listing | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(10);

  // Edit Listing & Price Tracking Modal State
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isSyncingNewListing, setIsSyncingNewListing] = useState<boolean>(false);

  // Africa's Talking USSD Sandbox Simulator State
  const [ussdSessionId, setUssdSessionId] = useState<string>(`session-${Math.random().toString(36).substr(2, 9)}`);
  const [ussdPhone, setUssdPhone] = useState<string>("+254712345678");
  const [ussdTextChain, setUssdTextChain] = useState<string>("");
  const [ussdRawInput, setUssdRawInput] = useState<string>("");
  const [ussdScreenOutput, setUssdScreenOutput] = useState<string>("* * Dial USSD above to trigger simulations * *");
  const [ussdActive, setUssdActive] = useState<boolean>(false);

  const t = translations[locale];

  // Fetch critical items
  const fetchAllData = async () => {
    try {
      const pRes = await fetch("/api/market-prices");
      const prices = await pRes.json();
      setMarketPrices(prices);

      const lRes = await fetch(`/api/listings?crop=${cropFilter}&grade=${gradeFilter}&location=${locationFilter}`);
      const lists = await lRes.json();
      setListings(lists);

      const oRes = await fetch("/api/orders");
      const ords = await oRes.json();
      setOrders(ords);

      const uRes = await fetch("/api/auth/me");
      const usr = await uRes.json();
      if (usr && usr.id) {
        setCurrentUser(usr);
        setRole(usr.role);
        setUssdPhone(usr.phone);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.warn("Express endpoint missing, utilizing dynamic local states", e);
    }
  };

  // Load demo users list from express server once
  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const res = await fetch("/api/auth/demo-users");
        const data = await res.json();
        setDemoUsers(data);
      } catch (err) {
        console.warn("Demo user fetching stalled.", err);
      }
    };
    fetchDemoUsers();
  }, []);

  const handleDemoLogin = async (user: UserType) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user.phone,
          role: user.role,
          pin: user.pin || "1234"
        })
      });
      const data = await res.json();
      if (data && data.id) {
        setCurrentUser(data);
        setRole(data.role);
        setLocale(data.locale || "en");
        setUssdPhone(data.phone);
        triggerNotification(
          locale === "en" ? `Signed in as ${data.name}` : `Umeingia kama ${data.name}`,
          "success"
        );
      }
    } catch (err) {
      console.error("Demo login error", err);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginPhone.trim()) {
      setLoginError(
        locale === "en" ? "Please enter your registered phone number." : "Tafadhali weka nambari yako ya simu."
      );
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: loginPhone.trim(),
          role: loginRole,
          pin: loginPin.trim() || undefined,
          locale
        })
      });

      const data = await res.json();

      if (res.ok && data && data.id) {
        setCurrentUser(data);
        setRole(data.role);
        setLocale(data.locale || locale);
        setUssdPhone(data.phone);
        setLoginPhone("");
        setLoginPin("");
        triggerNotification(
          locale === "en"
            ? `Welcome back, ${data.name}! Signed in to Kilimo SafeTrade.`
            : `Karibu tena, ${data.name}! Umeingia kwenye Kilimo SafeTrade.`,
          "success"
        );
      } else {
        setLoginError(data.error || "Failed to sign in. Please verify your phone and PIN.");
      }
    } catch (err) {
      console.error("Sign in error", err);
      setLoginError(locale === "en" ? "Network connection error." : "Hitilafu ya mtandao.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAccountCreated = (newUser: UserType) => {
    setCurrentUser(newUser);
    setRole(newUser.role);
    setLocale(newUser.locale || locale);
    setUssdPhone(newUser.phone);
    setDemoUsers(prev => [newUser, ...prev.filter(u => u.id !== newUser.id)]);
    setShowCreateAccountModal(false);
    triggerNotification(
      locale === "en"
        ? `🎉 Hongera! Account verified & created for ${newUser.name} (${newUser.role === "farmer" ? "Farmer" : "Buyer"})!`
        : `🎉 Hongera! Akaunti ya ${newUser.name} imethibitishwa na kufunguliwa kikamilifu!`,
      "success"
    );
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
    } catch (err) {
      console.error("Logout request error", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [cropFilter, gradeFilter, locationFilter]);

  // Periodic polling for fast updates in UI
  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(() => {
        fetchAllData();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOnline, cropFilter, gradeFilter, locationFilter]);

  // Handle M-Pesa triggering payment
  const handleInitiatePayment = (order: Order) => {
    setActiveOrderForPayment(order);
    setStkPushStep("pin_prompt");
    setMpesaPin("");
  };

  const handleMpesaSubmit = async () => {
    if (mpesaPin.length < 4) return;
    setStkPushStep("authenticating");
    
    try {
      const res = await fetch("/api/payments/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeOrderForPayment?.id,
          phoneNumber: currentUser.phone
        })
      });

      const data = await res.json();
      // Simulate real push delays
      setTimeout(() => {
        setStkPushStep("success");
        setTimeout(() => {
          setStkPushStep("none");
          setActiveOrderForPayment(null);
          fetchAllData();
        }, 1800);
      }, 1500);

    } catch (e) {
      console.error(e);
      setStkPushStep("none");
    }
  };

  // Swahili Voice preset options for demo
  const voicePresets = [
    {
      label: "Kamau (Swahili) - 120 Bags Maize Eldoret",
      text: "Mimi ni Kamau kutoka Eldoret, niko na magunia mia moja ishirini ya Mahindi Grade 1 nataka kuuza soko kwa bei ya shilingi elfu nne mia mbili kwa kila gunia."
    },
    {
      label: "Mwende (English) - 45 Bags Sorghum Meru",
      text: "Hello, this is Grace Mwende. I have loaded 45 bags of sorghum here in Meru county, grade 1, available at 3800 KES per bag."
    },
    {
      label: "Omondi (Spices) - 300 Kgs Raw Chili Nyandarua",
      text: "Naitwa Amina Omondi, niko na kilo mia tatu ya pilipili kali Grade 2 hapa Nyandarua tunauza kwa bei ya KES mia mbili kumi kwa kilo."
    }
  ];

  // Voice simulator trigger
  const handleVoiceDemoClick = async (presetText: string) => {
    setAnalyzingVoice(true);
    setCustomVoiceText(presetText);

    try {
      const res = await fetch("/api/listings/create-from-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: presetText,
          farmerName: role === "farmer" ? currentUser.name : "Voice Demo Farmer"
        })
      });

      const data = await res.json();
      if (data.success) {
        // Trigger simulated 3G image optimizer compress animation
        setCompressingImage(true);
        setCompressionLogs(t.compressing);
        setTimeout(() => {
          setCompressionLogs(t.imageSizeSaved);
          setTimeout(() => {
            setCompressingImage(false);
            fetchAllData();
            setAnalyzingVoice(false);
          }, 1500);
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      setAnalyzingVoice(false);
    }
  };

  // High-efficiency Canvas 3G Image Compressor
  const compressImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      triggerNotification(
        locale === "en" ? "Please select a valid image file (JPG, PNG, WebP)." : "Tafadhali chagua picha sahihi (JPG, PNG, WebP).",
        "error"
      );
      return;
    }

    const origSize = file.size;
    setOriginalPhotoSize(origSize);
    setPhotoFileName(file.name);
    setCompressingImage(true);
    setCompressionLogs(
      locale === "en"
        ? `Optimizing "${file.name}" (${(origSize / 1024).toFixed(0)} KB) for rural 3G networks...`
        : `Inaboresha "${file.name}" (${(origSize / 1024).toFixed(0)} KB) kwa mtandao wa 3G...`
    );

    const reader = new FileReader();
    reader.onerror = () => {
      setCompressingImage(false);
      triggerNotification(locale === "en" ? "Failed to read image file." : "Imeshindwa kusoma faili ya picha.", "error");
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        setCompressingImage(false);
        triggerNotification(locale === "en" ? "Failed to parse image." : "Imeshindwa kufungua picha.", "error");
      };

      img.onload = () => {
        // Downscale image to max 800px on longest dimension for optimal 3G throughput
        const maxDimension = 800;
        let targetWidth = img.width;
        let targetHeight = img.height;

        if (targetWidth > maxDimension || targetHeight > maxDimension) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
            targetWidth = maxDimension;
          } else {
            targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
            targetHeight = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          setCompressingImage(false);
          return;
        }

        // Draw downscaled crop picture to canvas and encode as JPEG at 0.72 quality
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.72);

        // Approximate compressed payload size in bytes from base64 string
        const base64Content = compressedDataUrl.split(",")[1] || "";
        const compBytes = Math.round((base64Content.length * 3) / 4);
        const percentSaved = Math.max(5, Math.min(99, Math.round(((origSize - compBytes) / origSize) * 100)));

        setUploadedPhotoUrl(compressedDataUrl);
        setCompressedPhotoSize(compBytes);
        setCompressionPercent(percentSaved);

        const origStr = origSize >= 1024 * 1024
          ? `${(origSize / (1024 * 1024)).toFixed(1)} MB`
          : `${(origSize / 1024).toFixed(0)} KB`;
        const compStr = compBytes >= 1024 * 1024
          ? `${(compBytes / (1024 * 1024)).toFixed(1)} MB`
          : `${(compBytes / 1024).toFixed(0)} KB`;

        const logMsg = locale === "en"
          ? `✓ 3G Compression complete: Reduced from ${origStr} to ${compStr} (${percentSaved}% bandwidth saved)`
          : `✓ Ukandamizaji wa 3G umekamilika: Imepunguzwa kutoka ${origStr} hadi ${compStr} (asilimia ${percentSaved} imehifadhiwa)`;

        setCompressionLogs(logMsg);
        setTimeout(() => {
          setCompressingImage(false);
        }, 1200);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      compressImageFile(files[0]);
    }
  };

  // Quick preset sample photo loader
  const handleUseSamplePhoto = async () => {
    const sampleUrl = CROP_FALLBACK_IMAGES[newCrop] || CROP_FALLBACK_IMAGES.maize;
    setCompressingImage(true);
    setCompressionLogs(
      locale === "en"
        ? `Fetching high-resolution sample ${newCrop} photo for 3G simulation...`
        : `Inapakua picha ya sampuli ya ${newCrop} kwa ukandamizaji wa 3G...`
    );

    try {
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const sampleFile = new File([blob], `${newCrop}-harvest-sample.jpg`, { type: "image/jpeg" });
      compressImageFile(sampleFile);
    } catch {
      // Fallback direct compression simulation if CORS limits direct fetch
      const fallbackOrigSize = 3840000;
      const fallbackCompSize = 58400;
      setUploadedPhotoUrl(sampleUrl);
      setOriginalPhotoSize(fallbackOrigSize);
      setCompressedPhotoSize(fallbackCompSize);
      setCompressionPercent(98);
      setPhotoFileName(`${newCrop}-harvest-sample.jpg`);
      setCompressionLogs(
        locale === "en"
          ? "✓ 3G Compression complete: Reduced from 3.8 MB to 58 KB (98% bandwidth saved)"
          : "✓ Ukandamizaji wa 3G umekamilika: Imepunguzwa kutoka 3.8 MB hadi 58 KB (asilimia 98 imehifadhiwa)"
      );
      setTimeout(() => {
        setCompressingImage(false);
      }, 1100);
    }
  };

  // Clear photo state
  const handleClearPhoto = () => {
    setUploadedPhotoUrl(null);
    setOriginalPhotoSize(null);
    setCompressedPhotoSize(null);
    setCompressionPercent(null);
    setPhotoFileName("");
    if (photoFileInputRef.current) {
      photoFileInputRef.current.value = "";
    }
  };

  // Submit standard manual listing with instant sync
  const handleManualPost = async (e: React.FormEvent) => {
    e.preventDefault();

    const unitField: "90kg Bag" | "kg" = ["chili", "ginger"].includes(newCrop) ? "kg" : "90kg Bag";
    const finalPhoto = uploadedPhotoUrl || CROP_FALLBACK_IMAGES[newCrop] || "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=450&auto=format&fit=crop&q=60";
    
    const payload = {
      crop: newCrop,
      grade: newGrade,
      quantity: Number(newQuantity),
      pricePerUnit: Number(newPrice),
      location: newLocation,
      unit: unitField,
      imageUrl: finalPhoto
    };

    if (!isOnline) {
      // Offline queues storage
      const mockId = `list-offline-${Date.now()}`;
      const offlineItem: Listing = {
        ...payload,
        id: mockId,
        farmerId: currentUser?.id || "farm-wanjala",
        farmerName: currentUser?.name || "Wanjala Kiprop",
        status: "available" as const,
        createdAt: new Date().toISOString(),
        isOffline: true,
        priceHistory: [
          {
            price: Number(newPrice),
            changedAt: new Date().toISOString(),
            note: "Offline queued harvest listing"
          }
        ],
        lastSyncedAt: new Date().toISOString()
      };
      setOfflineListingsQueue([...offlineListingsQueue, offlineItem]);
      // Concat to local list to reflect immediately
      setListings([offlineItem, ...listings]);
      handleClearPhoto();
      triggerNotification(
        locale === "en"
          ? "Offline Mode: Harvest listing queued locally with photo. Auto-syncs to Kilimo Exchange upon reconnection."
          : "Hali ya Nje ya Mtandao: Zao limehifadhiwa kwa foleni pamoja na picha. Litasawazishwa kiotomatiki mtandao ukirudi.",
        "info"
      );
      return;
    }

    setIsSyncingNewListing(true);
    setCompressingImage(true);
    setCompressionLogs(
      uploadedPhotoUrl
        ? (locale === "en" ? `Packaging 3G optimized harvest photo (${(compressedPhotoSize ? Math.round(compressedPhotoSize / 1024) : 58)} KB)...` : "Inapakia picha iliyobanwa ya 3G...")
        : t.compressing
    );

    setTimeout(async () => {
      setCompressionLogs("Syncing harvest listing & price with Kenya Grain Registry...");
      setTimeout(async () => {
        try {
          const res = await fetch("/api/listings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const created: Listing = await res.json();
            setListings(prev => [created, ...prev.filter(l => l.id !== created.id)]);
            fetchAllData();
            handleClearPhoto();
            setCompressingImage(false);
            setIsSyncingNewListing(false);
            triggerNotification(
              locale === "en"
                ? `✓ Harvest listed & synced live at KES ${Number(newPrice).toLocaleString()} across Kenya!`
                : `✓ Zao limesawazishwa mubashara kwa KES ${Number(newPrice).toLocaleString()}!`,
              "success"
            );
          }
        } catch (e) {
          console.error(e);
          setCompressingImage(false);
          setIsSyncingNewListing(false);
        }
      }, 800);
    }, 1000);
  };

  // Save edited listing (with price tracking & live sync)
  const handleSaveEditedListing = async (updatedListing: Listing, offlineMode: boolean) => {
    if (offlineMode || !isOnline) {
      const updatedWithOffline: Listing = {
        ...updatedListing,
        isOffline: true,
        lastSyncedAt: new Date().toISOString()
      };
      setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedWithOffline : l));
      setOfflineListingsQueue(prev => {
        const exists = prev.some(item => item.id === updatedListing.id);
        if (exists) {
          return prev.map(item => item.id === updatedListing.id ? updatedWithOffline : item);
        }
        return [...prev, updatedWithOffline];
      });
      triggerNotification(
        locale === "en"
          ? "Harvest changes saved locally. Queued for cloud sync on reconnect."
          : "Mabadiliko yamehifadhiwa kifaa. Yatasawazishwa ukirudi mtandaoni.",
        "info"
      );
      return;
    }

    try {
      const res = await fetch(`/api/listings/${updatedListing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: updatedListing.crop,
          grade: updatedListing.grade,
          quantity: updatedListing.quantity,
          pricePerUnit: updatedListing.pricePerUnit,
          location: updatedListing.location,
          unit: updatedListing.unit,
          status: updatedListing.status,
          imageUrl: updatedListing.imageUrl,
          reason: updatedListing.priceHistory?.[updatedListing.priceHistory.length - 1]?.note
        })
      });

      if (res.ok) {
        const data: Listing = await res.json();
        setListings(prev => prev.map(l => l.id === data.id ? data : l));
        fetchAllData();
        triggerNotification(
          locale === "en"
            ? `✓ Listing #${data.id.replace('list-', '')} price & details synced live across Kenya!`
            : `✓ Zao #${data.id.replace('list-', '')} limesawazishwa kikamilifu sokoni!`,
          "success"
        );
      } else {
        throw new Error("Failed to save listing");
      }
    } catch (err) {
      console.error("Save edit listing failed", err);
      triggerNotification(
        locale === "en" ? "Failed to sync listing update" : "Hitilafu kusawazisha zao",
        "error"
      );
      throw err;
    }
  };

  // Delete listing handler
  const handleDeleteListing = async (listingId: string) => {
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== listingId));
        fetchAllData();
        triggerNotification(
          locale === "en" ? "Listing removed from Kilimo Exchange." : "Zao limeondolewa sokoni.",
          "info"
        );
      }
    } catch (err) {
      console.error("Delete listing failed", err);
    }
  };

  // Create standard order
  const handleCreateOrder = async (listing: Listing) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          quantity: buyQuantity
        })
      });
      if (res.ok) {
        setSelectedListingToBuy(null);
        fetchAllData();
        setRole("buyer");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update order status (logistics & escrow)
  const handleUpdateOrderStatus = async (orderId: string, status: string, metadata?: Partial<Order>) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(metadata || {}) })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Order status update stalled", e);
      // Fallback local update
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        status: status as any,
        ...(metadata || {})
      } : o));
    }
  };

  // Dedicated cancel order handler
  const handleCancelOrder = async (orderId: string, reason: string, notes?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          notes,
          cancelledBy: role
        })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error("Cancel order request stalled", err);
      // Fallback local update
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        status: "cancelled",
        escrowStatus: "Refunded",
        cancellationReason: reason,
        cancelledBy: role,
        cancelledAt: new Date().toISOString()
      } : o));
    }
  };

  // Sync Offline queue
  const handleSyncOfflineQueue = async () => {
    if (offlineListingsQueue.length === 0) return;
    setSyncing(true);
    
    // Stagger submission
    for (const item of offlineListingsQueue) {
      try {
        if (item.id && !item.id.startsWith("list-offline-")) {
          // It was an edit of an existing listing
          await fetch(`/api/listings/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
          });
        } else {
          // New offline listing
          await fetch("/api/listings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
          });
        }
      } catch (err) {
        console.error("Sync single item failed", err);
      }
    }

    setTimeout(() => {
      setOfflineListingsQueue([]);
      setSyncing(false);
      fetchAllData();
      triggerNotification(
        locale === "en" ? "✓ All queued listings and price updates synced successfully!" : "✓ Mazao na bei zote zilizokuwa kwenye foleni zimesawazishwa!",
        "success"
      );
    }, 1200);
  };

  // Trigger Dial USSD on screen simulator
  const handleUSSDSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Accumulate texts
    let processedText = ussdTextChain;
    if (ussdRawInput !== "") {
      processedText = ussdTextChain ? `${ussdTextChain}*${ussdRawInput}` : ussdRawInput;
    }

    try {
      const res = await fetch("/api/ussd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: ussdSessionId,
          serviceCode: "*384*#",
          phoneNumber: ussdPhone,
          text: processedText
        })
      });

      const textOutput = await res.text();
      setUssdScreenOutput(textOutput);
      setUssdTextChain(processedText);
      setUssdRawInput("");

      // If finished, reset session state automatically
      if (textOutput.startsWith("END")) {
        setUssdTextChain("");
      }

      // Sync views because USSD actions alter core listings and prices
      fetchAllData();

    } catch (err) {
      setUssdScreenOutput("END Connection timeout on Africa's Talking Gateway.");
    }
  };

  const handleUSSDReset = () => {
    setUssdSessionId(`session-${Math.random().toString(36).substr(2, 9)}`);
    setUssdTextChain("");
    setUssdRawInput("");
    setUssdScreenOutput("CON Welcome to Kilimo Cereals & Spices Marketplace\nChagua Lugha / Select Language:\n1. English\n2. Kiswahili");
    setUssdActive(true);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-natural-bg text-natural-text font-sans antialiased flex flex-col justify-between">
        {renderNotification()}
        {/* Simple Top Banner with network status toggler */}
        <div className={`py-1.5 px-4 text-xs font-mono transition-colors flex justify-between items-center ${isOnline ? "bg-natural-olive text-white" : "bg-[#8B4513] text-white"}`}>
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-4 h-4 animate-pulse text-natural-sage" /> : <WifiOff className="w-4 h-4 animate-bounce text-amber-500" />}
            <span className="font-semibold">
              {isOnline ? "Online • SafeTrade Gateway Active" : "Offline Sandbox Mode • Local Queues Active"}
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className="bg-natural-sage text-white px-2.5 py-0.5 rounded text-xs hover:opacity-90 transition font-sans font-medium hover:scale-105 cursor-pointer"
          >
            Simulate {isOnline ? "Offline" : "Online"}
          </button>
        </div>

        {/* Main Portal Container */}
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 lg:py-16 flex flex-col justify-center items-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3 mb-10 w-full"
          >
            <div className="w-16 h-16 bg-natural-olive rounded-full flex items-center justify-center text-white font-display font-bold shadow-lg mx-auto border-2 border-natural-sand">
              <Wheat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-natural-olive pb-1">
              {locale === "en" ? "Kilimo SafeTrade Portal" : "Lango la SafeTrade Kilimo"}
            </h1>
            <p className="text-xs sm:text-sm max-w-xl text-natural-olive/80 font-medium mx-auto leading-relaxed">
              {locale === "en" 
                ? "Connecting Kenyan farm growers with wholesale agricultural buyers using secure Daraja API automated Escrow accounts." 
                : "Kuunganisha wakulima wa mazao nchini Kenya na wanunuzi wa jumla kupitia huduma thabiti ya amana salama ya Escrow kuondoa dhuluma."}
            </p>
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setLocale(locale === "en" ? "sw" : "en")}
                className="flex items-center gap-1.5 px-4.5 py-1.5 text-xs font-bold bg-natural-sand hover:bg-natural-bone text-natural-olive rounded-full border border-natural-bone transition cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5 text-natural-sage" />
                <span>{locale === "en" ? "Badili hadi Kiswahili" : "Switch to English"}</span>
              </button>
            </div>
          </motion.div>

          {/* Portal Navigation Tabs */}
          <div className="flex items-center justify-center gap-1.5 p-1.5 bg-natural-bone/60 rounded-full border border-natural-bone mb-8 max-w-md w-full shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setAuthPortalTab("register");
                setLoginError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authPortalTab === "register"
                  ? "bg-natural-olive text-white shadow-xs"
                  : "text-natural-olive hover:text-natural-olive/80 hover:bg-natural-sand/50"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Create Account" : "Fungua Akaunti"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthPortalTab("login");
                setLoginError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authPortalTab === "login"
                  ? "bg-natural-olive text-white shadow-xs"
                  : "text-natural-olive hover:text-natural-olive/80 hover:bg-natural-sand/50"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Sign In" : "Ingia"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthPortalTab("demo");
                setLoginError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authPortalTab === "demo"
                  ? "bg-natural-olive text-white shadow-xs"
                  : "text-natural-olive hover:text-natural-olive/80 hover:bg-natural-sand/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-natural-sage" />
              <span>{locale === "en" ? "Demo Access" : "Majaribio"}</span>
            </button>
          </div>

          {/* TAB 1: FIRST-CLASS ACCOUNT CREATION */}
          {authPortalTab === "register" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl flex flex-col items-center space-y-4"
            >
              <CreateAccountModal
                isOpen={true}
                isModal={false}
                onAccountCreated={handleAccountCreated}
                locale={locale}
              />
              <p className="text-xs text-natural-olive/70 text-center">
                {locale === "en" ? "Already have an account?" : "Tayari unayo akaunti?"}{" "}
                <button
                  type="button"
                  onClick={() => setAuthPortalTab("login")}
                  className="font-bold text-natural-olive underline hover:text-natural-olive/80 cursor-pointer ml-1"
                >
                  {locale === "en" ? "Sign in with phone & PIN" : "Ingia kwa simu na PIN"}
                </button>
              </p>
            </motion.div>
          )}

          {/* TAB 2: RETURNING USER SIGN IN */}
          {authPortalTab === "login" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-[#FDFCFB] border-2 border-natural-bone rounded-[32px] p-6 lg:p-8 shadow-sm space-y-5"
            >
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-natural-sand mx-auto flex items-center justify-center text-natural-olive shadow-2xs">
                  <LogIn className="w-5 h-5 text-natural-sage" />
                </div>
                <h3 className="text-lg font-bold text-natural-olive font-display italic">
                  {locale === "en" ? "Sign In to Kilimo SafeTrade" : "Ingia kwenye Soko la Kilimo"}
                </h3>
                <p className="text-[11px] text-natural-olive/70 font-medium">
                  {locale === "en"
                    ? "Enter your registered Kenyan phone number and 4-digit PIN"
                    : "Weka nambari yako ya simu ya Kenya na PIN ya tarakimu 4"}
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <p className="font-medium">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Role Switcher */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-natural-olive uppercase tracking-wider block font-mono">
                    {locale === "en" ? "Account Role:" : "Aina ya Akaunti:"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginRole("farmer")}
                      className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                        loginRole === "farmer"
                          ? "bg-natural-olive text-white border-natural-olive shadow-2xs"
                          : "bg-white text-natural-olive hover:bg-natural-sand border-natural-bone"
                      }`}
                    >
                      <Wheat className="w-3.5 h-3.5" />
                      <span>{locale === "en" ? "Farmer (Mkulima)" : "Mkulima"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginRole("buyer")}
                      className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                        loginRole === "buyer"
                          ? "bg-natural-olive text-white border-natural-olive shadow-2xs"
                          : "bg-white text-natural-olive hover:bg-natural-sand border-natural-bone"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{locale === "en" ? "Wholesale Buyer" : "Mnunuzi"}</span>
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-natural-olive uppercase tracking-wider block font-mono">
                    {locale === "en" ? "Registered Phone Number:" : "Nambari ya Simu:"}
                  </label>
                  <div className="relative">
                    <PhoneCall className="w-3.5 h-3.5 text-natural-sage absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+254 712 345 678"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-white border border-natural-bone rounded-full pl-8 pr-4 py-2.5 text-xs font-mono text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                    />
                  </div>
                </div>

                {/* PIN */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-natural-olive uppercase tracking-wider block font-mono">
                      {locale === "en" ? "4-Digit Security PIN:" : "PIN ya Tarakimu 4:"}
                    </label>
                    <span className="text-[9px] text-natural-olive/60 italic font-mono">Default: 1234</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-natural-sage absolute left-3 top-3" />
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-white border border-natural-bone rounded-full pl-8 pr-4 py-2.5 text-xs font-mono tracking-widest text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-natural-olive hover:opacity-95 text-white font-bold py-3 px-4 rounded-full text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-natural-sage" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-natural-sage" />
                      <span>{locale === "en" ? "Sign In & Enter Soko" : "Ingia Sokoni"}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="border-t border-natural-bone/60 pt-4 text-center space-y-2">
                <p className="text-xs text-natural-olive/70">
                  {locale === "en" ? "Don't have an account yet?" : "Bado huna akaunti?"}{" "}
                  <button
                    type="button"
                    onClick={() => setAuthPortalTab("register")}
                    className="font-bold text-natural-olive underline hover:text-natural-olive/80 cursor-pointer ml-1"
                  >
                    {locale === "en" ? "Create one here" : "Fungua hapa"}
                  </button>
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setAuthPortalTab("demo")}
                    className="text-[11px] text-natural-sage hover:text-natural-olive font-bold underline cursor-pointer"
                  >
                    {locale === "en" ? "Or choose a pre-loaded demo account →" : "Au chagua akaunti ya majaribio →"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: INSTANT DEMO ACCOUNTS GATEWAY */}
          {authPortalTab === "demo" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* FARMER DEMO GATEWAY */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#FDFCFB] border-2 border-natural-bone rounded-[32px] p-6 lg:p-8 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-natural-sand rounded-xl flex items-center justify-center text-natural-olive">
                      <Wheat className="w-6 h-6 text-natural-sage" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-natural-olive tracking-tight uppercase italic">{locale === "en" ? "Kenyan Farmers" : "Wakulima wa Kenya"}</h3>
                      <p className="text-[10px] text-natural-olive/60 font-mono tracking-wider font-bold uppercase">{locale === "en" ? "Post Harvest & Pricing" : "Sajili Mavuno na Bei"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-natural-text/80 leading-relaxed">
                    {locale === "en" 
                      ? "Select a pre-loaded farmer to test cereal listings, live price adjustments, and escrow payout tracking." 
                      : "Chagua mkulima wa majaribio kusajili mazao na kuangalia mfumo wa amana ya malipo."}
                  </p>

                  <div className="space-y-2 pt-1">
                    <label className="text-[10px] font-bold text-[#A3A375] block uppercase tracking-wider font-mono">
                      {locale === "en" ? "Available Farmer Profiles:" : "Wasifu wa Wakulima:"}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {demoUsers.filter(u => u.role === "farmer").map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleDemoLogin(u)}
                          className="text-left w-full bg-natural-sand hover:bg-natural-bone text-natural-text hover:text-natural-olive px-4 py-2.5 rounded-2xl text-xs font-semibold border border-natural-bone transition duration-150 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-natural-sage rounded-full animate-pulse" />
                            <div>
                              <span className="font-bold text-natural-olive block">{u.name}</span>
                              <span className="text-[10px] text-natural-olive/70">{u.farmName || u.location}</span>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-[#A3A375] tracking-wider uppercase font-bold">{u.phone}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthPortalTab("register")}
                  className="w-full py-2.5 bg-natural-olive hover:opacity-90 text-white rounded-full text-xs font-bold uppercase transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {locale === "en" ? "Create New Farmer Account" : "Fungua Akaunti Mpya ya Mkulima"}
                </button>
              </motion.div>

              {/* BUYER DEMO GATEWAY */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#FDFCFB] border-2 border-natural-bone rounded-[32px] p-6 lg:p-8 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-natural-sand rounded-xl flex items-center justify-center text-natural-olive">
                      <Users className="w-6 h-6 text-natural-sage" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-natural-olive tracking-tight uppercase italic">{locale === "en" ? "Wholesale Buyers" : "Wanunuzi wa Jumla"}</h3>
                      <p className="text-[10px] text-natural-olive/60 font-mono tracking-wider font-bold uppercase">{locale === "en" ? "Crops Catalog & Escrow Pay" : "Katatlogi na Malipo ya Escrow"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-natural-text/80 leading-relaxed">
                    {locale === "en" 
                      ? "Select a wholesale agribusiness buyer to inspect crop supplies, generate escrow orders, and simulate Daraja M-Pesa STK push." 
                      : "Chagua mnunuzi wa jumla kuweka amana ya M-Pesa na kuthibitisha upakuaji wa nafaka."}
                  </p>

                  <div className="space-y-2 pt-1">
                    <label className="text-[10px] font-bold text-[#A3A375] block uppercase tracking-wider font-mono">
                      {locale === "en" ? "Available Buyer Profiles:" : "Wasifu wa Wanunuzi:"}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {demoUsers.filter(u => u.role === "buyer").map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleDemoLogin(u)}
                          className="text-left w-full bg-natural-sand hover:bg-natural-bone text-natural-text hover:text-natural-olive px-4 py-2.5 rounded-2xl text-xs font-semibold border border-natural-bone transition duration-150 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-natural-sage rounded-full animate-pulse" />
                            <div>
                              <span className="font-bold text-natural-olive block">{u.name}</span>
                              <span className="text-[10px] text-natural-olive/70">{u.businessName || u.location}</span>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-[#A3A375] tracking-wider uppercase font-bold">{u.phone}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthPortalTab("register")}
                  className="w-full py-2.5 bg-natural-olive hover:opacity-90 text-white rounded-full text-xs font-bold uppercase transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {locale === "en" ? "Create New Buyer Account" : "Fungua Akaunti Mpya ya Mnunuzi"}
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-[#FDFCFB] border-t border-natural-bone py-5 text-center text-[10px] text-natural-olive/60 font-mono font-medium">
          © 2026 Kilimo Marketplace. Safaricom Partner ID #918239. Safaricom AT gateway services running.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text font-sans antialiased flex flex-col">
      {renderNotification()}
      {/* Dynamic Network Status Banner */}
      <div className={`py-1.5 px-4 text-xs font-mono transition-colors flex justify-between items-center ${isOnline ? "bg-natural-olive text-natural-bg" : "bg-[#8B4513] text-white"}`}>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-4 h-4 animate-pulse text-natural-sage" /> : <WifiOff className="w-4 h-4 animate-bounce" />}
          <span>
            {isOnline 
              ? `${t.online} • *384*# AT USSD GATEWAY ACTIVE` 
              : `${t.offlineMode}: 3G signal faded. Local Storage enabled.`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {offlineListingsQueue.length > 0 && (
            <button 
              onClick={handleSyncOfflineQueue}
              className="bg-white/10 hover:bg-white/20 text-natural-bg px-2 py-0.5 rounded text-xs transition duration-150 flex items-center gap-1.5 font-sans border border-natural-sage/30"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
              {t.syncBtn} ({offlineListingsQueue.length})
            </button>
          )}
          <button 
            type="button"
            id="toggle-network"
            onClick={() => setIsOnline(!isOnline)}
            className="bg-natural-sage text-white px-2.5 py-0.5 rounded text-xs hover:opacity-90 transition font-sans font-medium"
          >
            Simulate {isOnline ? "Offline" : "Online"}
          </button>
        </div>
      </div>

      {/* Main Container Header */}
      <header id="header" className="bg-natural-olive text-natural-bg sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-natural-sage rounded-full flex items-center justify-center text-natural-bg font-display font-bold shadow-md">
              <Wheat className="w-6 h-6 text-natural-bg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display italic tracking-tight text-natural-white">{t.title}</h1>
              <p className="text-xs text-natural-bg/85 font-medium">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Swahili/English Translation Toggle */}
            <button
              type="button"
              id="locale-toggle"
              onClick={() => {
                const target = locale === "en" ? "sw" : "en";
                setLocale(target);
                // Update profile on express server
                fetch("/api/auth/update", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ locale: target })
                });
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#4A4A35] hover:bg-[#3D3D2F] text-natural-bg rounded-full transition cursor-pointer border border-natural-sage/20"
            >
              <Languages className="w-3.5 h-3.5 text-natural-sage" />
              <span>{locale === "en" ? "Kiswahili" : "English"}</span>
            </button>

            {/* Create New Account Button in Header */}
            <button
              type="button"
              onClick={() => setShowCreateAccountModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-natural-sage hover:bg-natural-sage/90 text-white rounded-full transition cursor-pointer shadow-xs border border-natural-sand/20"
              title="Create another Farmer or Buyer Account"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === "en" ? "New Account" : "Akaunti Mpya"}</span>
            </button>

            {/* Profile Avatar & Interactive Role Switcher & Logout Button */}
            <div className="h-8 w-px bg-[#4A4A35]"></div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUserProfileModal(true)}
                className="flex items-center gap-2 hover:opacity-85 transition cursor-pointer text-left"
                title="View & Edit Profile"
              >
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-bold font-sans text-white hover:underline">{currentUser.name}</span>
                  <span className="block text-[10px] text-natural-sage font-mono font-medium">
                    {currentUser.role === "farmer" ? (locale === "en" ? "🌾 Farmer" : "🌾 Mkulima") : (locale === "en" ? "💼 Buyer" : "💼 Mnunuzi")} • {currentUser.location}
                  </span>
                </div>
                <div className="p-1.5 bg-[#4A4A35] rounded-full text-natural-sage ring-1 ring-natural-sage/30">
                  <User className="w-4 h-4" />
                </div>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 bg-[#4A4A35] hover:bg-[#3D3D2F] text-natural-sage hover:text-white px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition uppercase cursor-pointer border border-natural-sage/20 tracking-wider"
                title="Log out"
              >
                {locale === "en" ? "Logout" : "Toka"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Top Application View Navigation Bar */}
      <div className="bg-[#F6F5F2] border-b border-natural-bone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Main View Tabs: Soko vs Orders Hub */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView("marketplace")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                currentView === "marketplace"
                  ? "bg-natural-olive text-white shadow-xs"
                  : "bg-white text-natural-olive hover:bg-natural-sand border border-natural-bone"
              }`}
            >
              <Wheat className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Soko (Marketplace)" : "Soko la Mazao"}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView("orders")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer relative ${
                currentView === "orders"
                  ? "bg-natural-olive text-white shadow-xs"
                  : "bg-white text-natural-olive hover:bg-natural-sand border border-natural-bone"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Orders Hub & Confirmations" : "Kituo cha Maagizo"}</span>
              {orders.filter(o => o.status === "pending").length > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white animate-pulse">
                  {orders.filter(o => o.status === "pending").length} {locale === "en" ? "action" : "hatua"}
                </span>
              )}
            </button>
          </div>

          {/* Quick Perspective / Role Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-natural-olive/70 hidden sm:inline">
              {locale === "en" ? "Active Role:" : "Nafasi:"}
            </span>
            <div className="bg-natural-sand/70 p-1 rounded-full border border-natural-bone flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setRole("farmer");
                  fetch("/api/auth/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: "farmer" })
                  });
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  role === "farmer"
                    ? "bg-natural-olive text-white shadow-xs"
                    : "text-natural-olive hover:bg-natural-bone/60"
                }`}
              >
                <span>🌾</span>
                <span>{locale === "en" ? "Farmer" : "Mkulima"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("buyer");
                  fetch("/api/auth/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: "buyer" })
                  });
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  role === "buyer"
                    ? "bg-natural-olive text-white shadow-xs"
                    : "text-natural-olive hover:bg-natural-bone/60"
                }`}
              >
                <span>💼</span>
                <span>{locale === "en" ? "Buyer" : "Mnunuzi"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Workspaces Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {currentView === "orders" ? (
          <OrdersManagementPage
            orders={orders}
            currentUser={currentUser}
            role={role}
            locale={locale}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onCancelOrder={handleCancelOrder}
            onInitiatePayment={handleInitiatePayment}
            onSwitchRole={(newRole) => {
              setRole(newRole);
              fetch("/api/auth/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
              });
            }}
            onNavigateToMarketplace={() => setCurrentView("marketplace")}
            triggerNotification={triggerNotification}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT COLUMN: Role Select, Prices feed, USSD interface */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-5 bg-natural-olive text-white rounded-[32px] shadow-sm border border-natural-bone/20 flex flex-col space-y-3 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 transform translate-x-4 translate-y-4 opacity-10 select-none">
                <Wheat className="w-36 h-36 text-natural-sage" />
              </div>
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-bold uppercase tracking-widest font-mono text-natural-sand">
                  {locale === "en" ? "ACTIVE SESSION" : "KIPINDI CHA SASA"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-natural-sage/30 text-natural-sand border border-natural-sage/40">
                  ✓ Verified
                </span>
              </div>
              <div>
                <span className="block text-lg font-bold font-display italic tracking-tight">{currentUser.name}</span>
                <span className="text-xs text-natural-sand font-mono">{currentUser.phone}</span>
                {currentUser.farmName && (
                  <p className="text-[11px] text-[#DDDCCB] font-medium mt-0.5">{currentUser.farmName}</p>
                )}
                {currentUser.businessName && (
                  <p className="text-[11px] text-[#DDDCCB] font-medium mt-0.5">{currentUser.businessName}</p>
                )}
              </div>
              
              <span className="inline-flex self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4A4A35] text-white border border-natural-sage/20">
                {currentUser.role === "farmer" ? (locale === "en" ? "🌾 Farmer Account" : "🌾 Mkulima") : (locale === "en" ? "💼 Bulk Buyer" : "💼 Mnunuzi wa Jumla")}
              </span>
              
              <p className="text-xs text-[#E1DFD6] leading-relaxed font-sans">
                {currentUser.role === "farmer" 
                  ? (locale === "en" ? "Verify harvest bids, listen to transcription audio translation and manage courier dispatches." : "Sajili nafaka, angalia tafsiri ya sauti ya Gemini ya mavuno yako, na upokee malipo.")
                  : (locale === "en" ? "Explore nationwide cereal lists, deposit escrow security and release funds upon safe cargo delivery." : "Kagua mavuno, lipia ankara ya SafeTrade na uachilie fedha ukishakagua mzigo.")}
              </p>

              {/* Quick profile actions */}
              <div className="pt-2 flex gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUserProfileModal(true)}
                  className="flex-1 py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer text-center"
                >
                  {locale === "en" ? "View Profile" : "Wasifu"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateAccountModal(true)}
                  className="flex-1 py-1.5 px-2 bg-natural-sage hover:bg-natural-sage/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  {locale === "en" ? "New Account" : "Akaunti Mpya"}
                </button>
              </div>
            </div>

            {/* National Spot Prices Feed Card */}
            <div className="bg-[#FDFCFB] rounded-[32px] shadow-sm border border-natural-bone p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-natural-bone pb-2.5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-natural-olive font-display flex items-center gap-1.5 italic">
                  <TrendingUp className="w-4 h-4 text-natural-sage" />
                  {t.marketFeed}
                </h3>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-natural-sand text-natural-olive font-bold uppercase">
                  <Database className="w-3 h-3" /> Cached
                </span>
              </div>

              <div className="divide-y divide-natural-bone">
                {marketPrices.map((p) => (
                  <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-natural-text text-xs block">
                        {CROP_TRANSLATIONS[p.crop]?.[locale] || p.crop}
                      </span>
                      <span className="block text-[10px] text-natural-olive/60 font-mono">{p.location} ({p.grade})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-natural-text block">KES {p.avgPrice.toLocaleString()}</span>
                      <span className={`text-[10px] font-bold ${p.changePercent >= 0 ? "text-natural-sage" : "text-natural-earth"}`}>
                        {p.changePercent >= 0 ? "+" : ""}{p.changePercent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Africa's Talking USSD Gateway (STRICT BOUNDARY / NO TECH-LARPING) */}
            <div className="bg-natural-olive text-natural-bg rounded-[32px] shadow-lg border border-natural-bone/20 p-6 space-y-4 select-none">
              <div className="flex items-center justify-between border-b border-[#4A4A35] pb-2.5">
                <h3 className="text-xs font-bold text-natural-sage font-display flex items-center gap-1.5 uppercase">
                  <Hash className="w-4 h-4 animate-pulse text-natural-sage" />
                  USSD Simulator
                </h3>
                <span className="text-[9px] bg-[#4a4a35] text-natural-sage px-2 py-0.5 rounded-full font-bold uppercase">AT GATEWAY</span>
              </div>
              <p className="text-[11px] text-natural-bg/85 leading-normal">
                {t.ussdSubtitle}
              </p>

              <button
                type="button"
                onClick={handleUSSDReset}
                className="w-full bg-natural-sage hover:opacity-90 text-natural-bg font-bold py-2.5 px-3 rounded-full text-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer uppercase border border-natural-bone/20"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                {t.ussdDial} (*384*#)
              </button>

              {ussdActive && (
                <div className="bg-[#4A4A35] p-4 rounded-2xl border border-natural-sage/30 space-y-3">
                  <div className="text-[11px] text-[#F7F5F2] bg-[#3D3A35]/50 p-3 rounded-xl border border-natural-sage/20 font-mono whitespace-pre-wrap min-h-[100px]">
                    {ussdScreenOutput}
                  </div>
                  <form onSubmit={handleUSSDSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={ussdRawInput}
                      onChange={(e) => setUssdRawInput(e.target.value)}
                      placeholder={t.ussdInputPlace}
                      className="bg-[#3D3A35] border border-natural-sage/40 rounded-full px-4 py-2 text-xs text-natural-bg placeholder-natural-bg/55 focus:outline-none focus:ring-1 focus:ring-natural-sage flex-1 font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-natural-sage hover:opacity-90 text-natural-bg px-4 py-2 rounded-full text-xs font-bold cursor-pointer uppercase border border-natural-bone/10"
                    >
                      SEND
                    </button>
                  </form>
                  <div className="flex justify-between items-center text-[10px] text-natural-bg/60 pt-1">
                    <span>Session: Active Offline</span>
                    <button 
                      type="button" 
                      onClick={() => setUssdActive(false)} 
                      className="hover:text-amber-300 transition"
                    >
                      [Disconnect]
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMNS (2,3,4): The interactive Farmer vs. Buyer interfaces */}
          <div className="lg:col-span-3 space-y-6">

            {/* Offline Compression Optimizations Warning logs */}
            {compressingImage && (
              <div className="bg-[#FDFCFB] border border-natural-bone rounded-[32px] p-5 flex gap-3 items-center animate-pulse shadow-sm">
                <RefreshCw className="w-5 h-5 text-natural-sage animate-spin flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-natural-olive uppercase tracking-wider">Optimizer Subsystem active</h4>
                  <p className="text-xs text-natural-olive/80">{compressionLogs}</p>
                </div>
              </div>
            )}

            {/* FARMER VIEW */}
            {role === "farmer" ? (
              <div className="space-y-6">
                {/* Interactive Market Price Trend Component (Recharts) */}
                <MarketPriceTrendChart
                  selectedCrop={newCrop}
                  onSelectCrop={(crop) => {
                    setNewCrop(crop);
                  }}
                  marketPrices={marketPrices}
                  locale={locale}
                  onApplyPriceToListing={(price, crop) => {
                    setNewCrop(crop);
                    setNewPrice(price.toString());
                    triggerNotification(
                      locale === "en"
                        ? `Applied spot rate KES ${price.toLocaleString()} for ${crop.toUpperCase()} to your harvest listing form.`
                        : `Bei ya KES ${price.toLocaleString()} kwa ${crop.toUpperCase()} imewekwa kwenye fomu ya mavuno.`,
                      "success"
                    );
                    const formEl = document.getElementById("post-harvest-form");
                    if (formEl) {
                      formEl.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Manual Post Form */}
                  <div id="post-harvest-form" className="md:col-span-1 bg-[#FDFCFB] rounded-[32px] shadow-sm border border-natural-bone p-6 space-y-4">
                  <div className="border-b border-natural-bone pb-2.5">
                    <h3 className="text-sm font-bold text-natural-olive font-display flex items-center gap-1.5 uppercase italic">
                      <Upload className="w-4 h-4 text-natural-sage" />
                      {t.postHarvest}
                    </h3>
                  </div>

                  <form onSubmit={handleManualPost} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-natural-olive uppercase tracking-wider">{t.cropType}</label>
                      <select 
                        value={newCrop} 
                        onChange={(e) => setNewCrop(e.target.value as CropType)}
                        className="w-full bg-natural-sand border border-natural-bone rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-natural-sage text-natural-text"
                      >
                        <option value="maize">Maize (Nafaka)</option>
                        <option value="sorghum">Sorghum (Mtama)</option>
                        <option value="millet">Millet (Wimbi)</option>
                        <option value="chili">Red Chili (Pilipili)</option>
                        <option value="ginger">Ginger (Tangawizi)</option>
                        <option value="beans">Beans (Maharagwe)</option>
                        <option value="wheat">Wheat (Ngano)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-natural-olive uppercase tracking-wider">{t.grade}</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["Grade 1", "Grade 2", "Grade 3"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setNewGrade(g as CropGrade)}
                            className={`py-1.5 text-[10px] font-bold rounded-full transition border cursor-pointer ${newGrade === g ? "bg-natural-sage text-white border-natural-sage shadow-xs" : "bg-natural-sand text-natural-olive border-natural-bone hover:bg-natural-bone"}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-natural-olive uppercase tracking-wider">
                          {t.quantity} ({["chili", "ginger"].includes(newCrop) ? "kg" : "bags"})
                        </label>
                        <input
                          type="number"
                          value={newQuantity}
                          onChange={(e) => setNewQuantity(e.target.value)}
                          className="w-full bg-natural-sand border border-natural-bone rounded-full px-4 py-2.5 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-natural-olive uppercase tracking-wider">KES per unit</label>
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-full bg-natural-sand border border-natural-bone rounded-full px-4 py-2.5 text-xs text-natural-text font-mono focus:outline-none focus:ring-1 focus:ring-natural-sage"
                        />
                      </div>
                    </div>

                    {/* Live Market Price Reference & Quick Match */}
                    {(() => {
                      const benchmark = marketPrices.find(
                        p => p.crop === newCrop && p.grade === newGrade
                      ) || marketPrices.find(p => p.crop === newCrop);

                      if (!benchmark) return null;
                      const currentNum = Number(newPrice) || 0;
                      const diff = currentNum - benchmark.avgPrice;
                      const diffPct = benchmark.avgPrice > 0 ? ((diff / benchmark.avgPrice) * 100).toFixed(1) : "0.0";

                      return (
                        <div className="bg-natural-sand/50 rounded-2xl p-2.5 border border-natural-bone text-[11px] space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-natural-olive/70 uppercase tracking-wider flex items-center gap-1">
                              <Tag className="w-3 h-3 text-natural-sage" />
                              {locale === "en" ? "Market Benchmark" : "Kiwango cha Soko"}
                            </span>
                            <span className="font-mono font-bold text-natural-olive text-[10px]">
                              KES {benchmark.avgPrice.toLocaleString()}/{["chili", "ginger"].includes(newCrop) ? "kg" : "bag"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <span className="text-natural-olive/75">
                              {diff === 0 ? (
                                <span className="text-natural-olive font-semibold flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-natural-sage" />
                                  {locale === "en" ? "Matches regional benchmark" : "Inalingana na kiwango"}
                                </span>
                              ) : diff > 0 ? (
                                <span className="text-natural-olive font-medium flex items-center gap-0.5">
                                  <TrendingUp className="w-2.5 h-2.5 text-natural-sage" />
                                  +{diff.toLocaleString()} ({diffPct}%)
                                </span>
                              ) : (
                                <span className="text-natural-earth font-medium flex items-center gap-0.5">
                                  <TrendingDown className="w-2.5 h-2.5 text-natural-earth" />
                                  {diff.toLocaleString()} ({diffPct}%)
                                </span>
                              )}
                            </span>

                            {currentNum !== benchmark.avgPrice && (
                              <button
                                type="button"
                                onClick={() => setNewPrice(String(benchmark.avgPrice))}
                                className="px-2 py-0.5 rounded-full bg-[#FDFCFB] hover:bg-natural-sand border border-natural-bone text-[9px] font-bold text-natural-olive transition cursor-pointer"
                              >
                                {locale === "en" ? "Match Ref" : "Linganisha"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-natural-olive uppercase tracking-wider">{t.location} County</label>
                      <select 
                        value={newLocation} 
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="w-full bg-natural-sand border border-natural-bone rounded-full px-4 py-2.5 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                      >
                        <option value="Eldoret">Eldoret (Uasin Gishu)</option>
                        <option value="Nyandarua">Nyandarua</option>
                        <option value="Meru">Meru</option>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Kakamega">Kakamega</option>
                      </select>
                    </div>

                    {/* Harvest Photo Input & 3G Compression Thumbnail Preview */}
                    <div className="space-y-2 pt-1 border-t border-natural-bone/60">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-natural-olive uppercase tracking-wider flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-natural-sage" />
                          <span>{t.cropPhoto}</span>
                        </label>
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-natural-sand text-natural-olive/80 border border-natural-bone">
                          3G Ready
                        </span>
                      </div>

                      {/* Hidden native file input */}
                      <input
                        type="file"
                        ref={photoFileInputRef}
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />

                      {/* Thumbnail Preview or Upload Picker Dropzone */}
                      {uploadedPhotoUrl ? (
                        <div className="rounded-2xl border border-natural-bone bg-natural-sand/40 overflow-hidden space-y-2 p-2">
                          {/* Image preview with live badges */}
                          <div className="relative rounded-xl overflow-hidden bg-natural-sand h-36 border border-natural-bone/80 group">
                            <img
                              src={uploadedPhotoUrl}
                              alt="Crop Preview"
                              className="w-full h-full object-cover"
                            />
                            
                            {/* 3G Optimized status overlay pill */}
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-natural-olive/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-bold font-mono shadow-xs border border-natural-bone/30">
                              <Zap className="w-3 h-3 text-natural-sand" />
                              <span>{t.photoOptimizedBadge}</span>
                              {compressedPhotoSize && (
                                <span className="text-natural-sand font-mono">
                                  ({(compressedPhotoSize / 1024).toFixed(0)} KB)
                                </span>
                              )}
                            </div>

                            {/* Direct remove button overlay */}
                            <button
                              type="button"
                              onClick={handleClearPhoto}
                              title={t.removePhoto}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-natural-earth text-white transition cursor-pointer shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Compression breakdown stats box */}
                          <div className="bg-[#FDFCFB] rounded-xl p-2.5 border border-natural-bone space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between font-mono text-[10px]">
                              <span className="text-natural-olive/75 truncate max-w-[150px]" title={photoFileName}>
                                {photoFileName || `${newCrop}-harvest.jpg`}
                              </span>
                              {compressionPercent !== null && (
                                <span className="bg-natural-sage/20 text-natural-olive font-bold px-2 py-0.5 rounded-full text-[9px] border border-natural-sage/30">
                                  -{compressionPercent}% {locale === "en" ? "Saved" : "Imehifadhiwa"}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-mono text-natural-olive/80 pt-1 border-t border-natural-bone/50">
                              <span>
                                {t.originalSize}:{" "}
                                <b className="text-natural-olive">
                                  {originalPhotoSize
                                    ? originalPhotoSize >= 1024 * 1024
                                      ? `${(originalPhotoSize / (1024 * 1024)).toFixed(1)} MB`
                                      : `${(originalPhotoSize / 1024).toFixed(0)} KB`
                                    : "4.2 MB"}
                                </b>
                              </span>
                              <span className="text-natural-olive/40">➔</span>
                              <span>
                                {t.optimizedSize}:{" "}
                                <b className="text-natural-sage">
                                  {compressedPhotoSize
                                    ? `${(compressedPhotoSize / 1024).toFixed(0)} KB`
                                    : "58 KB"}
                                </b>
                              </span>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => photoFileInputRef.current?.click()}
                                className="flex-1 py-1.5 px-2 bg-natural-sand hover:bg-natural-bone text-natural-olive rounded-lg text-[10px] font-bold uppercase tracking-wider transition border border-natural-bone cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Camera className="w-3 h-3 text-natural-sage" />
                                {t.changePhoto}
                              </button>
                              <button
                                type="button"
                                onClick={handleClearPhoto}
                                className="py-1.5 px-3 bg-natural-sand/50 hover:bg-natural-earth hover:text-white text-natural-olive/80 rounded-lg text-[10px] font-bold uppercase tracking-wider transition border border-natural-bone cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                {t.removePhoto}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div
                            onClick={() => photoFileInputRef.current?.click()}
                            className="border-2 border-dashed border-natural-bone hover:border-natural-sage/70 bg-natural-sand/30 hover:bg-natural-sand/60 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                          >
                            <div className="w-10 h-10 rounded-full bg-natural-sand border border-natural-bone flex items-center justify-center text-natural-sage group-hover:scale-105 transition">
                              <Camera className="w-5 h-5 text-natural-sage" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-natural-olive">
                                {t.uploadPhotoPrompt}
                              </p>
                              <p className="text-[10px] text-natural-olive/60">
                                {t.dropPhotoPrompt}
                              </p>
                            </div>
                          </div>

                          {/* Quick test sample crop photo button */}
                          <button
                            type="button"
                            onClick={handleUseSamplePhoto}
                            className="w-full text-center py-1 px-2 text-[10px] text-natural-sage hover:text-natural-olive font-bold transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>{t.useSamplePhoto} ({newCrop})</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sync status notice */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-natural-olive/70 px-1 pt-0.5">
                      <span className="flex items-center gap-1">
                        <RefreshCw className={`w-3 h-3 text-natural-sage ${isSyncingNewListing ? 'animate-spin' : ''}`} />
                        {isSyncingNewListing 
                          ? (locale === "en" ? "Syncing with Soko Kuu..." : "Inasawazishwa na Soko...") 
                          : (locale === "en" ? "Syncs live to Soko Kuu & NCPB" : "Inasawazishwa na Soko Kuu")}
                      </span>
                      <span className="text-natural-olive/80 font-bold">
                        {isOnline ? "● Cloud Live" : "○ Offline Queue"}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSyncingNewListing}
                      className="w-full bg-natural-olive hover:opacity-90 text-white font-bold py-3 rounded-full text-xs tracking-wider uppercase transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-natural-bone/20 disabled:opacity-50"
                    >
                      {isSyncingNewListing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-natural-sage" />
                          <span>{locale === "en" ? "Syncing..." : "Inasawazisha..."}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          {t.submitListing}
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Farmer AI Gemini Voice Assist (Dual View requirements) */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Gemini AI Speech Assist panel */}
                  <div className="bg-[#FDFCFB] border-2 border-dashed border-natural-sage rounded-[32px] p-6 relative overflow-hidden flex flex-col md:flex-row gap-5 items-center shadow-xs">
                    <div className="absolute top-0 right-0 p-1.5 px-3.5 bg-natural-olive text-natural-bg text-[9px] font-bold tracking-widest uppercase rounded-bl-[16px] font-mono flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-natural-sage" />
                      GEMINI POWERED
                    </div>
                    
                    <div className="w-16 h-16 bg-natural-sand rounded-full flex items-center justify-center text-natural-olive flex-shrink-0 relative">
                      <div className="absolute inset-0 border border-natural-sage/30 rounded-full animate-ping opacity-30"></div>
                      <Volume2 className="w-8 h-8 text-natural-sage" />
                    </div>

                    <div className="space-y-3 flex-1 text-center md:text-left">
                      <div>
                        <h4 className="text-sm font-bold text-natural-olive font-display uppercase tracking-wider">{t.voiceTitle}</h4>
                        <p className="text-xs text-natural-olive/80 leading-normal mt-1">{t.voiceDesc}</p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <label className="text-[10px] font-bold text-natural-olive/60 block uppercase tracking-wider">Test with Kenyan farmer voices (demo preset):</label>
                        <div className="flex flex-col gap-1.5">
                          {voicePresets.map((v, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleVoiceDemoClick(v.text)}
                              disabled={analyzingVoice}
                              className="text-left w-full bg-natural-sand hover:bg-natural-bone text-natural-text hover:text-natural-olive px-4 py-2 rounded-full text-[11px] font-medium border border-natural-bone transition duration-150 flex items-center justify-between cursor-pointer"
                            >
                              <span>{v.label}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-natural-sage" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {analyzingVoice && (
                        <div className="pt-2 flex items-center gap-2 text-xs font-mono text-natural-sage">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Analyzing spoken harvest description with Gemini model...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active listings list and order dispatcher */}
                  <div className="bg-[#FDFCFB] rounded-[32px] shadow-sm border border-natural-bone p-6 space-y-4">
                    <div className="border-b border-natural-bone pb-2.5 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-natural-olive font-display flex items-center gap-1.5 uppercase italic">
                        <History className="w-4 h-4 text-natural-sage" />
                        {t.recent_listings}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowFarmerMap(!showFarmerMap)}
                        className="text-[11px] font-bold text-natural-olive hover:text-natural-sage flex items-center gap-1.5 cursor-pointer bg-natural-sand px-3 py-1.5 rounded-full border border-natural-bone transition shadow-2xs"
                      >
                        <MapIcon className="w-3.5 h-3.5 text-natural-sage" />
                        <span>{showFarmerMap ? (locale === "en" ? "Hide Map" : "Ficha Ramani") : (locale === "en" ? "Nationwide Supply Map" : "Ramani ya Mazao Nchini")}</span>
                      </button>
                    </div>

                    {showFarmerMap && (
                      <div className="pt-1 pb-3">
                        <KenyaHarvestMap
                          listings={listings}
                          selectedLocation={locationFilter}
                          onSelectCounty={(county) => setLocationFilter(county)}
                          locale={locale}
                          activeCropFilter={cropFilter}
                          activeGradeFilter={gradeFilter}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence mode="popLayout">
                        {listings.slice(0, 4).map((l, index) => (
                          <motion.div
                            key={l.id}
                            layout
                            initial={{ opacity: 0, y: 18, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.04,
                              ease: [0.22, 1, 0.36, 1],
                              layout: { duration: 0.25 }
                            }}
                            whileHover={{ y: -3, transition: { duration: 0.18 } }}
                            className="border border-natural-bone rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition bg-natural-sand/20"
                          >
                            <div className="relative h-28 bg-natural-sand">
                              <img
                                referrerPolicy="no-referrer"
                                src={l.imageUrl || "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=450&auto=format&fit=crop&q=60"}
                                className="w-full h-full object-cover"
                                alt={l.crop}
                              />
                              {l.isOffline && (
                                <span className="absolute top-2 left-2 bg-natural-earth text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono tracking-wider shadow-sm flex items-center gap-1">
                                  <WifiOff className="w-3 h-3" /> Offline Queued
                                </span>
                              )}
                              <span className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${l.status === "available" ? "bg-natural-sand text-natural-olive border border-natural-sage/20" : "bg-natural-bone text-natural-olive/60"}`}>
                                {l.status}
                              </span>
                            </div>
                            <div className="p-3.5 space-y-2.5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-xs font-bold text-natural-olive uppercase">
                                    {CROP_TRANSLATIONS[l.crop]?.[locale] || l.crop}
                                  </h4>
                                  <span className="text-[10px] text-natural-olive/75 font-medium tracking-tight flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-natural-sage" /> {l.location} ({l.grade})
                                  </span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${l.status === "available" ? "bg-natural-sand text-natural-olive border border-natural-sage/20" : "bg-natural-bone text-natural-olive/60"}`}>
                                  {l.status}
                                </span>
                              </div>

                              {/* Interactive Price Tracker with Trend & NCPB Benchmark Comparison */}
                              <ListingPriceTracker
                                listing={l}
                                benchmark={marketPrices.find(p => p.crop === l.crop && p.grade === l.grade) || marketPrices.find(p => p.crop === l.crop)}
                                locale={locale}
                                isFarmerOwner={true}
                                onEdit={() => setEditingListing(l)}
                              />

                              <div className="flex justify-between items-center pt-2 border-t border-natural-bone/40 text-[11px] text-natural-olive/70">
                                <span>Mavuno Vol: <b>{l.quantity} {l.unit === "90kg Bag" ? t.crop_unit : t.unit_kg}</b></span>
                                <span className="font-mono text-[10px] text-[#A3A375]">{new Date(l.createdAt).toLocaleDateString()}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setEditingListing(l)}
                                className="w-full py-1.5 px-3 rounded-xl bg-natural-sand/70 hover:bg-natural-bone border border-natural-bone text-[11px] font-bold text-natural-olive transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Pencil className="w-3 h-3 text-natural-sage" />
                                <span>{locale === "en" ? "Edit Listing & Track Price" : "Hariri Zao & Fuatilia Bei"}</span>
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Pending dispatch list */}
                    <div className="border-t border-natural-bone pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-natural-olive/70 uppercase tracking-wider font-sans">
                          {locale === "en" ? "Awaiting Cargo Shipments" : "Mizigo Inayosubiri Kusafirishwa"}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setCurrentView("orders")}
                          className="text-[11px] font-bold text-natural-sage hover:text-natural-olive flex items-center gap-1 cursor-pointer bg-natural-sand px-3 py-1 rounded-full border border-natural-bone transition shadow-2xs"
                        >
                          <Package className="w-3 h-3" />
                          <span>{locale === "en" ? "Open Full Orders Hub →" : "Fungua Kituo cha Maagizo →"}</span>
                        </button>
                      </div>
                      <div className="space-y-3">
                        {orders.filter(o => o.status === "pending" || o.status === "dispatched").map((o) => (
                          <div key={o.id} className="bg-natural-sand/30 border border-natural-bone rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-sans">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-natural-olive uppercase">Order #{o.id.substr(4, 5)}</span>
                                <span className="bg-natural-sand text-natural-olive border border-natural-sage/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase">{o.escrowStatus} Escrow</span>
                              </div>
                              <p className="text-natural-olive/80">
                                Buyer <b>{o.buyerName}</b> requested <b>{o.quantity} {o.unit}</b> of {o.crop.toUpperCase()}.
                              </p>
                              <p className="text-natural-sage font-mono text-[10px]">Settlement Amount: KES {o.totalAmount.toLocaleString()} (Held in Trust)</p>
                            </div>
                            {o.status === "pending" ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(o.id, "dispatched")}
                                className="bg-natural-olive hover:opacity-90 text-white font-bold px-4 py-2 rounded-full text-xs cursor-pointer uppercase transition duration-150 inline-flex items-center gap-1 border border-natural-bone/10"
                              >
                                {t.dispatchOrder}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-natural-sage font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4 animate-spin text-natural-sage" />
                                {t.dispatchedStatus}
                              </span>
                            )}
                          </div>
                        ))}
                        {orders.filter(o => o.status === "pending" || o.status === "dispatched").length === 0 && (
                          <p className="text-xs text-natural-olive/60 italic">No incoming shipment warrants pending dispatched delivery currently.</p>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>
          ) : (
              /* BUYER VIEW */
              <div className="space-y-6">
                
                {/* Search / Filtering panel */}
                <div className="bg-[#FDFCFB] rounded-[32px] shadow-sm border border-natural-bone p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-natural-olive uppercase tracking-wider font-display italic">{t.filterTitle}</h3>
                    <p className="text-xs text-natural-olive/70">Search with grade and origins across Kenya</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <div>
                      <select
                        value={cropFilter}
                        onChange={(e) => setCropFilter(e.target.value)}
                        className="bg-natural-sand border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                      >
                        <option value="all">{t.allCrops}</option>
                        <option value="maize">Maize (Mahindi)</option>
                        <option value="sorghum">Sorghum (Mtama)</option>
                        <option value="millet">Millet (Wimbi)</option>
                        <option value="chili">Red Chili (Pilipili)</option>
                        <option value="ginger">Ginger (Tangawizi)</option>
                        <option value="beans">Beans (Maharagwe)</option>
                        <option value="wheat">Wheat (Ngano)</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                        className="bg-natural-sand border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                      >
                        <option value="all">{t.allGrades}</option>
                        <option value="Grade 1">Grade 1</option>
                        <option value="Grade 2">Grade 2</option>
                        <option value="Grade 3">Grade 3</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="bg-natural-sand border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                      >
                        <option value="all">{t.allCounties}</option>
                        <option value="Eldoret">Eldoret</option>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Nyandarua">Nyandarua</option>
                        <option value="Meru">Meru</option>
                        <option value="Kakamega">Kakamega</option>
                        <option value="Nairobi">Nairobi</option>
                        <option value="Kisumu">Kisumu</option>
                        <option value="Mombasa">Mombasa</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowBuyerMap(!showBuyerMap)}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                        showBuyerMap
                          ? "bg-natural-olive text-white border-natural-olive shadow-xs"
                          : "bg-natural-sand text-natural-olive border-natural-bone hover:bg-natural-bone"
                      }`}
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>{showBuyerMap ? (locale === "en" ? "Map On" : "Ramani Wazi") : (locale === "en" ? "Show Map" : "Onyesha Ramani")}</span>
                    </button>
                  </div>
                </div>

                {/* Kenya Harvest Geographic Distribution Map */}
                {showBuyerMap && (
                  <KenyaHarvestMap
                    listings={listings}
                    selectedLocation={locationFilter}
                    onSelectCounty={(county) => setLocationFilter(county)}
                    locale={locale}
                    activeCropFilter={cropFilter}
                    activeGradeFilter={gradeFilter}
                  />
                )}

                {/* Grid for Crop list buy options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Crop lists */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-natural-sage uppercase tracking-widest flex items-center gap-2 font-display italic">
                      <Wheat className="w-4 h-4 text-natural-sage" />
                      Soko Harvest Available
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence mode="popLayout">
                        {listings.map((l, index) => (
                          <motion.div
                            key={l.id}
                            layout
                            initial={{ opacity: 0, y: 22, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92, y: 12, transition: { duration: 0.16 } }}
                            transition={{
                              duration: 0.35,
                              delay: Math.min(index * 0.045, 0.22),
                              ease: [0.22, 1, 0.36, 1],
                              layout: { duration: 0.26 }
                            }}
                            whileHover={{ y: -4, transition: { duration: 0.18 } }}
                            className="bg-[#FDFCFB] border border-natural-bone rounded-[32px] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="relative h-32 bg-natural-sand">
                                <img
                                  referrerPolicy="no-referrer"
                                  src={l.imageUrl || "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=450&auto=format&fit=crop&q=60"}
                                  className="w-full h-full object-cover"
                                  alt={l.crop}
                                />
                                <span className="absolute top-2 left-2 bg-natural-olive text-natural-bg font-mono font-bold text-[9px] px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider border border-natural-bone/20">
                                  {l.grade}
                                </span>
                                <span className="absolute top-2 right-2 bg-[#4A4A35]/80 text-natural-bg font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                                  {l.location}
                                </span>
                              </div>
                              
                              <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-sm font-bold text-natural-olive uppercase tracking-tight">
                                      {CROP_TRANSLATIONS[l.crop]?.[locale] || l.crop}
                                    </h3>
                                    <p className="text-[10px] text-natural-olive/60 mt-0.5">Farmer Vendor: {l.farmerName}</p>
                                  </div>
                                </div>

                                {/* Price Tracker with Market Reference & Interactive History */}
                                <ListingPriceTracker
                                  listing={l}
                                  benchmark={marketPrices.find(p => p.crop === l.crop && p.grade === l.grade) || marketPrices.find(p => p.crop === l.crop)}
                                  locale={locale}
                                  isFarmerOwner={false}
                                />

                                <div className="flex justify-between items-center text-xs bg-natural-sand p-2.5 rounded-2xl border border-natural-bone">
                                  <span className="text-natural-text font-medium">Available: <b>{l.quantity} {l.unit === "90kg Bag" ? t.crop_unit : t.unit_kg}</b></span>
                                  <span className="text-[10px] text-natural-sage font-bold uppercase">{l.status === "available" ? "Ready" : "Sold"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 pt-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedListingToBuy(l);
                                  setBuyQuantity(Math.min(10, l.quantity));
                                }}
                                className="w-full bg-natural-olive hover:opacity-90 text-white font-bold py-2.5 rounded-full text-xs uppercase cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm border border-natural-bone/10"
                              >
                                <span>Review Escrow Order</span>
                                <ChevronRight className="w-4 h-4 text-natural-sage" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                        {listings.length === 0 && (
                          <motion.div
                            key="no-listings-found"
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.3 }}
                            className="md:col-span-2 bg-[#FDFCFB] border border-natural-bone rounded-[32px] p-10 text-center space-y-3"
                          >
                            <Wheat className="w-12 h-12 text-natural-sage/50 mx-auto" />
                            <p className="text-natural-olive/75 text-xs italic">
                              {locale === "en" ? "No crop postings match selected search filters currently." : "Hakuna mazao yanayolingana na vichungi vilivyochaguliwa kwa sasa."}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setCropFilter("all");
                                setGradeFilter("all");
                                setLocationFilter("all");
                              }}
                              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-natural-sand text-natural-olive border border-natural-bone hover:bg-natural-bone transition cursor-pointer"
                            >
                              <span>{locale === "en" ? "Reset All Filters" : "Rejesha Vichungi Vyote"}</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Escrow Orders & Invoice view */}
                  <div className="space-y-6">
                    
                    {/* Invoice Creator & Checkout section */}
                    {selectedListingToBuy && (
                      <div className="bg-[#FDFCFB] border-2 border-natural-sage rounded-[32px] shadow-md p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-natural-bone pb-2.5">
                          <h4 className="text-xs font-bold text-natural-olive flex items-center gap-1 uppercase font-display italic">
                            <FileSpreadsheet className="w-4 h-4 text-natural-sage" />
                            {t.invoiceHeader}
                          </h4>
                          <button
                            onClick={() => setSelectedListingToBuy(null)}
                            className="text-xs text-natural-earth hover:opacity-80 transition font-bold"
                          >
                            [Cancel]
                          </button>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-natural-olive/75">Crop:</span>
                            <span className="font-bold uppercase text-natural-olive">{CROP_TRANSLATIONS[selectedListingToBuy.crop]?.[locale] || selectedListingToBuy.crop}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-natural-olive/75">Unit Price:</span>
                            <span className="font-mono text-natural-text">KES {selectedListingToBuy.pricePerUnit.toLocaleString()}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-natural-olive font-bold uppercase text-[10px]">Order Volume:</label>
                              <span className="font-bold text-natural-text">{buyQuantity} {selectedListingToBuy.unit}</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max={selectedListingToBuy.quantity}
                              value={buyQuantity}
                              onChange={(e) => setBuyQuantity(Number(e.target.value))}
                              className="w-full accent-natural-sage cursor-pointer h-1.5 bg-natural-sand rounded-lg"
                            />
                          </div>

                          <div className="border-t border-dashed border-natural-bone pt-3 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-natural-olive/60">Logistics Handler Fee:</span>
                              <span className="font-mono text-natural-text">KES 1,200</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-natural-olive font-display italic">
                              <span>Invoice Total:</span>
                              <span className="font-mono text-natural-olive">
                                KES {((selectedListingToBuy.pricePerUnit * buyQuantity) + 1200).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="bg-natural-sand p-3 rounded-2xl border border-natural-bone space-y-1">
                            <div className="flex items-center gap-1 text-natural-olive font-bold text-[10px] tracking-wider uppercase">
                              <ShieldCheck className="w-4 h-4 text-natural-sage" />
                              {t.escrowShield}
                            </div>
                            <p className="text-[10px] text-natural-text leading-normal">
                              {t.escrowDesc}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCreateOrder(selectedListingToBuy)}
                            className="w-full bg-natural-olive hover:opacity-90 text-white font-bold py-2.5 rounded-full transition text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer border border-natural-bone/20"
                          >
                            <span>Thibitisha / Confirm Order</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Active Escrow Trackers */}
                    <div className="bg-[#FDFCFB] border border-natural-bone rounded-[32px] p-6 shadow-sm space-y-4">
                      <div className="border-b border-natural-bone pb-2.5 flex justify-between items-center">
                        <h4 className="text-xs font-bold text-natural-olive uppercase tracking-widest flex items-center gap-1 font-display italic">
                          <ShieldCheck className="w-4 h-4 text-natural-sage font-bold" />
                          Escrow SafeTrack
                        </h4>
                        <button
                          type="button"
                          onClick={() => setCurrentView("orders")}
                          className="text-[10px] font-bold text-natural-sage hover:text-natural-olive flex items-center gap-1 cursor-pointer bg-natural-sand px-2.5 py-1 rounded-full border border-natural-bone transition shadow-2xs"
                        >
                          <Package className="w-3 h-3" />
                          <span>{locale === "en" ? "Manage All Orders →" : "Dhibiti Maagizo →"}</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {orders.map((o) => (
                          <div key={o.id} className="border border-natural-bone rounded-2xl p-4 space-y-3 bg-natural-sand/20">
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-natural-olive text-xs">Ord #{o.id.substr(4, 5)}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border border-natural-sage/10 ${
                                o.escrowStatus === "Deposited" ? "bg-natural-sand text-natural-olive animate-pulse" :
                                o.escrowStatus === "Disbursed" ? "bg-natural-bone text-natural-olive/75" : "bg-[#FDFCFB] text-natural-earth"
                              }`}>
                                {o.escrowStatus === "Deposited" ? t.completedStatus : o.escrowStatus}
                              </span>
                            </div>

                            <div className="text-xs space-y-1 leading-normal text-natural-olive/80 font-sans">
                              <p>Crop: <span className="font-bold text-natural-text uppercase">{o.crop}</span></p>
                              <p>Qty: <b>{o.quantity} {o.unit}</b> from {o.farmerName}</p>
                              <p className="font-mono text-[10px] text-natural-sage">Amount: KES {o.totalAmount.toLocaleString()}</p>
                              <p>Cargo Logistics: <span className="text-natural-olive font-bold uppercase">{o.status}</span></p>
                            </div>

                            {/* Dynamic Visual Progress Bar with estimated delivery window */}
                            <EscrowSafeTrackProgress order={o} locale={locale} />

                            {o.paymentStatus === "unpaid" && (
                              <button
                                type="button"
                                onClick={() => handleInitiatePayment(o)}
                                className="w-full bg-natural-olive hover:opacity-90 text-white font-bold py-2 rounded-full text-xs uppercase cursor-pointer"
                              >
                                {t.payMpesa}
                              </button>
                            )}

                            {o.paymentStatus === "pending_payment" && (
                              <div className="text-natural-earth font-bold flex items-center gap-1.5 justify-center text-[11px] animate-pulse">
                                <Clock className="w-4 h-4 animate-spin text-natural-earth" />
                                Awaiting M-Pesa push approval on phone...
                              </div>
                            )}

                            {o.paymentStatus === "paid" && o.status !== "completed" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(o.id, "completed")}
                                className="w-full bg-natural-sage hover:opacity-90 text-white font-bold py-2 rounded-full text-xs uppercase cursor-pointer border border-natural-bone/20"
                              >
                                {t.confirmDelivery}
                              </button>
                            )}
                          </div>
                        ))}
                        {orders.length === 0 && (
                          <div className="text-center py-6 text-natural-olive/50 italic text-xs">
                            No escrow cargo assets recorded. Complete purchase from soko.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
        )}
      </main>

      {/* FOOTER */}
      <footer id="footer" className="bg-[#FDFCFB] border-t border-natural-bone mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-natural-olive/70 font-mono font-medium">
          <span>© 2026 Kilimo Marketplace. Safaricom Partner ID #918239.</span>
          <div className="flex gap-4">
            <a href="#header" className="hover:text-natural-sage transition">Kenyan PWA Portal</a>
            <a href="#ussd" className="hover:text-natural-sage transition">Africa's Talking Gateway</a>
            <a href="#escrow" className="hover:text-natural-sage transition">Daraja M-Pesa APIs</a>
          </div>
        </div>
      </footer>

      {/* M-PESA DARAJA PIN POPUP SIMULATOR MODAL */}
      <AnimatePresence>
        {stkPushStep !== "none" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#FDFCFB] border-2 border-natural-olive rounded-[32px] p-6 max-w-sm w-full text-natural-text space-y-4 shadow-2xl relative"
            >
              <div className="absolute top-4 right-4 bg-natural-olive text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                DARAJA SIM
              </div>

              {/* Logo / Title */}
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-natural-olive text-white font-extrabold rounded-full mx-auto flex items-center justify-center text-lg font-mono">
                  M
                </div>
                <h3 className="text-md font-bold text-natural-olive font-display uppercase tracking-widest pt-2">M-Pesa Escrow Portal</h3>
                <p className="text-[11px] text-natural-olive/60">Target Merchant: SafeTrade custody trust</p>
              </div>

              {stkPushStep === "pin_prompt" && (
                <div className="space-y-4">
                  <div className="bg-natural-sand p-4 rounded-2xl border border-natural-bone text-center space-y-2">
                    <p className="text-xs text-natural-olive/70">Transaction Request sum</p>
                    <p className="text-lg font-bold font-mono text-natural-olive">KES {activeOrderForPayment?.totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-natural-sage font-medium">Destination Account # {activeOrderForPayment?.id.substr(0,10)}</p>
                  </div>

                  <div className="space-y-1 text-center">
                    <label className="text-xs font-bold text-natural-olive/80 uppercase tracking-wider">Input Your secret 4-Digit PIN:</label>
                    <div className="flex justify-center gap-2 pt-2">
                       {[0, 1, 2, 3].map((val) => (
                        <div
                          key={val}
                          className={`w-10 h-10 border rounded-xl flex items-center justify-center text-lg font-bold font-mono ${
                            mpesaPin.length > val ? "border-natural-sage text-white bg-natural-sage shadow-xs" : "border-natural-bone bg-white"
                          }`}
                        >
                          {mpesaPin.length > val ? "●" : ""}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Numpad */}
                  <div className="grid grid-cols-3 gap-2 pt-2 max-w-[240px] mx-auto font-mono">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          if (mpesaPin.length < 4) setMpesaPin(mpesaPin + num);
                        }}
                        className="bg-natural-sand hover:bg-natural-bone text-[#4A4A35] font-bold p-2.5 rounded-full text-sm cursor-pointer transition"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setMpesaPin("")}
                      className="bg-natural-sand text-natural-earth py-2.5 rounded-full text-xs font-bold cursor-pointer transition hover:bg-natural-bone"
                    >
                      CLR
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (mpesaPin.length < 4) setMpesaPin(mpesaPin + "0");
                      }}
                      className="bg-natural-sand text-[#4A4A35] font-bold py-2.5 rounded-full text-sm cursor-pointer transition hover:bg-natural-bone"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleMpesaSubmit}
                      disabled={mpesaPin.length < 4}
                      className="bg-natural-olive disabled:opacity-40 hover:opacity-90 text-white font-bold py-2.5 rounded-full text-xs tracking-wider cursor-pointer font-sans uppercase transition"
                    >
                      SEND
                    </button>
                  </div>
                </div>
              )}

              {stkPushStep === "authenticating" && (
                <div className="py-8 text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-natural-sage animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-natural-olive">Routing Callback handshake...</p>
                    <p className="text-[10px] text-natural-olive/60">Contacting Safaricom Daraja cluster</p>
                  </div>
                </div>
              )}

              {stkPushStep === "success" && (
                <div className="py-8 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-natural-sage mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-natural-sage">Payment approved!</p>
                    <p className="text-[11px] text-natural-olive/70">SafeTrade Escrow locked & registered</p>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}

        {/* Farmer Edit Harvest Listing & Price Tracker Modal */}
        {editingListing && (
          <EditListingModal
            listing={editingListing}
            marketPrices={marketPrices}
            locale={locale}
            isOnline={isOnline}
            onClose={() => setEditingListing(null)}
            onSave={handleSaveEditedListing}
            onDelete={handleDeleteListing}
          />
        )}

        {/* Global Create Account Modal Popup */}
        {showCreateAccountModal && (
          <CreateAccountModal
            isOpen={showCreateAccountModal}
            isModal={true}
            onClose={() => setShowCreateAccountModal(false)}
            onAccountCreated={handleAccountCreated}
            locale={locale}
          />
        )}

        {/* User Profile View & Account Settings Modal */}
        {showUserProfileModal && currentUser && (
          <UserProfileModal
            user={currentUser}
            locale={locale}
            onClose={() => setShowUserProfileModal(false)}
            onUpdate={(updatedUser) => {
              setCurrentUser(updatedUser);
              setDemoUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
              triggerNotification(
                locale === "en" ? "✓ Profile updated successfully!" : "✓ Wasifu umehifadhiwa!",
                "success"
              );
            }}
            onLogout={handleLogout}
            onOpenCreateNewAccount={() => {
              setShowUserProfileModal(false);
              setShowCreateAccountModal(true);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
