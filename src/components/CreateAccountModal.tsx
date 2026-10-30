/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wheat,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  User as UserIcon,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Coins,
  Check
} from "lucide-react";
import { User, CropType } from "../types";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAccountCreated: (newUser: User) => void;
  locale: "en" | "sw";
  initialRole?: "farmer" | "buyer";
  isModal?: boolean;
}

const KENYAN_COUNTIES = [
  "Eldoret (Uasin Gishu)",
  "Kitale (Trans-Nzoia)",
  "Nakuru",
  "Meru",
  "Nyandarua",
  "Nairobi",
  "Kakamega",
  "Bungoma",
  "Machakos",
  "Kisumu",
  "Mombasa",
  "Narok"
];

const AVAILABLE_CROPS: { id: CropType; label: string; icon: string }[] = [
  { id: "maize", label: "Maize (Mahindi)", icon: "🌽" },
  { id: "sorghum", label: "Sorghum (Mtama)", icon: "🌾" },
  { id: "millet", label: "Millet (Uwele)", icon: "🥣" },
  { id: "wheat", label: "Wheat (Ngano)", icon: "🌾" },
  { id: "beans", label: "Beans (Maharagwe)", icon: "🫘" },
  { id: "chili", label: "Chili Pepper (Pilipili)", icon: "🌶️" },
  { id: "ginger", label: "Ginger (Tangawizi)", icon: "🫚" }
];

const BUYER_TYPES = [
  "Miller / Flour Processor (Kusaga Unga)",
  "Supermarket / Retail Chain",
  "Grain Exporter / Regional Trader",
  "Food Aggregator / Broker",
  "School / Hospital / Public Institution",
  "Animal & Poultry Feed Manufacturer"
];

