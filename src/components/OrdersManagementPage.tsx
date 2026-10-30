/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  XCircle,
  ArrowRight,
  PhoneCall,
  User,
  MapPin,
  Calendar,
  FileText,
  Printer,
  ChevronDown,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Coins,
  ChevronRight,
  Eye,
  Hash,
  Info,
  Check,
  ArrowUpDown
} from "lucide-react";
import { Order, Listing, CropType, User as UserType } from "../types";
import { EscrowSafeTrackProgress } from "./EscrowSafeTrackProgress";

interface OrdersManagementPageProps {
  orders: Order[];
  currentUser: UserType | null;
  role: "farmer" | "buyer";
  locale: "en" | "sw";
  onUpdateOrderStatus: (orderId: string, status: string, metadata?: Partial<Order>) => Promise<void>;
  onCancelOrder: (orderId: string, reason: string, notes?: string) => Promise<void>;
  onInitiatePayment: (order: Order) => void;
  onSwitchRole: (newRole: "farmer" | "buyer") => void;
  onNavigateToMarketplace: () => void;
  triggerNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

const CROP_LABELS: Record<string, { en: string; sw: string; color: string }> = {
  maize: { en: "White Maize", sw: "Mahindi Nyeupe", color: "bg-amber-100 text-amber-800 border-amber-300" },
  sorghum: { en: "Red Sorghum", sw: "Mtama Mwekundu", color: "bg-orange-100 text-orange-800 border-orange-300" },
  millet: { en: "Finger Millet", sw: "Wimbi (Mtama)", color: "bg-stone-100 text-stone-800 border-stone-300" },
  chili: { en: "Birds Eye Chili", sw: "Pilipili Kali", color: "bg-red-100 text-red-800 border-red-300" },
  ginger: { en: "African Ginger", sw: "Tangawizi", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  beans: { en: "Rosecoco Beans", sw: "Maharagwe", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  wheat: { en: "Highland Wheat", sw: "Ngano ya Juu", color: "bg-lime-100 text-lime-800 border-lime-300" }
};

export const OrdersManagementPage: React.FC<OrdersManagementPageProps> = ({
  orders,
  currentUser,
  role,
  locale,
  onUpdateOrderStatus,
  onCancelOrder,
  onInitiatePayment,
  onSwitchRole,
  onNavigateToMarketplace,
  triggerNotification
}) => {
  // Navigation & Filter state
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "dispatched" | "completed" | "cancelled">("all");
  const [perspectiveFilter, setPerspectiveFilter] = useState<"all" | "farmer" | "buyer">(
    role === "farmer" ? "farmer" : "buyer"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cropFilter, setCropFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount_desc" | "amount_asc">("newest");

  // Selected Order for Waybill / Consignment Receipt Modal
  const [selectedWaybillOrder, setSelectedWaybillOrder] = useState<Order | null>(null);

  // Cancellation Modal State
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("Crop quality or moisture content dispute");
  const [cancelNotes, setCancelNotes] = useState<string>("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Dispatch Confirmation Modal State (Farmer)
  const [orderToDispatch, setOrderToDispatch] = useState<Order | null>(null);
  const [dispatchWaybill, setDispatchWaybill] = useState<string>("");
  const [dispatchLogisticsPartner, setDispatchLogisticsPartner] = useState<string>("NorthRift Freight Co.");
  const [dispatchDriverNotes, setDispatchDriverNotes] = useState<string>("Loaded on truck reg KCG 382M. Driver contact: +254 722 000 111");
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState<boolean>(false);

  // Delivery Inspection Confirmation Modal State (Buyer)
  const [orderToConfirmDelivery, setOrderToConfirmDelivery] = useState<Order | null>(null);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState<boolean>(false);

  // Pre-fill waybill on dispatch open
  const handleOpenDispatchModal = (order: Order) => {
    setOrderToDispatch(order);
    setDispatchWaybill(order.waybillNumber || `WB-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // Perform dispatch
  const handleConfirmDispatch = async () => {
    if (!orderToDispatch) return;
    setIsSubmittingDispatch(true);
    try {
      await onUpdateOrderStatus(orderToDispatch.id, "dispatched", {
        waybillNumber: dispatchWaybill || `WB-${Math.floor(100000 + Math.random() * 900000)}`,
        deliveryNotes: `Carrier: ${dispatchLogisticsPartner}. ${dispatchDriverNotes}`
      });
      triggerNotification(
        locale === "en"
          ? `✓ Order #${orderToDispatch.id.replace('ord-', '')} marked as Dispatched! Waybill: ${dispatchWaybill}`
          : `✓ Agizo #${orderToDispatch.id.replace('ord-', '')} limethibitishwa kusafirishwa! Nambari: ${dispatchWaybill}`,
        "success"
      );
      setOrderToDispatch(null);
    } catch (err) {
      triggerNotification(
        locale === "en" ? "Failed to dispatch order" : "Hitilafu kuthibitisha usafirishaji",
        "error"
      );
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  // Perform delivery confirmation & release escrow
  const handleConfirmDeliveryAndRelease = async () => {
    if (!orderToConfirmDelivery) return;
    setIsSubmittingDelivery(true);
    try {
      await onUpdateOrderStatus(orderToConfirmDelivery.id, "completed", {
        escrowStatus: "Disbursed"
      });
      triggerNotification(
        locale === "en"
          ? `✓ Delivery confirmed! Escrow funds of KES ${orderToConfirmDelivery.totalAmount.toLocaleString()} released to ${orderToConfirmDelivery.farmerName}.`
          : `✓ Mzigo umepokelewa! Pesa za KES ${orderToConfirmDelivery.totalAmount.toLocaleString()} zimelipwa kwa mkulima ${orderToConfirmDelivery.farmerName}.`,
        "success"
      );
      setOrderToConfirmDelivery(null);
    } catch (err) {
      triggerNotification(
        locale === "en" ? "Failed to confirm delivery" : "Hitilafu kuthibitisha kupokea mzigo",
        "error"
      );
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  // Perform cancellation
  const handleConfirmCancellation = async () => {
    if (!orderToCancel) return;
    setIsSubmittingCancel(true);
    try {
      await onCancelOrder(orderToCancel.id, cancelReason, cancelNotes);
      triggerNotification(
        locale === "en"
          ? `✓ Order #${orderToCancel.id.replace('ord-', '')} cancelled. Escrow status updated to Refunded.`
          : `✓ Agizo #${orderToCancel.id.replace('ord-', '')} limeghairiwa. Amana ya Escrow inarejeshwa.`,
        "info"
      );
      setOrderToCancel(null);
      setCancelNotes("");
    } catch (err) {
      triggerNotification(
        locale === "en" ? "Cancellation failed" : "Hitilafu kughairi agizo",
        "error"
      );
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Perspective filter: farmer sales, buyer purchases, or all
        if (perspectiveFilter === "farmer") {
          // If current user is known, match farmerId or name, otherwise show orders where role makes sense
          if (currentUser?.id && o.farmerId === currentUser.id) return true;
          if (currentUser?.name && o.farmerName.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
          // Demo fallback: include if role is farmer or user wants to see farm sales
          return role === "farmer" || o.farmerId.includes("farm-");
        } else if (perspectiveFilter === "buyer") {
          if (currentUser?.id && o.buyerId === currentUser.id) return true;
          if (currentUser?.name && o.buyerName.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
          return role === "buyer" || o.buyerId.includes("user-");
        }
        return true;
      })
      .filter((o) => {
        // Tab status filter
        if (activeTab === "all") return true;
        if (activeTab === "pending") return o.status === "pending";
        if (activeTab === "dispatched") return o.status === "dispatched";
        if (activeTab === "completed") return o.status === "completed";
        if (activeTab === "cancelled") return o.status === "cancelled";
        return true;
      })
      .filter((o) => {
        // Crop filter
        if (cropFilter !== "all" && o.crop !== cropFilter) return false;
        return true;
      })
      .filter((o) => {
        // Search query filter
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          o.id.toLowerCase().includes(q) ||
          o.crop.toLowerCase().includes(q) ||
          o.farmerName.toLowerCase().includes(q) ||
          o.buyerName.toLowerCase().includes(q) ||
          o.buyerPhone.toLowerCase().includes(q) ||
          (o.waybillNumber && o.waybillNumber.toLowerCase().includes(q)) ||
          (o.location && o.location.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "amount_desc") {
          return b.totalAmount - a.totalAmount;
        }
        if (sortBy === "amount_asc") {
          return a.totalAmount - b.totalAmount;
        }
        return 0;
      });
  }, [orders, perspectiveFilter, activeTab, cropFilter, searchQuery, sortBy, currentUser, role]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const dispatched = orders.filter((o) => o.status === "dispatched").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const totalVolumeKES = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { total, pending, dispatched, completed, cancelled, totalVolumeKES };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Page Header and Quick Navigation */}
      <div className="bg-[#FDFCFB] rounded-[32px] p-6 shadow-sm border border-natural-bone">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-natural-bone pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-natural-olive text-white rounded-full">
                <Package className="w-5 h-5 text-natural-sage" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-natural-olive font-display tracking-tight">
                {locale === "en" ? "Orders Management Hub" : "Kituo cha Kusimamia Maagizo"}
              </h2>
              <span className="bg-natural-sand text-natural-olive border border-natural-bone px-3 py-0.5 rounded-full text-xs font-mono font-bold">
                {orders.length} {locale === "en" ? "Total Records" : "Rekodi Zote"}
              </span>
            </div>
            <p className="text-xs text-natural-olive/75 max-w-2xl leading-relaxed">
              {locale === "en"
                ? "Unified single-page order control for farmers and wholesale buyers. Review consignment details, confirm dispatches, release M-Pesa escrow upon delivery, or request cancellations."
                : "Ukurasa mmoja rahisi wa kusimamia maagizo ya wakulima na wanunuzi. Kagua mizigo, thibitisha usafirishaji, toa malipo ya Escrow ukishapokea mazao, au ghairi agizo iwapo pana tatizo."}
            </p>
          </div>

          {/* Quick Perspective & Role Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-natural-sand/70 p-1 rounded-full border border-natural-bone flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setPerspectiveFilter("all")}
                className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer ${
                  perspectiveFilter === "all"
                    ? "bg-natural-olive text-white shadow-xs"
                    : "text-natural-olive hover:bg-natural-bone/60"
                }`}
              >
                {locale === "en" ? "All Orders" : "Maagizo Yote"}
              </button>
              <button
                type="button"
                onClick={() => setPerspectiveFilter("farmer")}
                className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer flex items-center gap-1 ${
                  perspectiveFilter === "farmer"
                    ? "bg-natural-olive text-white shadow-xs"
                    : "text-natural-olive hover:bg-natural-bone/60"
                }`}
              >
                <span>🌾</span>
                <span>{locale === "en" ? "Farmer Sales" : "Mauzo ya Mkulima"}</span>
              </button>
              <button
                type="button"
                onClick={() => setPerspectiveFilter("buyer")}
                className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer flex items-center gap-1 ${
                  perspectiveFilter === "buyer"
                    ? "bg-natural-olive text-white shadow-xs"
                    : "text-natural-olive hover:bg-natural-bone/60"
                }`}
              >
                <span>💼</span>
                <span>{locale === "en" ? "Buyer Purchases" : "Manunuzi ya Mnunuzi"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onNavigateToMarketplace}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-natural-sand text-natural-olive border border-natural-bone hover:bg-natural-bone transition cursor-pointer flex items-center gap-1"
            >
              <span>{locale === "en" ? "← Back to Soko" : "← Rudi Sokoni"}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5">
          <div
            onClick={() => setActiveTab("all")}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              activeTab === "all"
                ? "bg-natural-olive text-white border-natural-olive shadow-xs"
                : "bg-natural-sand/40 border-natural-bone hover:bg-natural-sand/80 text-natural-olive"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              {locale === "en" ? "All Orders" : "Jumla"}
            </span>
            <span className="text-xl font-bold font-mono">{stats.total}</span>
          </div>

          <div
            onClick={() => setActiveTab("pending")}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              activeTab === "pending"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-900"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                {locale === "en" ? "Action Needed" : "Inahitaji Hatua"}
              </span>
              <Clock className="w-3.5 h-3.5 opacity-80" />
            </div>
            <span className="text-xl font-bold font-mono">{stats.pending}</span>
          </div>

          <div
            onClick={() => setActiveTab("dispatched")}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              activeTab === "dispatched"
                ? "bg-sky-700 text-white border-sky-700 shadow-xs"
                : "bg-sky-50 border-sky-200 hover:bg-sky-100 text-sky-900"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                {locale === "en" ? "In Transit" : "Safirini"}
              </span>
              <Truck className="w-3.5 h-3.5 opacity-80" />
            </div>
            <span className="text-xl font-bold font-mono">{stats.dispatched}</span>
          </div>

          <div
            onClick={() => setActiveTab("completed")}
            className={`p-3 rounded-2xl border transition cursor-pointer ${
              activeTab === "completed"
                ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-900"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                {locale === "en" ? "Completed" : "Kukamilika"}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 opacity-80" />
            </div>
            <span className="text-xl font-bold font-mono">{stats.completed}</span>
          </div>

          <div
            onClick={() => setActiveTab("cancelled")}
            className={`p-3 rounded-2xl border transition cursor-pointer col-span-2 sm:col-span-1 ${
              activeTab === "cancelled"
                ? "bg-[#8B4513] text-white border-[#8B4513] shadow-xs"
                : "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                {locale === "en" ? "Cancelled" : "Ghairi"}
              </span>
              <XCircle className="w-3.5 h-3.5 opacity-80" />
            </div>
            <span className="text-xl font-bold font-mono">{stats.cancelled}</span>
          </div>
        </div>
      </div>

      {/* Maneuver & Search Controls Bar */}
      <div className="bg-[#FDFCFB] rounded-[32px] p-4 shadow-sm border border-natural-bone flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: locale === "en" ? "All Orders" : "Yote", count: stats.total },
            { id: "pending", label: locale === "en" ? "Pending" : "Inasubiri", count: stats.pending },
            { id: "dispatched", label: locale === "en" ? "In Transit" : "Safirini", count: stats.dispatched },
            { id: "completed", label: locale === "en" ? "Completed" : "Kamilika", count: stats.completed },
            { id: "cancelled", label: locale === "en" ? "Cancelled" : "Imeghairiwa", count: stats.cancelled }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-natural-olive text-white shadow-xs"
                  : "bg-natural-sand text-natural-olive hover:bg-natural-bone"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-black/10 text-natural-olive"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-natural-olive/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "en" ? "Search ID, crop, person, phone..." : "Tafuta agizo, zao, jina..."}
              className="w-full bg-natural-sand border border-natural-bone rounded-full pl-8 pr-3 py-1.5 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-natural-olive/50 hover:text-natural-olive text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Crop Dropdown */}
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="bg-natural-sand border border-natural-bone rounded-full px-3 py-1.5 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
          >
            <option value="all">{locale === "en" ? "All Crops" : "Mazao Yote"}</option>
            <option value="maize">Maize (Mahindi)</option>
            <option value="sorghum">Sorghum (Mtama)</option>
            <option value="millet">Millet (Wimbi)</option>
            <option value="chili">Red Chili (Pilipili)</option>
            <option value="ginger">Ginger (Tangawizi)</option>
            <option value="beans">Beans (Maharagwe)</option>
            <option value="wheat">Wheat (Ngano)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-natural-sand border border-natural-bone rounded-full px-3 py-1.5 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
          >
            <option value="newest">{locale === "en" ? "Newest First" : "Mpya Zaidi"}</option>
            <option value="oldest">{locale === "en" ? "Oldest First" : "Ya Awali"}</option>
            <option value="amount_desc">{locale === "en" ? "Highest Amount" : "Kiasi Kikubwa"}</option>
            <option value="amount_asc">{locale === "en" ? "Lowest Amount" : "Kiasi Kidogo"}</option>
          </select>
        </div>
      </div>

      {/* Orders List Stream */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-[#FDFCFB] rounded-[32px] p-12 text-center border border-dashed border-natural-bone space-y-3">
            <div className="w-12 h-12 bg-natural-sand text-natural-olive/60 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-natural-olive font-display">
              {locale === "en" ? "No matching orders found" : "Hakuna maagizo yanayolingana"}
            </h3>
            <p className="text-xs text-natural-olive/70 max-w-md mx-auto">
              {locale === "en"
                ? "Try adjusting your search criteria, selecting a different filter tab, or checking your perspective setting."
                : "Jaribu kubadilisha vigezo vya utafutaji au ubadilishe kichungi cha mtazamo (Mkulima/Mnunuzi)."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCropFilter("all");
                setActiveTab("all");
                setPerspectiveFilter("all");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-natural-sand text-natural-olive border border-natural-bone hover:bg-natural-bone transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Reset All Filters" : "Rejesha Vichungi Vyote"}</span>
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const cropInfo = CROP_LABELS[order.crop] || {
              en: order.crop,
              sw: order.crop,
              color: "bg-natural-sand text-natural-olive border-natural-bone"
            };

            const isBuyerPerspective =
              perspectiveFilter === "buyer" ||
              (currentUser && order.buyerId === currentUser.id) ||
              role === "buyer";

            const isFarmerPerspective =
              perspectiveFilter === "farmer" ||
              (currentUser && order.farmerId === currentUser.id) ||
              role === "farmer";

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`bg-[#FDFCFB] rounded-[28px] border transition shadow-xs hover:shadow-md overflow-hidden ${
                  order.status === "cancelled"
                    ? "border-stone-300 opacity-90"
                    : order.status === "completed"
                    ? "border-emerald-300"
                    : order.status === "dispatched"
                    ? "border-sky-300"
                    : "border-natural-bone"
                }`}
              >
                {/* Order Top Ribbon */}
                <div className="bg-natural-sand/50 px-5 py-3 border-b border-natural-bone flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-natural-olive bg-white px-2.5 py-1 rounded-full border border-natural-bone shadow-2xs">
                      #{order.id.replace("ord-", "ORD-")}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cropInfo.color}`}>
                      {cropInfo[locale] || order.crop}
                    </span>

                    {order.waybillNumber && (
                      <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-natural-olive/75 bg-white/70 px-2 py-0.5 rounded-full border border-natural-bone">
                        <FileText className="w-3 h-3 text-natural-sage" />
                        {order.waybillNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-2xs ${
                        order.status === "completed"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : order.status === "dispatched"
                          ? "bg-sky-100 text-sky-800 border-sky-300"
                          : order.status === "cancelled"
                          ? "bg-stone-200 text-stone-800 border-stone-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {order.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {order.status === "dispatched" && <Truck className="w-3.5 h-3.5 text-sky-600" />}
                      {order.status === "pending" && <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
                      {order.status === "cancelled" && <XCircle className="w-3.5 h-3.5 text-stone-600" />}
                      <span>
                        {order.status === "completed"
                          ? locale === "en" ? "Completed / Delivered" : "Imekamilika"
                          : order.status === "dispatched"
                          ? locale === "en" ? "In Transit (Dispatched)" : "Safirini (Imesafirishwa)"
                          : order.status === "cancelled"
                          ? locale === "en" ? "Cancelled" : "Imeghairiwa"
                          : locale === "en" ? "Pending Confirmation" : "Inasubiri Hatua"}
                      </span>
                    </span>

                    {/* Escrow Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border ${
                        order.escrowStatus === "Disbursed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : order.escrowStatus === "Deposited"
                          ? "bg-natural-olive text-white border-natural-olive"
                          : order.escrowStatus === "Refunded"
                          ? "bg-stone-100 text-stone-700 border-stone-300 line-through"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3 text-natural-sage" />
                      <span>
                        {order.escrowStatus === "Deposited"
                          ? locale === "en" ? "Escrow Locked" : "Amana Imelindwa"
                          : order.escrowStatus === "Disbursed"
                          ? locale === "en" ? "Escrow Disbursed" : "Amana Imelipwa"
                          : order.escrowStatus === "Refunded"
                          ? locale === "en" ? "Escrow Refunded" : "Amana Imerejeshwa"
                          : locale === "en" ? "Escrow Pending" : "Amana Inasubiri"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Main Order Content Grid */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left Column: Crop specs & Counterparties (7 cols) */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-extrabold text-natural-olive font-display">
                          {order.quantity} {order.unit} • {cropInfo[locale] || order.crop}
                        </h4>
                        <p className="text-xs text-natural-olive/75 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-natural-sage" />
                          <span>
                            {locale === "en" ? "Ordered on:" : "Iliagizwa mnamo:"}{" "}
                            {new Date(order.createdAt).toLocaleDateString(locale === "en" ? "en-KE" : "sw-KE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-natural-olive/60 block">
                          {locale === "en" ? "Total Valuation" : "Kiasi cha Malipo"}
                        </span>
                        <span className="text-base sm:text-lg font-bold font-mono text-natural-olive">
                          KES {order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Counterparty Cards: Farmer & Buyer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Farmer Details */}
                      <div className="p-3 bg-natural-sand/30 rounded-2xl border border-natural-bone space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-natural-olive/70 flex items-center gap-1">
                            🌾 {locale === "en" ? "Producer / Farmer" : "Mkulima"}
                          </span>
                          {order.location && (
                            <span className="text-[10px] font-semibold text-natural-sage flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" /> {order.location}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-natural-olive">{order.farmerName}</p>
                        <p className="text-[10px] font-mono text-natural-olive/70">Origin Dispatch Point</p>
                      </div>

                      {/* Buyer Details */}
                      <div className="p-3 bg-natural-sand/30 rounded-2xl border border-natural-bone space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-natural-olive/70 flex items-center gap-1">
                            💼 {locale === "en" ? "Consignee / Buyer" : "Mnunuzi"}
                          </span>
                          <span className="text-[10px] font-semibold text-natural-olive/60">Dest: Nairobi / Depot</span>
                        </div>
                        <p className="text-xs font-bold text-natural-olive">{order.buyerName}</p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-natural-olive/70">
                          <span>{order.buyerPhone}</span>
                          <a
                            href={`tel:${order.buyerPhone}`}
                            className="text-natural-sage hover:underline flex items-center gap-0.5"
                          >
                            <PhoneCall className="w-2.5 h-2.5" /> Call
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Delivery & Logistics Waybill Note */}
                    {order.deliveryNotes && (
                      <div className="p-3 bg-natural-sand/20 rounded-2xl border border-natural-bone text-xs text-natural-olive/85 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-natural-olive flex items-center gap-1">
                          <Truck className="w-3 h-3 text-natural-sage" />
                          {locale === "en" ? "Freight & Waybill Memo" : "Maelezo ya Usafirishaji"}
                        </span>
                        <p className="leading-relaxed font-sans text-[11px] whitespace-pre-line">{order.deliveryNotes}</p>
                      </div>
                    )}

                    {/* Cancellation Reason note if cancelled */}
                    {order.status === "cancelled" && order.cancellationReason && (
                      <div className="p-3 bg-stone-100 rounded-2xl border border-stone-300 text-xs text-stone-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-stone-600" />
                          {locale === "en" ? "Cancellation Recorded" : "Kughairi Kumerekodiwa"} (
                          {order.cancelledBy === "farmer" ? "By Farmer" : "By Buyer"})
                        </span>
                        <p className="text-[11px] font-medium leading-relaxed">{order.cancellationReason}</p>
                        {order.cancelledAt && (
                          <p className="text-[10px] text-stone-500 font-mono">
                            {new Date(order.cancelledAt).toLocaleString(locale === "en" ? "en-KE" : "sw-KE")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Interactive Escrow Progress & Confirm / Cancel Actions (5 cols) */}
                  <div className="md:col-span-5 bg-natural-sand/20 rounded-2xl p-4 border border-natural-bone flex flex-col justify-between space-y-4">
                    {/* Visual Progress Bar */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-natural-olive/70 block mb-2">
                        {locale === "en" ? "Cargo Escrow Lifecycle" : "Mzunguko wa Amana na Mzigo"}
                      </span>
                      <EscrowSafeTrackProgress order={order} locale={locale} />
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-natural-bone">
                      {/* 1. Farmer Dispatch Action */}
                      {order.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleOpenDispatchModal(order)}
                          className="w-full bg-natural-olive hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-full text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs border border-natural-bone/20"
                        >
                          <Truck className="w-4 h-4 text-natural-sage" />
                          <span>{locale === "en" ? "Confirm & Mark Dispatched" : "Thibitisha Kusafirisha"}</span>
                        </button>
                      )}

                      {/* 2. Buyer Escrow Checkout Action (if unpaid) */}
                      {order.paymentStatus === "unpaid" && order.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => onInitiatePayment(order)}
                          className="w-full bg-natural-sage hover:bg-natural-sage/90 text-white font-bold py-2.5 px-4 rounded-full text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Coins className="w-4 h-4" />
                          <span>{locale === "en" ? "Deposit Escrow via M-Pesa" : "Weka Amana na M-Pesa"}</span>
                        </button>
                      )}

                      {/* 3. Buyer Confirm Delivery & Release Funds Action */}
                      {order.status === "dispatched" && (
                        <button
                          type="button"
                          onClick={() => setOrderToConfirmDelivery(order)}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-full text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>{locale === "en" ? "Confirm Delivery & Release Escrow" : "Thibitisha Mzigo & Toa Amana"}</span>
                        </button>
                      )}

                      {/* 4. Action Row: Waybill Slip & Cancel Order */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedWaybillOrder(order)}
                          className="flex-1 py-2 px-3 bg-natural-sand hover:bg-natural-bone text-natural-olive font-bold text-xs rounded-full border border-natural-bone transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-natural-sage" />
                          <span>{locale === "en" ? "Waybill Slip" : "Hati ya Mzigo"}</span>
                        </button>

                        {/* Cancellation button: visible if order is not completed and not already cancelled */}
                        {order.status !== "completed" && order.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => {
                              setOrderToCancel(order);
                              setCancelReason("Crop quality or moisture content dispute");
                              setCancelNotes("");
                            }}
                            className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-[#8B4513] font-bold text-xs rounded-full border border-stone-300 transition cursor-pointer flex items-center justify-center gap-1"
                            title="Cancel Order with Escrow Refund"
                          >
                            <XCircle className="w-3.5 h-3.5 text-[#8B4513]" />
                            <span>{locale === "en" ? "Cancel" : "Ghairi"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* DISPATCH CARGO MODAL (FARMER CONFIRMATION) */}
      <AnimatePresence>
        {orderToDispatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              className="bg-[#FDFCFB] rounded-[32px] max-w-lg w-full p-6 shadow-2xl border-2 border-natural-olive space-y-4 text-natural-text"
            >
              <div className="flex justify-between items-center border-b border-natural-bone pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-natural-olive text-white rounded-full">
                    <Truck className="w-4 h-4 text-natural-sage" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-natural-olive font-display">
                      {locale === "en" ? "Confirm Shipment Dispatch" : "Thibitisha Usafirishaji wa Mzigo"}
                    </h3>
                    <p className="text-[11px] text-natural-olive/70">
                      Order #{orderToDispatch.id.replace("ord-", "ORD-")} • {orderToDispatch.quantity} {orderToDispatch.unit} {orderToDispatch.crop}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderToDispatch(null)}
                  className="text-natural-olive/60 hover:text-natural-olive font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-natural-olive mb-1">
                    {locale === "en" ? "Consignment Waybill Number" : "Nambari ya Hati ya Usafiri (Waybill)"}
                  </label>
                  <input
                    type="text"
                    value={dispatchWaybill}
                    onChange={(e) => setDispatchWaybill(e.target.value)}
                    placeholder="e.g. WB-582914"
                    className="w-full bg-natural-sand border border-natural-bone rounded-full px-4 py-2 text-xs font-mono font-bold text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-natural-olive mb-1">
                    {locale === "en" ? "Transport / Carrier Company" : "Kampuni ya Usafirishaji"}
                  </label>
                  <select
                    value={dispatchLogisticsPartner}
                    onChange={(e) => setDispatchLogisticsPartner(e.target.value)}
                    className="w-full bg-natural-sand border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  >
                    <option value="NorthRift Freight Logistics">NorthRift Freight Logistics</option>
                    <option value="Fargo Courier Express Ltd">Fargo Courier Express Ltd</option>
                    <option value="Kenya Posta Cargo Direct">Kenya Posta Cargo Direct</option>
                    <option value="Direct Farm Lorry Dispatch (Self-Arranged)">Direct Farm Lorry Dispatch (Self-Arranged)</option>
                    <option value="Boda / Pick-Up Rapid Cargo">Boda / Pick-Up Rapid Cargo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-natural-olive mb-1">
                    {locale === "en" ? "Driver Vehicle Reg & Contact Memo" : "Maelezo ya Dereva na Nambari ya Gari"}
                  </label>
                  <textarea
                    rows={2}
                    value={dispatchDriverNotes}
                    onChange={(e) => setDispatchDriverNotes(e.target.value)}
                    placeholder="e.g. Lorry reg KCG 382M, Driver John (+254 722 000 111)"
                    className="w-full bg-natural-sand border border-natural-bone rounded-2xl p-3 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage resize-none"
                  />
                </div>

                <div className="bg-natural-sand/60 p-3 rounded-2xl border border-natural-bone text-[11px] text-natural-olive/80 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-natural-olive">
                    <ShieldCheck className="w-3.5 h-3.5 text-natural-sage" />
                    <span>SafeTrade Escrow Notice</span>
                  </div>
                  <p>
                    {locale === "en"
                      ? "Marking this order as dispatched notifies the buyer that cargo is en route. Escrow funds remain safely locked in trust and will disburse to your M-Pesa immediately upon buyer unloading confirmation."
                      : "Kusafirisha agizo kutamjulisha mnunuzi kuwa mzigo upo njiani. Pesa zitasalia salama kwenye amana ya Escrow na utatumiwa moja kwa moja mnunuzi akithibitisha kupokea."}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-natural-bone">
                <button
                  type="button"
                  onClick={() => setOrderToDispatch(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-natural-sand text-natural-olive hover:bg-natural-bone transition cursor-pointer"
                >
                  {locale === "en" ? "Cancel" : "Ghairi"}
                </button>
                <button
                  type="button"
                  disabled={isSubmittingDispatch}
                  onClick={handleConfirmDispatch}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-natural-olive text-white hover:opacity-90 transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingDispatch ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{locale === "en" ? "Saving..." : "Inahifadhi..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-natural-sage" />
                      <span>{locale === "en" ? "Confirm Dispatch" : "Thibitisha Safari"}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELIVERY & RELEASE ESCROW MODAL (BUYER) */}
      <AnimatePresence>
        {orderToConfirmDelivery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              className="bg-[#FDFCFB] rounded-[32px] max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-700 space-y-4 text-natural-text"
            >
              <div className="flex justify-between items-center border-b border-natural-bone pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-700 text-white rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-natural-olive font-display">
                      {locale === "en" ? "Confirm Cargo Receipt & Release Escrow" : "Thibitisha Mapokezi na Toa Amana"}
                    </h3>
                    <p className="text-[11px] text-natural-olive/70">
                      Order #{orderToConfirmDelivery.id.replace("ord-", "ORD-")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderToConfirmDelivery(null)}
                  className="text-natural-olive/60 hover:text-natural-olive font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex justify-between text-emerald-900 font-bold">
                    <span>{locale === "en" ? "Consignment Details:" : "Maelezo ya Mzigo:"}</span>
                    <span>
                      {orderToConfirmDelivery.quantity} {orderToConfirmDelivery.unit} {orderToConfirmDelivery.crop}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-800 text-[11px]">
                    <span>{locale === "en" ? "Farmer / Payee:" : "Mkulima / Mlipwaji:"}</span>
                    <span className="font-semibold">{orderToConfirmDelivery.farmerName}</span>
                  </div>
                  <div className="flex justify-between text-emerald-900 text-sm font-bold font-mono border-t border-emerald-200/60 pt-1.5">
                    <span>{locale === "en" ? "Escrow Payout to Farmer:" : "Kiasi cha Kutolewa:"}</span>
                    <span>KES {orderToConfirmDelivery.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-natural-olive/85 bg-natural-sand/40 p-3 rounded-2xl border border-natural-bone">
                  <p className="font-bold text-natural-olive flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-natural-sage" />
                    {locale === "en" ? "Buyer Inspection Acknowledgement:" : "Makubaliano ya Ukaguzi wa Mzigo:"}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-natural-olive/75 pl-1">
                    <li>
                      {locale === "en"
                        ? "I have inspected the sacks / quantity and confirmed moisture and quality standards."
                        : "Nimekagua magunia na kuthibitisha ubora na kiwango cha unyevu kinakubalika."}
                    </li>
                    <li>
                      {locale === "en"
                        ? "Releasing escrow authorizes instant disbursement to the farmer's verified Safaricom account."
                        : "Kutoa amana kunaidhinisha malipo ya papo hapo kwa akaunti ya M-Pesa ya mkulima."}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-natural-bone">
                <button
                  type="button"
                  onClick={() => setOrderToConfirmDelivery(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-natural-sand text-natural-olive hover:bg-natural-bone transition cursor-pointer"
                >
                  {locale === "en" ? "Inspect Later" : "Kagua Baadaye"}
                </button>
                <button
                  type="button"
                  disabled={isSubmittingDelivery}
                  onClick={handleConfirmDeliveryAndRelease}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingDelivery ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{locale === "en" ? "Releasing..." : "Inalipa..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{locale === "en" ? "Release Escrow Funds" : "Toa Fedha za Amana"}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANCELLATION MODAL */}
      <AnimatePresence>
        {orderToCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              className="bg-[#FDFCFB] rounded-[32px] max-w-lg w-full p-6 shadow-2xl border-2 border-[#8B4513] space-y-4 text-natural-text"
            >
              <div className="flex justify-between items-center border-b border-natural-bone pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#8B4513] text-white rounded-full">
                    <XCircle className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-natural-olive font-display">
                      {locale === "en" ? "Cancel Order & Process Refund" : "Ghairi Agizo na Rudisha Amana"}
                    </h3>
                    <p className="text-[11px] text-natural-olive/70">
                      Order #{orderToCancel.id.replace("ord-", "ORD-")} • KES {orderToCancel.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="text-natural-olive/60 hover:text-natural-olive font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-natural-olive mb-1">
                    {locale === "en" ? "Select Reason for Cancellation" : "Chagua Sababu ya Kughairi"}
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-natural-sand border border-natural-bone rounded-full px-4 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  >
                    <option value="Crop quality or moisture content dispute">
                      {locale === "en" ? "Crop quality or moisture content dispute" : "Ubora au unyevu wa mazao hautoshani"}
                    </option>
                    <option value="Transport / logistics carrier unavailable">
                      {locale === "en" ? "Transport / logistics carrier unavailable" : "Gari au usafirishaji haupatikani"}
                    </option>
                    <option value="Counterparty requested cancellation">
                      {locale === "en" ? "Counterparty requested cancellation" : "Mshirika aliomba kusitisha"}
                    </option>
                    <option value="Duplicate or accidental order">
                      {locale === "en" ? "Duplicate or accidental order" : "Agizo lililotumwa kwa makosa"}
                    </option>
                    <option value="Delayed dispatch beyond agreed delivery window">
                      {locale === "en" ? "Delayed dispatch beyond agreed window" : "Kuchelewa sana kusafirisha"}
                    </option>
                    <option value="Price or volume recalculation needed">
                      {locale === "en" ? "Price or volume recalculation needed" : "Marekebisho ya bei au idadi ya magunia"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-natural-olive mb-1">
                    {locale === "en" ? "Additional Clarification Notes (Optional)" : "Maelezo ya Ziada (Hiari)"}
                  </label>
                  <textarea
                    rows={2}
                    value={cancelNotes}
                    onChange={(e) => setCancelNotes(e.target.value)}
                    placeholder={locale === "en" ? "Provide any context for the mediation log..." : "Andika maelezo mafupi..."}
                    className="w-full bg-natural-sand border border-natural-bone rounded-2xl p-3 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage resize-none"
                  />
                </div>

                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>SafeTrade Escrow Protection Guarantee</span>
                  </div>
                  <p>
                    {locale === "en"
                      ? "If funds were deposited into M-Pesa Escrow, they will be marked as 'Refunded' and reversed back to the buyer's account. Crop quantities will be restored back to the farm inventory."
                      : "Ikiwa fedha zilishalipwa kwenye amana ya Escrow, zitarudishwa moja kwa moja kwa mnunuzi ('Refunded'). Magunia ya mazao yatarudishwa kwenye hifadhi ya mkulima."}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-natural-bone">
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-natural-sand text-natural-olive hover:bg-natural-bone transition cursor-pointer"
                >
                  {locale === "en" ? "Keep Order" : "Bakiza Agizo"}
                </button>
                <button
                  type="button"
                  disabled={isSubmittingCancel}
                  onClick={handleConfirmCancellation}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#8B4513] hover:opacity-90 text-white transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingCancel ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{locale === "en" ? "Cancelling..." : "Inaghairi..."}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{locale === "en" ? "Confirm Cancellation" : "Thibitisha Kughairi"}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONSIGNMENT WAYBILL & RECEIPT MODAL */}
      <AnimatePresence>
        {selectedWaybillOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              className="bg-[#FDFCFB] rounded-[32px] max-w-xl w-full p-6 shadow-2xl border-2 border-natural-olive space-y-4 text-natural-text"
            >
              <div className="flex justify-between items-center border-b border-natural-bone pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-natural-olive text-white rounded-full">
                    <FileText className="w-4 h-4 text-natural-sage" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-natural-olive font-display">
                      SafeTrade Consignment Waybill Note
                    </h3>
                    <p className="text-[11px] text-natural-olive/70 font-mono">
                      Ref: {selectedWaybillOrder.waybillNumber || `WB-${selectedWaybillOrder.id.replace("ord-", "")}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWaybillOrder(null)}
                  className="text-natural-olive/60 hover:text-natural-olive font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Printable Waybill Template */}
              <div className="p-5 bg-natural-sand/20 rounded-2xl border border-natural-bone space-y-4 text-xs font-sans">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-natural-bone pb-3">
                  <div>
                    <span className="font-extrabold text-sm text-natural-olive font-display tracking-tight">
                      KILIMO MARKETPLACE SAFETRADE
                    </span>
                    <p className="text-[10px] text-natural-olive/70">
                      National Agricultural Escrow Registry • Central Depot Eldoret / Nairobi
                    </p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-natural-olive/80">
                    <span className="block font-bold">STATUS: {selectedWaybillOrder.status.toUpperCase()}</span>
                    <span>ESCROW: {selectedWaybillOrder.escrowStatus.toUpperCase()}</span>
                  </div>
                </div>

                {/* Logistics Routing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-natural-olive/60 block">
                      Origin Shipper (Farmer)
                    </span>
                    <p className="font-bold text-natural-olive">{selectedWaybillOrder.farmerName}</p>
                    <p className="text-[11px] text-natural-olive/75">Origin: {selectedWaybillOrder.location || "Rift Valley Depot"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-natural-olive/60 block">
                      Consignee (Buyer)
                    </span>
                    <p className="font-bold text-natural-olive">{selectedWaybillOrder.buyerName}</p>
                    <p className="text-[11px] text-natural-olive/75">Phone: {selectedWaybillOrder.buyerPhone}</p>
                  </div>
                </div>

                {/* Cargo Details */}
                <div className="border-t border-natural-bone pt-3 space-y-2">
                  <div className="flex justify-between font-bold text-natural-olive">
                    <span>Commodity:</span>
                    <span className="uppercase">{selectedWaybillOrder.crop} ({selectedWaybillOrder.quantity} {selectedWaybillOrder.unit})</span>
                  </div>
                  <div className="flex justify-between text-natural-olive/80">
                    <span>Logistics Handling Fee:</span>
                    <span className="font-mono">KES 1,200</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-natural-olive border-t border-dashed border-natural-bone pt-2">
                    <span>Total Consignment Value:</span>
                    <span className="font-mono">KES {selectedWaybillOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Carrier & Waybill Notes */}
                {selectedWaybillOrder.deliveryNotes && (
                  <div className="bg-white/80 p-3 rounded-xl border border-natural-bone text-[11px] text-natural-olive/80">
                    <span className="font-bold block mb-0.5 text-natural-olive">Dispatch Memo:</span>
                    <p>{selectedWaybillOrder.deliveryNotes}</p>
                  </div>
                )}

                {/* Digital Verification Bar */}
                <div className="flex justify-between items-center text-[10px] text-natural-olive/60 border-t border-natural-bone pt-3 font-mono">
                  <span>M-Pesa Escrow Hash: 29183-MP-{selectedWaybillOrder.id}</span>
                  <span>Verified SafeTrade Seal ✓</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-natural-bone">
                <button
                  type="button"
                  onClick={() => setSelectedWaybillOrder(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-natural-sand text-natural-olive hover:bg-natural-bone transition cursor-pointer"
                >
                  {locale === "en" ? "Close" : "Funga"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerNotification(
                      locale === "en"
                        ? "Waybill note ready for offline printing & driver inspection."
                        : "Hati ya mzigo iko tayari kwa uchapishaji au ukaguzi wa dereva.",
                      "success"
                    );
                  }}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-natural-olive text-white hover:opacity-90 transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-natural-sage" />
                  <span>{locale === "en" ? "Print Waybill" : "Chapa Hati"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
