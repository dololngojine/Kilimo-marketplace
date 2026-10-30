import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Pencil, 
  TrendingUp, 
  TrendingDown, 
  History, 
  CheckCircle2, 
  RefreshCw, 
  MapPin, 
  Tag, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Listing, CropGrade, MarketPrice, PriceHistoryEntry } from '../types';

interface EditListingModalProps {
  listing: Listing;
  marketPrices: MarketPrice[];
  locale?: 'en' | 'sw';
  isOnline: boolean;
  onClose: () => void;
  onSave: (updatedListing: Listing, isOffline: boolean) => Promise<void>;
  onDelete?: (listingId: string) => Promise<void>;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  listing,
  marketPrices,
  locale = 'en',
  isOnline,
  onClose,
  onSave,
  onDelete
}) => {
  const isSwahili = locale === 'sw';

  // Form states initialized to current listing values
  const [pricePerUnit, setPricePerUnit] = useState<string>(String(listing.pricePerUnit));
  const [quantity, setQuantity] = useState<string>(String(listing.quantity));
  const [grade, setGrade] = useState<CropGrade>(listing.grade);
  const [location, setLocation] = useState<string>(listing.location);
  const [status, setStatus] = useState<'available' | 'sold'>(listing.status);
  const [revisionNote, setRevisionNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [activeTab, setActiveTab] = useState<'edit' | 'history'>('edit');

  // Benchmark reference price from NCPB / regional markets
  const benchmark = useMemo(() => {
    return marketPrices.find(
      p => p.crop === listing.crop && p.grade === grade
    ) || marketPrices.find(p => p.crop === listing.crop);
  }, [marketPrices, listing.crop, grade]);

  // Numerical comparison of price change
  const currentPriceNum = Number(pricePerUnit) || listing.pricePerUnit;
  const priceDiff = currentPriceNum - listing.pricePerUnit;
  const priceDiffPercent = listing.pricePerUnit > 0 
    ? ((priceDiff / listing.pricePerUnit) * 100).toFixed(1) 
    : '0.0';

  // Benchmark difference
  const benchmarkDiff = benchmark ? currentPriceNum - benchmark.avgPrice : 0;
  const benchmarkDiffPercent = benchmark && benchmark.avgPrice > 0 
    ? ((benchmarkDiff / benchmark.avgPrice) * 100).toFixed(1) 
    : '0.0';

  const handlePriceShortcut = (delta: number) => {
    const next = Math.max(10, currentPriceNum + delta);
    setPricePerUnit(String(next));
  };

  const handleAlignWithBenchmark = () => {
    if (benchmark) {
      setPricePerUnit(String(benchmark.avgPrice));
      setRevisionNote(isSwahili ? 'Kulinganisha na bei ya soko ya sasa' : 'Aligned to live market benchmark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSyncState('syncing');

    const updatedPrice = Number(pricePerUnit) || listing.pricePerUnit;
    const oldPrice = listing.pricePerUnit;

    // Build updated history
    const existingHistory: PriceHistoryEntry[] = listing.priceHistory && listing.priceHistory.length > 0
      ? [...listing.priceHistory]
      : [{ price: oldPrice, changedAt: listing.createdAt, note: 'Initial harvest listing' }];

    if (updatedPrice !== oldPrice) {
      const diff = updatedPrice - oldPrice;
      const pct = ((diff / oldPrice) * 100).toFixed(1);
      const sign = diff > 0 ? '+' : '';
      existingHistory.push({
        price: updatedPrice,
        previousPrice: oldPrice,
        changedAt: new Date().toISOString(),
        note: revisionNote.trim() || `Price revision: ${sign}KES ${Math.abs(diff)} (${sign}${pct}%)`
      });
    }

    const updated: Listing = {
      ...listing,
      pricePerUnit: updatedPrice,
      quantity: Number(quantity) || listing.quantity,
      grade,
      location,
      status,
      priceHistory: existingHistory,
      lastSyncedAt: new Date().toISOString()
    };

    try {
      await onSave(updated, !isOnline);
      setSyncState('synced');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error('Failed to update listing', err);
      setIsSubmitting(false);
      setSyncState('idle');
    }
  };

  const priceHistoryList = listing.priceHistory || [
    { price: listing.pricePerUnit, changedAt: listing.createdAt, note: 'Initial harvest listing' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#FDFCFB] border border-natural-bone rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-natural-bone flex justify-between items-center bg-natural-sand/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-natural-sand border border-natural-bone flex items-center justify-center text-natural-olive shadow-2xs">
              <Pencil className="w-4 h-4 text-natural-sage" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-natural-olive capitalize font-display">
                  {isSwahili ? 'Hariri Mavuno' : 'Edit Harvest Listing'}
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-natural-sand border border-natural-bone text-natural-olive/80">
                  #{listing.id.replace('list-', '')}
                </span>
              </div>
              <p className="text-[11px] text-natural-olive/70">
                {listing.crop.toUpperCase()} • {listing.quantity} {listing.unit} • {listing.location}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-natural-bone hover:bg-natural-sand flex items-center justify-center text-natural-olive transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-natural-bone px-5 bg-[#FDFCFB]">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition cursor-pointer mr-6 ${
              activeTab === 'edit'
                ? 'border-natural-olive text-natural-olive'
                : 'border-transparent text-natural-olive/50 hover:text-natural-olive'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            {isSwahili ? 'Mabadiliko ya Bei & Kiasi' : 'Edit Details & Price'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-natural-olive text-natural-olive'
                : 'border-transparent text-natural-olive/50 hover:text-natural-olive'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            {isSwahili ? 'Historia ya Bei' : 'Price Tracking History'}
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-natural-sand text-natural-olive font-mono">
              {priceHistoryList.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'edit' ? (
            <form id="edit-listing-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Live Price Tracker & Market Benchmark Module */}
              <div className="bg-natural-sand/40 border border-natural-bone rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-natural-olive uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-natural-sage" />
                    {isSwahili ? 'Kifuatilia Bei (Price Tracker)' : 'Live Price Tracker'}
                  </span>
                  {benchmark && (
                    <span className="text-[10px] font-mono text-natural-olive/80 bg-[#FDFCFB] px-2 py-0.5 rounded-full border border-natural-bone">
                      NCPB Benchmark: <b className="text-natural-olive">KES {benchmark.avgPrice.toLocaleString()}</b>
                    </span>
                  )}
                </div>

                {/* Price input field with dynamic feedback */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-natural-olive/80">
                    <label className="font-semibold">
                      {isSwahili ? 'Bei Mpya (KES kwa ' : 'Target Asking Price (KES per '}{listing.unit === '90kg Bag' ? (isSwahili ? 'Gunia' : 'Bag') : 'kg'})
                    </label>
                    <span className="font-mono text-[11px]">
                      {isSwahili ? 'Bei ya sasa: ' : 'Current: '}
                      <span className="line-through text-natural-olive/60">KES {listing.pricePerUnit.toLocaleString()}</span>
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-natural-olive/60 font-bold font-mono text-xs">
                      KES
                    </div>
                    <input
                      type="number"
                      required
                      min={1}
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                      className="w-full bg-[#FDFCFB] border border-natural-bone rounded-xl pl-13 pr-24 py-2.5 text-sm font-mono font-bold text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[10px] font-mono text-natural-olive/60">
                      /{listing.unit === '90kg Bag' ? 'bag' : 'kg'}
                    </div>
                  </div>
                </div>

                {/* Quick Price Adjust Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-natural-olive/60 font-medium">
                    {isSwahili ? 'Badili haraka:' : 'Quick adjust:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePriceShortcut(-100)}
                    className="px-2 py-0.5 rounded-md bg-[#FDFCFB] border border-natural-bone text-[10px] font-mono font-bold text-natural-earth hover:bg-natural-sand transition cursor-pointer"
                  >
                    -100 KES
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceShortcut(-50)}
                    className="px-2 py-0.5 rounded-md bg-[#FDFCFB] border border-natural-bone text-[10px] font-mono font-bold text-natural-earth hover:bg-natural-sand transition cursor-pointer"
                  >
                    -50 KES
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceShortcut(50)}
                    className="px-2 py-0.5 rounded-md bg-[#FDFCFB] border border-natural-bone text-[10px] font-mono font-bold text-natural-olive hover:bg-natural-sand transition cursor-pointer"
                  >
                    +50 KES
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceShortcut(100)}
                    className="px-2 py-0.5 rounded-md bg-[#FDFCFB] border border-natural-bone text-[10px] font-mono font-bold text-natural-olive hover:bg-natural-sand transition cursor-pointer"
                  >
                    +100 KES
                  </button>
                  {benchmark && currentPriceNum !== benchmark.avgPrice && (
                    <button
                      type="button"
                      onClick={handleAlignWithBenchmark}
                      className="px-2.5 py-0.5 rounded-md bg-natural-sage/15 border border-natural-sage/30 text-[10px] font-bold text-natural-olive hover:bg-natural-sage/25 transition cursor-pointer ml-auto flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-natural-sage" />
                      {isSwahili ? 'Linganisha na Soko' : 'Match Market (KES ' + benchmark.avgPrice + ')'}
                    </button>
                  )}
                </div>

                {/* Live Delta Feedback Card */}
                {priceDiff !== 0 && (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    priceDiff > 0 
                      ? 'bg-natural-sage/10 border-natural-sage/30 text-natural-olive' 
                      : 'bg-natural-earth/10 border-natural-earth/30 text-natural-earth'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {priceDiff > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-natural-sage" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-natural-earth" />
                      )}
                      <span className="font-semibold">
                        {priceDiff > 0 ? (isSwahili ? 'Ongezeko la Bei:' : 'Price Increase:') : (isSwahili ? 'Punguzo la Bei:' : 'Price Reduction:')}
                      </span>
                      <span className="font-mono font-bold">
                        {priceDiff > 0 ? '+' : ''}KES {priceDiff.toLocaleString()} ({priceDiffPercent}%)
                      </span>
                    </div>

                    {benchmark && (
                      <span className="text-[10px] font-mono opacity-80">
                        {benchmarkDiff >= 0 ? `+${benchmarkDiffPercent}% vs market` : `${benchmarkDiffPercent}% vs market`}
                      </span>
                    )}
                  </div>
                )}

                {/* Optional Revision Reason Note */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[10px] font-bold text-natural-olive/70 uppercase tracking-wider">
                    {isSwahili ? 'Sababu ya Mabadiliko (Hiari)' : 'Reason for Price Update (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={isSwahili ? "Mfano: Kubadilika kwa soko Eldoret / Usafirishaji rahisi" : "e.g., Seasonal market surge, rapid stock clearance, or quality regrade"}
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    className="w-full bg-[#FDFCFB] border border-natural-bone rounded-xl px-3 py-1.5 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  />
                </div>
              </div>

              {/* Quantity and Quality Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-natural-olive uppercase tracking-wider">
                    {isSwahili ? 'Kiasi Kilichopo (' : 'Available Quantity ('}{listing.unit === '90kg Bag' ? (isSwahili ? 'Magunia' : 'Bags') : 'kg'})
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-natural-sand/40 border border-natural-bone rounded-xl px-3.5 py-2 text-xs font-mono text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-natural-olive uppercase tracking-wider">
                    {isSwahili ? 'Ubora wa Zao' : 'Quality Grade'}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['Grade 1', 'Grade 2', 'Grade 3'] as CropGrade[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        className={`py-1.5 text-[10px] font-bold rounded-xl transition border cursor-pointer ${
                          grade === g
                            ? 'bg-natural-sage text-white border-natural-sage shadow-2xs'
                            : 'bg-natural-sand/40 text-natural-olive border-natural-bone hover:bg-natural-bone/60'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* County Location and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-natural-olive uppercase tracking-wider">
                    {isSwahili ? 'Kaunti ya Zao' : 'Origin County'}
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-natural-sand/40 border border-natural-bone rounded-xl px-3 py-2 text-xs text-natural-text focus:outline-none focus:ring-1 focus:ring-natural-sage"
                  >
                    <option value="Eldoret">Eldoret (Uasin Gishu)</option>
                    <option value="Nyandarua">Nyandarua</option>
                    <option value="Meru">Meru</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Kakamega">Kakamega</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-natural-olive uppercase tracking-wider">
                    {isSwahili ? 'Hali ya Zao' : 'Market Status'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStatus('available')}
                      className={`py-2 text-[10px] font-bold rounded-xl transition border cursor-pointer flex items-center justify-center gap-1 ${
                        status === 'available'
                          ? 'bg-natural-sand text-natural-olive border-natural-sage/40 shadow-2xs'
                          : 'bg-natural-sand/20 text-natural-olive/50 border-natural-bone'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      {isSwahili ? 'Inapatikana' : 'Available'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('sold')}
                      className={`py-2 text-[10px] font-bold rounded-xl transition border cursor-pointer flex items-center justify-center gap-1 ${
                        status === 'sold'
                          ? 'bg-natural-bone text-natural-olive border-natural-bone shadow-2xs'
                          : 'bg-natural-sand/20 text-natural-olive/50 border-natural-bone'
                      }`}
                    >
                      {isSwahili ? 'Imeuzwa' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Tab: Price Tracking History */
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-natural-olive/80 pb-1 border-b border-natural-bone">
                <span className="font-semibold">
                  {isSwahili ? 'Historia Kamili ya Bei ya Zao Hili' : 'Recorded Price History & Revisions'}
                </span>
                <span className="font-mono text-[10px] text-natural-sage">
                  {priceHistoryList.length} {priceHistoryList.length === 1 ? 'record' : 'records'}
                </span>
              </div>

              <div className="space-y-2.5">
                {priceHistoryList.map((entry, idx) => {
                  const entryDate = new Date(entry.changedAt);
                  const isLatest = idx === priceHistoryList.length - 1;
                  const prev = idx > 0 ? priceHistoryList[idx - 1].price : undefined;
                  const diff = prev ? entry.price - prev : undefined;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition ${
                        isLatest
                          ? 'bg-natural-sand/50 border-natural-sage/40 shadow-2xs'
                          : 'bg-[#FDFCFB] border-natural-bone'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono text-natural-olive">
                            KES {entry.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-natural-olive/60">
                            /{listing.unit === '90kg Bag' ? 'bag' : 'kg'}
                          </span>

                          {diff !== undefined && diff !== 0 && (
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ${
                              diff > 0
                                ? 'bg-natural-sage/15 text-natural-olive'
                                : 'bg-natural-earth/15 text-natural-earth'
                            }`}>
                              {diff > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                              {diff > 0 ? '+' : ''}{diff.toLocaleString()}
                            </span>
                          )}

                          {isLatest && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-natural-sage text-white px-2 py-0.5 rounded-full">
                              {isSwahili ? 'Sasa' : 'Current'}
                            </span>
                          )}
                        </div>

                        <span className="font-mono text-[10px] text-natural-olive/60 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-natural-sage/70" />
                          {entryDate.toLocaleDateString(isSwahili ? 'sw-KE' : 'en-KE', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {entry.note && (
                        <p className="text-[11px] text-natural-olive/75 mt-1.5 font-sans italic">
                          "{entry.note}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {benchmark && (
                <div className="bg-natural-sand/30 p-3 rounded-2xl border border-natural-bone text-xs text-natural-olive/80 space-y-1 mt-3">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-natural-sage" />
                    <span>{isSwahili ? 'Ushauri wa Bei ya Kilimo' : 'Kilimo Smart Pricing Insight'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-natural-olive/70">
                    {isSwahili
                      ? `Bei ya wastani ya ${listing.crop.toUpperCase()} (${grade}) huko ${location} ni KES ${benchmark.avgPrice.toLocaleString()}. Kuweka bei kulingana na soko hukuwezesha kuuza haraka zaidi.`
                      : `The prevailing reference benchmark for ${listing.crop.toUpperCase()} (${grade}) in ${location} is KES ${benchmark.avgPrice.toLocaleString()} per unit. Competitive pricing aligns with verified buyer purchase orders.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Live Sync Feedback */}
        <div className="p-4 border-t border-natural-bone bg-natural-sand/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Sync Status Badge */}
          <div className="flex items-center gap-2 text-[11px] text-natural-olive/80 w-full sm:w-auto">
            {syncState === 'syncing' ? (
              <span className="flex items-center gap-1.5 text-natural-olive font-mono">
                <RefreshCw className="w-3.5 h-3.5 text-natural-sage animate-spin" />
                {isSwahili ? 'Inasawazisha na soko...' : 'Syncing listing & prices...'}
              </span>
            ) : syncState === 'synced' ? (
              <span className="flex items-center gap-1.5 text-natural-olive font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-natural-olive" />
                {isSwahili ? 'Imesasishwa kikamilifu' : 'Synced with National Registry'}
              </span>
            ) : isOnline ? (
              <span className="flex items-center gap-1.5 text-natural-olive/70 font-mono text-[10px]">
                <span className="w-2 h-2 rounded-full bg-natural-sage"></span>
                {isSwahili ? 'Mtandao Uko Hewani (Live Cloud Sync)' : 'Live Cloud Sync Ready'}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-natural-earth font-mono text-[10px]">
                <AlertCircle className="w-3 h-3 text-natural-earth" />
                {isSwahili ? 'Hali ya Nje ya Mtandao (Inahifadhiwa kwa Foleni)' : 'Offline (Queued for Auto-Sync)'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(isSwahili ? 'Je, una uhakika unataka kufuta zao hili?' : 'Are you sure you want to remove this harvest listing?')) {
                    onDelete(listing.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-full border border-natural-earth/30 text-natural-earth hover:bg-natural-earth/10 text-xs font-bold transition cursor-pointer"
              >
                {isSwahili ? 'Futa' : 'Delete'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-natural-bone text-natural-olive hover:bg-natural-sand text-xs font-bold transition cursor-pointer"
            >
              {isSwahili ? 'Ghairi' : 'Cancel'}
            </button>

            {activeTab === 'edit' && (
              <button
                type="submit"
                form="edit-listing-form"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-full bg-natural-olive text-white hover:opacity-90 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {isSwahili ? 'Inahifadhi...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {isSwahili ? 'Hifadhi & Sawazisha' : 'Save & Sync Listing'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
