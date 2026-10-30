/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wheat,
  Building2,
  ShieldCheck,
  CheckCircle2,
  X,
  Phone,
  User as UserIcon,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Coins,
  History,
  FileSpreadsheet,
  LogOut,
  UserPlus,
  Pencil,
  Check,
  Sparkles
} from "lucide-react";
import { User, CropType } from "../types";

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updated: User) => void;
  onLogout: () => void;
  onOpenCreateNewAccount: () => void;
  locale: "en" | "sw";
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onUpdate,
  onLogout,
  onOpenCreateNewAccount,
  locale
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(user.name);
  const [phone, setPhone] = useState<string>(user.phone);
  const [location, setLocation] = useState<string>(user.location);
  const [farmName, setFarmName] = useState<string>(user.farmName || "");
  const [businessName, setBusinessName] = useState<string>(user.businessName || "");
  const [cooperative, setCooperative] = useState<string>(user.cooperative || "");
  const [payoutChannel, setPayoutChannel] = useState<string>(user.payoutChannel || "Safaricom M-Pesa");
  const [pin, setPin] = useState<string>(user.pin || "1234");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates = {
        name,
        phone,
        location,
        farmName: user.role === "farmer" ? farmName : undefined,
        businessName: user.role === "buyer" ? businessName : undefined,
        cooperative: user.role === "farmer" ? cooperative : undefined,
        payoutChannel,
        pin
      };

      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate(data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Save profile error", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-[#FDFCFB] rounded-[32px] border-2 border-natural-bone shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-natural-olive text-white px-6 py-5 flex items-center justify-between border-b border-natural-bone/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-natural-sand flex items-center justify-center text-natural-olive font-bold text-lg shadow-sm">
              {user.role === "farmer" ? (
                <Wheat className="w-6 h-6 text-natural-sage" />
              ) : (
                <Building2 className="w-6 h-6 text-natural-sage" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-display italic tracking-tight text-white">
                  {user.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-natural-sage text-white flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {locale === "en" ? "Verified" : "Imethibitishwa"}
                </span>
              </div>
              <p className="text-xs text-natural-sand font-mono mt-0.5">
                {user.role === "farmer"
                  ? (locale === "en" ? "🌾 Licensed Kenyan Farmer" : "🌾 Mkulima Aliyeidhinishwa")
                  : (locale === "en" ? "💼 Commercial Grain Buyer" : "💼 Mnunuzi wa Jumla wa Nafaka")} • {user.phone}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-natural-text">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                    {locale === "en" ? "Name" : "Jina"}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                    {locale === "en" ? "Phone" : "Simu"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs font-mono text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                    {locale === "en" ? "County / Location" : "Kaunti"}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  />
                </div>

                {user.role === "farmer" ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                      {locale === "en" ? "Farm Name" : "Jina la Shamba"}
                    </label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                      {locale === "en" ? "Company Name" : "Jina la Kampuni"}
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                    {locale === "en" ? "Security PIN (4 digits)" : "PIN (tarakimu 4)"}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs font-mono tracking-widest text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-natural-olive/80 uppercase">
                    {locale === "en" ? "Payout Channel" : "Njia ya Malipo"}
                  </label>
                  <input
                    type="text"
                    value={payoutChannel}
                    onChange={(e) => setPayoutChannel(e.target.value)}
                    className="w-full bg-white border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-natural-olive text-white font-bold py-2.5 rounded-full text-xs uppercase cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : (locale === "en" ? "Save Changes" : "Hifadhi Mabadiliko")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-natural-sand text-natural-olive font-bold rounded-full text-xs hover:bg-natural-bone transition cursor-pointer"
                >
                  {locale === "en" ? "Cancel" : "Ghairi"}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Account Overview Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-natural-sand/50 rounded-2xl border border-natural-bone space-y-1">
                  <span className="text-[10px] font-bold text-natural-olive/70 uppercase tracking-wider block font-mono">
                    {locale === "en" ? "Primary County" : "Kaunti Kuu"}
                  </span>
                  <p className="font-bold text-natural-olive text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-natural-sage" />
                    {user.location}
                  </p>
                </div>

                <div className="p-3 bg-natural-sand/50 rounded-2xl border border-natural-bone space-y-1">
                  <span className="text-[10px] font-bold text-natural-olive/70 uppercase tracking-wider block font-mono">
                    {locale === "en" ? "M-Pesa Escrow Status" : "Hali ya Escrow"}
                  </span>
                  <p className="font-bold text-emerald-800 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {locale === "en" ? "Active • Daraja API" : "Inafanya Kazi"}
                  </p>
                </div>
              </div>

              {/* Specific Entity details */}
              <div className="p-4 bg-white rounded-2xl border border-natural-bone space-y-2.5 shadow-2xs">
                <h4 className="text-[10px] font-bold text-natural-olive uppercase tracking-widest font-mono">
                  {user.role === "farmer" 
                    ? (locale === "en" ? "Farm Details & Cereal Profile" : "Maelezo ya Shamba na Mazao")
                    : (locale === "en" ? "Agribusiness & Demand Profile" : "Maelezo ya Biashara ya Nafaka")}
                </h4>

                <div className="space-y-1.5 text-[11px]">
                  {user.role === "farmer" ? (
                    <>
                      <div className="flex justify-between py-1 border-b border-natural-bone/40">
                        <span className="text-natural-olive/70">{locale === "en" ? "Farm Name:" : "Jina la Shamba:"}</span>
                        <span className="font-semibold text-natural-olive">{user.farmName || `${user.name}'s Shamba`}</span>
                      </div>
                      {user.farmSizeAcres && (
                        <div className="flex justify-between py-1 border-b border-natural-bone/40">
                          <span className="text-natural-olive/70">{locale === "en" ? "Farm Size:" : "Ukubwa:"}</span>
                          <span className="font-semibold text-natural-olive">{user.farmSizeAcres}</span>
                        </div>
                      )}
                      {user.cooperative && (
                        <div className="flex justify-between py-1 border-b border-natural-bone/40">
                          <span className="text-natural-olive/70">{locale === "en" ? "Cooperative:" : "Chama:"}</span>
                          <span className="font-semibold text-natural-olive">{user.cooperative}</span>
                        </div>
                      )}
                      {user.primaryCrops && user.primaryCrops.length > 0 && (
                        <div className="flex justify-between py-1 border-b border-natural-bone/40">
                          <span className="text-natural-olive/70">{locale === "en" ? "Crops:" : "Mazao:"}</span>
                          <span className="font-semibold text-natural-olive uppercase">{user.primaryCrops.join(", ")}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between py-1 border-b border-natural-bone/40">
                        <span className="text-natural-olive/70">{locale === "en" ? "Trading Name:" : "Jina la Biashara:"}</span>
                        <span className="font-semibold text-natural-olive">{user.businessName || `${user.name} Grain Wholesalers`}</span>
                      </div>
                      {user.businessType && (
                        <div className="flex justify-between py-1 border-b border-natural-bone/40">
                          <span className="text-natural-olive/70">{locale === "en" ? "Business Sector:" : "Aina:"}</span>
                          <span className="font-semibold text-natural-olive">{user.businessType}</span>
                        </div>
                      )}
                      {user.monthlyDemandVolume && (
                        <div className="flex justify-between py-1 border-b border-natural-bone/40">
                          <span className="text-natural-olive/70">{locale === "en" ? "Monthly Demand:" : "Kiasi kwa Mwezi:"}</span>
                          <span className="font-semibold text-natural-olive">{user.monthlyDemandVolume}</span>
                        </div>
                      )}
                      {user.kraPin && (
                        <div className="flex justify-between py-1 border-b border-natural-bone/40">
                          <span className="text-natural-olive/70">{locale === "en" ? "KRA PIN:" : "KRA PIN:"}</span>
                          <span className="font-mono font-semibold text-natural-olive">{user.kraPin}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between py-1">
                    <span className="text-natural-olive/70">{locale === "en" ? "Payout Channel:" : "Njia ya Malipo:"}</span>
                    <span className="font-semibold text-natural-olive">{user.payoutChannel || "Safaricom M-Pesa"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2.5 px-4 rounded-full bg-natural-sand hover:bg-natural-bone text-natural-olive font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-natural-bone"
                >
                  <Pencil className="w-3.5 h-3.5 text-natural-sage" />
                  {locale === "en" ? "Edit Profile & Payout Details" : "Hariri Wasifu na Malipo"}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreateNewAccount();
                    }}
                    className="py-2.5 px-3 rounded-full bg-natural-olive/10 hover:bg-natural-olive/20 text-natural-olive font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-natural-olive/20"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-natural-sage" />
                    {locale === "en" ? "Create New Account" : "Fungua Akaunti Mpya"}
                  </button>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="py-2.5 px-3 rounded-full bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-red-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {locale === "en" ? "Sign Out" : "Toka"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