const PAYOUT_CHANNELS = [
  "Safaricom M-Pesa (Direct STK & Payout)",
  "Co-operative Bank of Kenya",
  "Equity Bank Kilimo Escrow",
  "KCB Bank Agribusiness"
];

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountCreated,
  locale,
  initialRole = "farmer",
  isModal = false
}) => {
  // Form State
  const [role, setRole] = useState<"farmer" | "buyer">(initialRole);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [location, setLocation] = useState<string>("Eldoret (Uasin Gishu)");
  const [pin, setPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [preferredLocale, setPreferredLocale] = useState<"en" | "sw">(locale);

  // Farmer specific
  const [farmName, setFarmName] = useState<string>("");
  const [farmSizeAcres, setFarmSizeAcres] = useState<string>("5 - 20 Acres");
  const [selectedCrops, setSelectedCrops] = useState<CropType[]>(["maize", "wheat"]);
  const [cooperative, setCooperative] = useState<string>("");
  const [payoutChannel, setPayoutChannel] = useState<string>("Safaricom M-Pesa (Direct STK & Payout)");
  const [mpesaNumber, setMpesaNumber] = useState<string>("");

  // Buyer specific
  const [businessName, setBusinessName] = useState<string>("");
  const [businessType, setBusinessType] = useState<string>(BUYER_TYPES[0]);
  const [monthlyDemandVolume, setMonthlyDemandVolume] = useState<string>("200 - 500 Bags");
  const [kraPin, setKraPin] = useState<string>("");

  // State
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Crop toggle helper
  const toggleCrop = (cropId: CropType) => {
    if (selectedCrops.includes(cropId)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter(c => c !== cropId));
      }
    } else {
      setSelectedCrops([...selectedCrops, cropId]);
    }
  };

  // Format phone helper
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (!mpesaNumber || mpesaNumber === phone) {
      setMpesaNumber(val);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!name.trim()) {
      setErrorMessage(
        preferredLocale === "en" ? "Please enter your full name or legal business name." : "Tafadhali weka jina lako kamili au la biashara."
      );
      return;
    }

    if (!phone.trim()) {
      setErrorMessage(
        preferredLocale === "en" ? "Please enter your Kenyan phone number (e.g. +254 7...)." : "Tafadhali weka nambari ya simu ya Kenya."
      );
      return;
    }

    if (pin.trim() && pin.length !== 4) {
      setErrorMessage(
        preferredLocale === "en" ? "PIN must be exactly 4 digits." : "PIN lazima iwe ya tarakimu 4."
      );
      return;
    }

    if (pin.trim() && pin !== confirmPin) {
      setErrorMessage(
        preferredLocale === "en" ? "PINs do not match. Please re-enter." : "PIN hazilingani. Tafadhali thibitisha tena."
      );
      return;
    }

    if (!agreedTerms) {
      setErrorMessage(
        preferredLocale === "en" ? "Please accept the Kilimo SafeTrade terms." : "Tafadhali kubali masharti ya Kilimo SafeTrade."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        role,
        location,
        locale: preferredLocale,
        pin: pin.trim() || "1234",
        email: email.trim() || undefined,
        farmName: role === "farmer" ? (farmName.trim() || `${name.trim()}'s Shamba`) : undefined,
        farmSizeAcres: role === "farmer" ? farmSizeAcres : undefined,
        primaryCrops: role === "farmer" ? selectedCrops : undefined,
        cooperative: role === "farmer" ? cooperative.trim() : undefined,
        businessName: role === "buyer" ? (businessName.trim() || `${name.trim()} Agribusiness`) : undefined,
        businessType: role === "buyer" ? businessType : undefined,
        kraPin: role === "buyer" ? kraPin.trim() : undefined,
        monthlyDemandVolume: role === "buyer" ? monthlyDemandVolume : undefined,
        payoutChannel,
        mpesaNumber: mpesaNumber.trim() || phone.trim()
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.user) {
        onAccountCreated(data.user);
        if (onClose) onClose();
      } else {
        setErrorMessage(data.error || "Failed to create account. Please check your details.");
      }
    } catch (err: any) {
      console.error("Account creation network error", err);
      setErrorMessage("Network connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className={`bg-[#FDFCFB] rounded-[32px] border-2 border-natural-bone shadow-xl overflow-hidden flex flex-col ${isModal ? "max-h-[90vh] max-w-2xl w-full" : "w-full"}`}>
      {/* Header Banner */}
      <div className="bg-natural-olive text-white px-6 py-5 flex items-center justify-between border-b border-natural-bone/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-natural-sand flex items-center justify-center text-natural-olive shadow-sm">
            <Wheat className="w-5 h-5 text-natural-sage" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-display italic tracking-tight text-white">
                {preferredLocale === "en" ? "Create SafeTrade Account" : "Fungua Akaunti ya Kilimo SafeTrade"}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-natural-sand/20 text-natural-sand border border-natural-sand/30">
                Kenya 2026
              </span>
            </div>
            <p className="text-[11px] text-[#DDDCCB] font-medium">
              {preferredLocale === "en"
                ? "Join Kenya's verified cereal, grain & spice marketplace with automated M-Pesa escrow."
                : "Jiunge na soko la nafaka na viungo lenye mfumo thabiti wa amana salama ya M-Pesa."}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-natural-text text-xs">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* STEP 1: Role Selection */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-natural-olive uppercase tracking-wider block font-mono">
            {preferredLocale === "en" ? "1. Select Account Type / Chagua Aina ya Akaunti:" : "1. Chagua Aina ya Akaunti:"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Farmer Option */}
            <button
              type="button"
              onClick={() => setRole("farmer")}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer relative ${
                role === "farmer"
                  ? "border-natural-sage bg-natural-sand/60 shadow-xs ring-1 ring-natural-sage"
                  : "border-natural-bone bg-white hover:bg-natural-sand/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-xl bg-natural-sand flex items-center justify-center text-natural-olive">
                  <Wheat className="w-4 h-4 text-natural-sage" />
                </div>
                {role === "farmer" && (
                  <div className="w-5 h-5 rounded-full bg-natural-sage text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <h3 className="font-bold text-natural-olive text-xs sm:text-sm">
                  {preferredLocale === "en" ? "🌾 Kenyan Farmer / Grower" : "🌾 Mkulima / Mzalishaji"}
                </h3>
                <p className="text-[10px] text-natural-olive/75 mt-0.5 leading-tight">
                  {preferredLocale === "en"
                    ? "Post cereal & spice harvests, get live market price alerts, voice logging & escrow payout."
                    : "Sajili mavuno, pokea bei za soko, rekodi sauti ya mazao na upokee malipo salama."}
                </p>
              </div>
            </button>

            {/* Buyer Option */}
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer relative ${
                role === "buyer"
                  ? "border-natural-sage bg-natural-sand/60 shadow-xs ring-1 ring-natural-sage"
                  : "border-natural-bone bg-white hover:bg-natural-sand/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-xl bg-natural-sand flex items-center justify-center text-natural-olive">
                  <Building2 className="w-4 h-4 text-natural-sage" />
                </div>
                {role === "buyer" && (
                  <div className="w-5 h-5 rounded-full bg-natural-sage text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <h3 className="font-bold text-natural-olive text-xs sm:text-sm">
                  {preferredLocale === "en" ? "💼 Wholesale Buyer / Miller" : "💼 Mnunuzi wa Jumla / Kiwanda"}
                </h3>
                <p className="text-[10px] text-natural-olive/75 mt-0.5 leading-tight">
                  {preferredLocale === "en"
                    ? "Source verified farm harvest, deposit Daraja M-Pesa escrow & inspect cargo."
                    : "Nunua nafaka na viungo vya jumla, weka amana ya M-Pesa na kagua mizigo."}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* STEP 2: Basic Contact & Security Credentials */}
        <div className="space-y-3 pt-1">
          <label className="text-[10px] font-bold text-natural-olive uppercase tracking-wider block font-mono">
            {preferredLocale === "en" ? "2. Identity & Contact Details:" : "2. Maelezo ya Mawasiliano:"}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                {role === "farmer" 
                  ? (preferredLocale === "en" ? "Full Name (Mkulima)" : "Jina Kamili")
                  : (preferredLocale === "en" ? "Contact Person / Trader Name" : "Jina la Mwakilishi")}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-natural-sage absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder={role === "farmer" ? "e.g. Kiprop Chemjor" : "e.g. Simba Millers / Dante"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-natural-bone rounded-full pl-8 pr-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                  {preferredLocale === "en" ? "Kenyan Phone / M-Pesa Number" : "Nambari ya Simu (M-Pesa)"}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                  Safaricom
                </span>
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-natural-sage absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+254 712 345 678"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full bg-white border border-natural-bone rounded-full pl-8 pr-4 py-2 text-xs font-mono text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* County / Hub */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                {preferredLocale === "en" ? "County / Loading Hub" : "Kaunti / Eneo"}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-natural-sage absolute left-3 top-3" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-natural-bone rounded-full pl-8 pr-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage appearance-none cursor-pointer"
                >
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                {preferredLocale === "en" ? "Email Address (Optional)" : "Barua Pepe (Hiari)"}
              </label>
              <input
                type="email"
                placeholder="mkulima@kilimo.co.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
              />
            </div>
          </div>

          {/* 4-Digit Security PIN */}
          <div className="p-3 bg-natural-sand/40 border border-natural-bone rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-natural-olive uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-natural-sage" />
                {preferredLocale === "en" ? "4-Digit Kilimo & M-Pesa Security PIN" : "PIN ya Usalama ya Tarakimu 4"}
              </span>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[10px] text-natural-olive/70 hover:text-natural-olive font-bold flex items-center gap-1 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPin ? "Hide" : "Show"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={4}
                  placeholder="PIN (e.g. 1234)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs font-mono tracking-widest text-center text-natural-olive focus:outline-none focus:ring-1 focus:ring-natural-sage font-bold"
                />
              </div>
              <div>
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={4}
                  placeholder="Confirm PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs font-mono tracking-widest text-center text-natural-olive focus:outline-none focus:ring-1 focus:ring-natural-sage font-bold"
                />
              </div>
            </div>
            <p className="text-[9px] text-natural-olive/70 italic">
              {preferredLocale === "en"
                ? "Used to authorize M-Pesa STK push releases and secure your harvest listings."
                : "Inatumika kuidhinisha malipo ya M-Pesa STK na kulinda mazao yako sokoni."}
            </p>
          </div>
        </div>

        {/* STEP 3: Role-Specific Details */}
        {role === "farmer" ? (
          <div className="space-y-3 pt-1 border-t border-natural-bone/60">
            <label className="text-[10px] font-bold text-natural-olive uppercase tracking-wider block font-mono">
              {preferredLocale === "en" ? "3. Farm & Harvest Profile (Mavuno):" : "3. Wasifu wa Shamba na Mazao:"}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                  {preferredLocale === "en" ? "Farm / Shamba Name" : "Jina la Shamba"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chepkoilel Grain Estate"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                  {preferredLocale === "en" ? "Farm Size" : "Ukubwa wa Shamba"}
                </label>
                <select
                  value={farmSizeAcres}
                  onChange={(e) => setFarmSizeAcres(e.target.value)}
                  className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage cursor-pointer"
                >
                  <option value="1 - 5 Acres">1 - 5 Acres (Smallholder)</option>
                  <option value="5 - 20 Acres">5 - 20 Acres (Medium Grower)</option>
                  <option value="20 - 50 Acres">20 - 50 Acres (Commercial)</option>
                  <option value="50+ Acres">50+ Acres (Large Estate)</option>
                </select>
              </div>
            </div>

            {/* Primary Crops Multi-Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-natural-olive/80 uppercase block">
                {preferredLocale === "en" ? "Primary Crops Grown (Click to select):" : "Mazao Makuu Unayolima:"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_CROPS.map((crop) => {
                  const isSelected = selectedCrops.includes(crop.id);
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => toggleCrop(crop.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                        isSelected
                          ? "bg-natural-olive text-white border-natural-olive shadow-2xs"
                          : "bg-white text-natural-olive hover:bg-natural-sand border-natural-bone"
                      }`}
                    >
                      <span>{crop.icon}</span>
                      <span>{crop.label}</span>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cooperative / Association */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                  {preferredLocale === "en" ? "Cooperative / Group (Optional)" : "Chama cha Ushirika (Hiari)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uasin Gishu Grain Growers Coop"
                  value={cooperative}
                  onChange={(e) => setCooperative(e.target.value)}
                  className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                  {preferredLocale === "en" ? "Escrow Payout Channel" : "Njia ya Malipo ya Escrow"}
                </label>
                <select
                  value={payoutChannel}
                  onChange={(e) => setPayoutChannel(e.target.value)}
                  className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage cursor-pointer"
                >
                  {PAYOUT_CHANNELS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1 border-t border-natural-bone/60">
            <label className="text-[10px] font-bold text-natural-olive uppercase tracking-wider block font-mono">
              {preferredLocale === "en" ? "3. Agribusiness & Purchasing Profile:" : "3. Wasifu wa Biashara na Ununuzi:"}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                  {preferredLocale === "en" ? "Company / Trading Name" : "Jina la Kampuni / Biashara"}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Simba Millers & Feed Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                  {preferredLocale === "en" ? "Business Sector / Type" : "Aina ya Biashara"}
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage cursor-pointer"
                >
                  {BUYER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                  {preferredLocale === "en" ? "Est. Monthly Demand Volume" : "Kiasi cha Ununuzi kwa Mwezi"}
                </label>
                <select
                  value={monthlyDemandVolume}
                  onChange={(e) => setMonthlyDemandVolume(e.target.value)}
                  className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage cursor-pointer"
                >
                  <option value="50 - 200 Bags">50 - 200 Bags / Month</option>
                  <option value="200 - 500 Bags">200 - 500 Bags / Month</option>
                  <option value="500 - 2,000 Bags">500 - 2,000 Bags / Month (Commercial)</option>
                  <option value="2,000+ Bags">2,000+ Bags / Month (Industrial Millers)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                  {preferredLocale === "en" ? "KRA PIN (Optional for Invoicing)" : "KRA PIN (Hiari kwa Ankara)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. P051289410A"
                  value={kraPin}
                  onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs font-mono text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Language & Terms Agreement */}
        <div className="space-y-3 pt-1 border-t border-natural-bone/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-natural-olive uppercase tracking-wider font-mono">
              {preferredLocale === "en" ? "Preferred Language / Lugha:" : "Lugha Unayopendelea:"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreferredLocale("en")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  preferredLocale === "en"
                    ? "bg-natural-olive text-white"
                    : "bg-natural-sand text-natural-olive hover:bg-natural-bone"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPreferredLocale("sw")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  preferredLocale === "sw"
                    ? "bg-natural-olive text-white"
                    : "bg-natural-sand text-natural-olive hover:bg-natural-bone"
                }`}
              >
                Kiswahili
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer bg-natural-sand/30 p-3 rounded-2xl border border-natural-bone">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded text-natural-sage focus:ring-natural-sage cursor-pointer"
            />
            <span className="text-[11px] text-natural-olive/80 leading-relaxed">
              {preferredLocale === "en" ? (
                <>
                  I agree to the <b>Kilimo SafeTrade</b> terms of service and Safaricom Daraja M-Pesa automated Escrow dispute resolution conditions.
                </>
              ) : (
                <>
                  Ninakubali masharti ya huduma ya <b>Kilimo SafeTrade</b> na amana salama ya M-Pesa kuondoa ubadhirifu sokoni.
                </>
              )}
            </span>
          </label>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-natural-olive hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-full text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-natural-sage" />
                {preferredLocale === "en" ? "Registering & Verifying Account..." : "Inasajili na Kuthibitisha Akaunti..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-natural-sage" />
                {preferredLocale === "en"
                  ? `Create Verified ${role === "farmer" ? "Farmer" : "Buyer"} Account`
                  : `Fungua Akaunti ya ${role === "farmer" ? "Mkulima" : "Mnunuzi"}`}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl flex justify-center"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return content;
};
