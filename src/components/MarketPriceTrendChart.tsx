/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Coins,
  Wheat,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { CropType, MarketPrice } from '../types';

export type TimeRange = '7d' | '30d' | '90d';

interface PricePoint {
  date: string;
  fullDate: string;
  marketPrice: number;
  ncpbBenchmark: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  region: string;
}

interface MarketPriceTrendChartProps {
  selectedCrop: CropType;
  onSelectCrop: (crop: CropType) => void;
  marketPrices?: MarketPrice[];
  locale?: 'en' | 'sw';
  onApplyPriceToListing?: (price: number, crop: CropType) => void;
  className?: string;
}

const CROP_CONFIG: Record<
  CropType,
  {
    nameEn: string;
    nameSw: string;
    unitEn: string;
    unitSw: string;
    basePrice: number;
    ncpbFloor: number;
    volatility: number;
    primaryHub: string;
  }
> = {
  maize: {
    nameEn: 'Maize (White Corn)',
    nameSw: 'Mahindi / Nafaka',
    unitEn: '90kg Bag',
    unitSw: 'Gunia 90kg',
    basePrice: 4250,
    ncpbFloor: 4000,
    volatility: 0.04,
    primaryHub: 'Eldoret / Kitale Depot'
  },
  sorghum: {
    nameEn: 'Sorghum (Seredo)',
    nameSw: 'Mtama',
    unitEn: '90kg Bag',
    unitSw: 'Gunia 90kg',
    basePrice: 3850,
    ncpbFloor: 3600,
    volatility: 0.035,
    primaryHub: 'Meru / Machakos Grain Ex.'
  },
  millet: {
    nameEn: 'Finger Millet (Wimbi)',
    nameSw: 'Wimbi',
    unitEn: '90kg Bag',
    unitSw: 'Gunia 90kg',
    basePrice: 5200,
    ncpbFloor: 4900,
    volatility: 0.045,
    primaryHub: 'Nakuru / Bomet Exchange'
  },
  chili: {
    nameEn: 'African Birdseye Chili',
    nameSw: 'Pilipili Kichaa',
    unitEn: 'kg',
    unitSw: 'kilo',
    basePrice: 290,
    ncpbFloor: 250,
    volatility: 0.06,
    primaryHub: 'Nairobi Export Terminal'
  },
  ginger: {
    nameEn: 'Fresh Ginger Root',
    nameSw: 'Tangawizi Safi',
    unitEn: 'kg',
    unitSw: 'kilo',
    basePrice: 210,
    ncpbFloor: 185,
    volatility: 0.05,
    primaryHub: 'Kakamega / Kisumu Market'
  },
  beans: {
    nameEn: 'Rosecoco / Yellow Beans',
    nameSw: 'Maharagwe ya Manjano',
    unitEn: '90kg Bag',
    unitSw: 'Gunia 90kg',
    basePrice: 8800,
    ncpbFloor: 8200,
    volatility: 0.04,
    primaryHub: 'Nakuru & Nyeri Hub'
  },
  wheat: {
    nameEn: 'Hard Red Milling Wheat',
    nameSw: 'Ngano ya Unga',
    unitEn: '90kg Bag',
    unitSw: 'Gunia 90kg',
    basePrice: 4850,
    ncpbFloor: 4500,
    volatility: 0.03,
    primaryHub: 'Narok / Eldoret Millers'
  }
};

// Deterministic seed-based pseudo random generator for consistent, realistic historical curves
function generateHistoricalSeries(crop: CropType, days: number): PricePoint[] {
  const cfg = CROP_CONFIG[crop];
  const points: PricePoint[] = [];
  const now = new Date();

  // Deterministic seed offsets per crop
  const cropSeedOffset = crop.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  // Trending drift factor (e.g. seasonal demand)
  const drift = (crop === 'maize' || crop === 'millet' || crop === 'chili') ? 0.003 : -0.001;

  let currentPrice = cfg.basePrice * (1 - drift * days * 0.7);

  for (let i = days; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Pseudo-sinusoidal cycle + seed noise
    const cycle = Math.sin((days - i + cropSeedOffset) * 0.45) * cfg.volatility;
    const microTrend = (days - i) * drift;
    const dailyDelta = (Math.cos((days - i + 7) * 0.8) * 0.5 + cycle + microTrend) * cfg.basePrice * 0.02;

    currentPrice = Math.max(cfg.ncpbFloor * 0.95, currentPrice + dailyDelta);

    // Rounding: round to nearest 10 for bags, nearest 1 for kg
    const roundedPrice = cfg.unitEn === 'kg' 
      ? Math.round(currentPrice) 
      : Math.round(currentPrice / 10) * 10;

    const high = cfg.unitEn === 'kg' 
      ? roundedPrice + Math.round(cfg.basePrice * 0.04)
      : roundedPrice + Math.round(cfg.basePrice * 0.03 / 10) * 10;
    
    const low = cfg.unitEn === 'kg'
      ? Math.max(cfg.ncpbFloor * 0.9, roundedPrice - Math.round(cfg.basePrice * 0.03))
      : Math.max(cfg.ncpbFloor, roundedPrice - Math.round(cfg.basePrice * 0.025 / 10) * 10);

    const volume = isWeekend
      ? Math.round((20 + (i % 7) * 5) * (cfg.unitEn === 'kg' ? 30 : 1))
      : Math.round((85 + ((days - i) % 11) * 12) * (cfg.unitEn === 'kg' ? 45 : 1));

    const dateLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const fullDateLabel = d.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });

    points.push({
      date: dateLabel,
      fullDate: fullDateLabel,
      marketPrice: roundedPrice,
      ncpbBenchmark: cfg.ncpbFloor,
      highPrice: high,
      lowPrice: low,
      volume,
      region: cfg.primaryHub
    });
  }

  // Ensure last point aligns closely with basePrice
  if (points.length > 0) {
    points[points.length - 1].marketPrice = cfg.basePrice;
  }

  return points;
}

export const MarketPriceTrendChart: React.FC<MarketPriceTrendChartProps> = ({
  selectedCrop,
  onSelectCrop,
  locale = 'en',
  onApplyPriceToListing,
  className = ''
}) => {
  const isSwahili = locale === 'sw';
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeBenchmark, setActiveBenchmark] = useState<'both' | 'market' | 'ncpb'>('both');

  const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

  // Generate data points based on selected crop and time range
  const chartData = useMemo(() => {
    return generateHistoricalSeries(selectedCrop, daysCount);
  }, [selectedCrop, daysCount]);

  const cfg = CROP_CONFIG[selectedCrop] || CROP_CONFIG.maize;

  // Compute summary metrics
  const {
    currentPrice,
    initialPrice,
    diffAmount,
    diffPercent,
    isBullish,
    isBearish,
    minPrice,
    maxPrice,
    avgPrice,
    ncpbSpread
  } = useMemo(() => {
    if (!chartData.length) {
      return {
        currentPrice: cfg.basePrice,
        initialPrice: cfg.basePrice,
        diffAmount: 0,
        diffPercent: 0,
        isBullish: false,
        isBearish: false,
        minPrice: cfg.basePrice,
        maxPrice: cfg.basePrice,
        avgPrice: cfg.basePrice,
        ncpbSpread: cfg.basePrice - cfg.ncpbFloor
      };
    }

    const first = chartData[0].marketPrice;
    const last = chartData[chartData.length - 1].marketPrice;
    const diff = last - first;
    const pct = first > 0 ? (diff / first) * 100 : 0;

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;

    chartData.forEach(p => {
      if (p.marketPrice < min) min = p.marketPrice;
      if (p.marketPrice > max) max = p.marketPrice;
      sum += p.marketPrice;
    });

    return {
      currentPrice: last,
      initialPrice: first,
      diffAmount: diff,
      diffPercent: pct,
      isBullish: pct >= 2.0,
      isBearish: pct <= -2.0,
      minPrice: min,
      maxPrice: max,
      avgPrice: Math.round(sum / chartData.length),
      ncpbSpread: last - cfg.ncpbFloor
    };
  }, [chartData, cfg]);

  // Farmer Listing Advice based on trends
  const listingAdvice = useMemo(() => {
    if (isBullish) {
      return {
        type: 'optimal',
        title: isSwahili ? 'Wakati Mwafaka wa Kuuza (Bei Inapanda)' : 'Optimal Window to List (Bullish Trend)',
        description: isSwahili
          ? `Bei imeongezeka kwa +${diffPercent.toFixed(1)}% katika siku ${daysCount}. Wanunuzi wa viwanda (Millers) wananunua kwa bei ya juu.`
          : `Market rates rose +${diffPercent.toFixed(1)}% over the last ${daysCount} days. Millers & wholesale buyers are competing actively.`,
        actionHint: isSwahili
          ? `Orodhesha mavuno yako sasa karibu KES ${currentPrice.toLocaleString()} kupata faida bora.`
          : `List your harvest near KES ${currentPrice.toLocaleString()} to lock in strong margins before new regional arrivals.`
      };
    }
    if (isBearish) {
      return {
        type: 'hold',
        title: isSwahili ? 'Ushauri: Hifadhi au Uza kwa Kiwango cha NCPB' : 'Advisory: Consider Storing or Floor Price',
        description: isSwahili
          ? `Bei imeshuka kwa ${diffPercent.toFixed(1)}% kwa sababu ya mavuno mengi. Ikiwezekana hifadhi au usikubali bei chini ya KES ${cfg.ncpbFloor.toLocaleString()}.`
          : `Rates contracted by ${Math.abs(diffPercent).toFixed(1)}% due to regional supply arrivals. Consider warehouse receipt or listing with reserve above NCPB floor.`,
        actionHint: isSwahili
          ? `Kiwango cha chini cha NCPB kinalinda KES ${cfg.ncpbFloor.toLocaleString()}. Epuka madalali wanaotoa bei duni.`
          : `NCPB benchmark floor secures KES ${cfg.ncpbFloor.toLocaleString()}. Avoid broker lowball offers.`
      };
    }
    return {
      type: 'stable',
      title: isSwahili ? 'Bei Imara Sokoni (Biashara ya Kawaida)' : 'Stable Market Range (Fair Demand)',
      description: isSwahili
        ? `Bei inaendelea kwa utulivu (mabadiliko ${diffPercent > 0 ? '+' : ''}${diffPercent.toFixed(1)}%). Mahitaji ni thabiti katika vituo vikuu.`
        : `Spot prices are trading within normal range (${diffPercent > 0 ? '+' : ''}${diffPercent.toFixed(1)}%). Steady industrial demand in Nairobi and Eldoret.`,
      actionHint: isSwahili
        ? `Weka bei yako karibu na KES ${avgPrice.toLocaleString()} ili upate mnunuzi wa haraka kupitia SafeTrade.`
        : `Target KES ${avgPrice.toLocaleString()} for swift escrow-backed buyer transactions.`
    };
  }, [isBullish, isBearish, diffPercent, daysCount, currentPrice, avgPrice, cfg.ncpbFloor, isSwahili]);

  // Custom Recharts Tooltip
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt: PricePoint = payload[0].payload;
    const spread = pt.marketPrice - pt.ncpbBenchmark;

    return (
      <div className="bg-[#2D3B2D] text-[#F5F2EB] p-3 rounded-2xl shadow-xl border border-[#607B64]/40 font-sans text-xs min-w-[200px] pointer-events-none">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#F5F2EB]/15 text-[10px] font-mono text-[#A3A375]">
          <span>{pt.fullDate}</span>
          <span className="font-bold">{timeRange.toUpperCase()}</span>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#F5F2EB]/80 flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#607B64] inline-block" />
              {isSwahili ? 'Bei ya Soko:' : 'Market Spot:'}
            </span>
            <span className="font-mono font-bold text-[#F5F2EB] text-xs">
              KES {pt.marketPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[#F5F2EB]/70 flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#8B4513] inline-block" />
              {isSwahili ? 'Kiwango cha NCPB:' : 'NCPB Floor:'}
            </span>
            <span className="font-mono text-[#F5F2EB]/90 text-xs">
              KES {pt.ncpbBenchmark.toLocaleString()}
            </span>
          </div>

          <div className="pt-1.5 mt-1 border-t border-[#F5F2EB]/10 flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#A3A375]">
              {isSwahili ? 'Tofauti na NCPB:' : 'Spread vs NCPB:'}
            </span>
            <span className={spread >= 0 ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
              {spread >= 0 ? `+KES ${spread.toLocaleString()}` : `-KES ${Math.abs(spread).toLocaleString()}`}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#F5F2EB]/60">
            <span>{isSwahili ? 'Kiasi cha Biashara:' : 'Traded Volume:'}</span>
            <span>
              {pt.volume.toLocaleString()} {cfg.unitEn === 'kg' ? 'kg' : (isSwahili ? 'magunia' : 'bags')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-[#FDFCFB] rounded-[32px] border border-natural-bone p-5 md:p-6 space-y-5 shadow-xs ${className}`}>
      {/* Header bar: Title, Crop pills, and Timeframe Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-natural-bone pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-natural-sand flex items-center justify-center text-natural-sage border border-natural-bone">
              <TrendingUp className="w-4 h-4 text-natural-sage" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-natural-olive font-display uppercase tracking-wider flex items-center gap-2 italic">
                {isSwahili ? 'Mwelekeo wa Bei za Soko' : 'Market Price Trend'}
                <span className="bg-natural-sand text-natural-olive border border-natural-bone px-2 py-0.5 rounded-full text-[9px] font-mono not-italic uppercase font-bold">
                  {cfg.primaryHub}
                </span>
              </h3>
              <p className="text-[11px] text-natural-olive/70 font-sans">
                {isSwahili
                  ? 'Historia halisi ya bei kusaidia kuamua wakati bora zaidi wa kuuza'
                  : 'Historical grain & spice price curves to help Kenyan farmers time listing sales'}
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe & Display toggles */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Time range switcher */}
          <div className="inline-flex bg-natural-sand p-1 rounded-full border border-natural-bone text-xs font-mono">
            {(['7d', '30d', '90d'] as TimeRange[]).map((tr) => (
              <button
                key={tr}
                type="button"
                onClick={() => setTimeRange(tr)}
                className={`px-3 py-1 rounded-full transition cursor-pointer font-bold text-[11px] ${
                  timeRange === tr
                    ? 'bg-natural-olive text-white shadow-2xs'
                    : 'text-natural-olive/70 hover:text-natural-olive'
                }`}
              >
                {tr === '7d' ? (isSwahili ? 'Siku 7' : '7 Days') : tr === '30d' ? (isSwahili ? 'Siku 30' : '30 Days') : (isSwahili ? 'Msimu (90D)' : 'Season (90D)')}
              </button>
            ))}
          </div>

          {/* Benchmark line filter toggle */}
          <div className="inline-flex bg-natural-sand p-1 rounded-full border border-natural-bone text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setActiveBenchmark(activeBenchmark === 'both' ? 'market' : 'both')}
              className={`px-2.5 py-1 rounded-full transition cursor-pointer flex items-center gap-1 ${
                activeBenchmark === 'both'
                  ? 'bg-natural-sage text-white font-bold'
                  : 'text-natural-olive/70 hover:text-natural-olive'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{isSwahili ? 'Kiwango cha NCPB' : 'NCPB Floor'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Crop selector tab strip */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-natural-olive/60 uppercase tracking-wider block">
          {isSwahili ? 'Chagua Zao Kutathmini Bei:' : 'Select Crop to Analyze Trends:'}
        </label>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(Object.keys(CROP_CONFIG) as CropType[]).map((crop) => {
            const cropCfg = CROP_CONFIG[crop];
            const isSelected = selectedCrop === crop;
            return (
              <button
                key={crop}
                type="button"
                onClick={() => onSelectCrop(crop)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-natural-olive text-white border-natural-olive shadow-xs font-bold'
                    : 'bg-natural-sand/70 text-natural-olive/80 border-natural-bone hover:bg-natural-bone'
                }`}
              >
                <Wheat className={`w-3.5 h-3.5 ${isSelected ? 'text-natural-sand' : 'text-natural-sage'}`} />
                <span>{isSwahili ? cropCfg.nameSw.split('/')[0] : cropCfg.nameEn.split('(')[0].trim()}</span>
                <span className={`text-[9px] font-mono ml-0.5 ${isSelected ? 'text-natural-sand/80' : 'text-natural-olive/50'}`}>
                  KES {cropCfg.basePrice.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Spot Price Card */}
        <div className="bg-natural-sand/40 border border-natural-bone rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-natural-olive/60 uppercase tracking-wider block">
            {isSwahili ? 'Bei ya Sasa (Spot)' : 'Current Spot Price'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-natural-olive font-display italic">
              KES {currentPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-natural-olive/60 font-sans">
              /{isSwahili ? cfg.unitSw : cfg.unitEn}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono">
            {diffAmount >= 0 ? (
              <span className="text-emerald-700 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +{diffPercent.toFixed(1)}%
              </span>
            ) : (
              <span className="text-natural-earth font-bold flex items-center">
                <ArrowDownRight className="w-3 h-3" /> {diffPercent.toFixed(1)}%
              </span>
            )}
            <span className="text-natural-olive/50">vs {timeRange} ago</span>
          </div>
        </div>

        {/* NCPB Floor Benchmark Card */}
        <div className="bg-natural-sand/40 border border-natural-bone rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-natural-olive/60 uppercase tracking-wider block">
              {isSwahili ? 'Kiwango cha NCPB' : 'NCPB Gov Floor'}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-natural-sage" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-natural-olive font-display italic">
              KES {cfg.ncpbFloor.toLocaleString()}
            </span>
            <span className="text-[10px] text-natural-olive/60 font-sans">
              /{isSwahili ? cfg.unitSw : cfg.unitEn}
            </span>
          </div>
          <div className="text-[10px] font-mono text-natural-olive/70">
            {ncpbSpread >= 0 ? (
              <span className="text-natural-sage font-bold">
                +KES {ncpbSpread.toLocaleString()} {isSwahili ? 'juu ya floor' : 'above floor'}
              </span>
            ) : (
              <span className="text-natural-earth font-bold">
                -KES {Math.abs(ncpbSpread).toLocaleString()} {isSwahili ? 'chini ya floor' : 'below floor'}
              </span>
            )}
          </div>
        </div>

        {/* Range High/Low Card */}
        <div className="bg-natural-sand/40 border border-natural-bone rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-natural-olive/60 uppercase tracking-wider block">
            {isSwahili ? `Kiwango cha ${timeRange.toUpperCase()}` : `${timeRange.toUpperCase()} High / Low`}
          </span>
          <div className="text-xs font-mono font-bold text-natural-olive pt-0.5">
            <span className="text-natural-sage">KES {maxPrice.toLocaleString()}</span>
            <span className="text-natural-olive/40 mx-1">/</span>
            <span className="text-natural-earth">KES {minPrice.toLocaleString()}</span>
          </div>
          <p className="text-[10px] font-mono text-natural-olive/60">
            {isSwahili ? 'Wastani:' : 'Period Avg:'} KES {avgPrice.toLocaleString()}
          </p>
        </div>

        {/* Quick Action: Apply to Posting Form */}
        <div className="bg-natural-sand/70 border border-natural-bone rounded-2xl p-3.5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-natural-olive/60 uppercase tracking-wider block">
              {isSwahili ? 'Uamuzi wa Bei' : 'Listing Decision'}
            </span>
            <p className="text-[10px] text-natural-olive/75 leading-tight mt-0.5">
              {isSwahili ? 'Tumia bei hii moja kwa moja kwenye fomu' : 'Feed this spot rate into your harvest listing'}
            </p>
          </div>
          {onApplyPriceToListing ? (
            <button
              type="button"
              onClick={() => onApplyPriceToListing(currentPrice, selectedCrop)}
              className="mt-2 w-full py-1.5 px-2 bg-natural-olive hover:opacity-90 text-white rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
            >
              <Coins className="w-3 h-3 text-natural-sand" />
              <span>{isSwahili ? `Tumia KES ${currentPrice.toLocaleString()}` : `Use KES ${currentPrice.toLocaleString()}`}</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono text-natural-sage font-bold mt-2">
              KES {currentPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Main Recharts Chart Area */}
      <div className="bg-natural-sand/20 rounded-2xl p-3 md:p-4 border border-natural-bone">
        <div className="flex items-center justify-between pb-3 text-xs">
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-natural-olive inline-block" />
              <span className="text-natural-olive font-bold">
                {isSwahili ? 'Bei ya Soko (KES)' : 'Spot Market Rate (KES)'}
              </span>
            </div>
            {activeBenchmark === 'both' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-natural-earth inline-block" />
                <span className="text-natural-earth font-bold">
                  {isSwahili ? 'Kiwango cha NCPB' : 'NCPB Benchmark'}
                </span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-mono text-natural-olive/60">
            {chartData.length} {isSwahili ? 'siku za data' : 'data points'}
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="marketPriceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#607B64" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#607B64" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#E6DFD5" strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#A3A375"
                tick={{ fill: '#2D3B2D', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={{ stroke: '#E6DFD5' }}
                interval={timeRange === '7d' ? 0 : timeRange === '30d' ? 4 : 10}
              />

              <YAxis
                domain={[
                  (dataMin: number) => Math.max(0, Math.floor(Math.min(dataMin, cfg.ncpbFloor) * 0.96 / 100) * 100),
                  (dataMax: number) => Math.ceil(dataMax * 1.04 / 100) * 100
                ]}
                stroke="#A3A375"
                tick={{ fill: '#2D3B2D', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={{ stroke: '#E6DFD5' }}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              />

              <Tooltip content={<CustomChartTooltip />} />

              {/* NCPB Reference / Floor Line */}
              {activeBenchmark === 'both' && (
                <Line
                  type="monotone"
                  dataKey="ncpbBenchmark"
                  stroke="#8B4513"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={false}
                  name="NCPB Floor"
                />
              )}

              {/* Market Spot Price Area with subtle gradient */}
              <Area
                type="monotone"
                dataKey="marketPrice"
                stroke="#2D3B2D"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#marketPriceGradient)"
                activeDot={{
                  r: 5,
                  fill: '#2D3B2D',
                  stroke: '#F5F2EB',
                  strokeWidth: 2
                }}
                name="Market Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data-Driven Listing Advice Banner */}
      <div
        className={`rounded-2xl p-4 border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs ${
          listingAdvice.type === 'optimal'
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : listingAdvice.type === 'hold'
            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
            : 'bg-natural-sand/60 border-natural-bone text-natural-olive'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              listingAdvice.type === 'optimal'
                ? 'bg-emerald-600 text-white'
                : listingAdvice.type === 'hold'
                ? 'bg-amber-600 text-white'
                : 'bg-natural-olive text-white'
            }`}
          >
            {listingAdvice.type === 'optimal' ? (
              <TrendingUp className="w-4 h-4" />
            ) : listingAdvice.type === 'hold' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold font-sans uppercase tracking-wider">
                {listingAdvice.title}
              </h4>
              <span className="text-[9px] font-mono px-2 py-0.2 rounded-full font-bold bg-white/70 border border-current/20">
                {isSwahili ? 'Ushauri wa Kilimo' : 'Smart Listing Advisor'}
              </span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed font-sans">
              {listingAdvice.description}
            </p>
            <p className="text-[11px] font-medium font-sans opacity-80 pt-0.5">
              💡 {listingAdvice.actionHint}
            </p>
          </div>
        </div>

        {onApplyPriceToListing && (
          <button
            type="button"
            onClick={() => onApplyPriceToListing(currentPrice, selectedCrop)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-xs self-stretch md:self-auto justify-center ${
              listingAdvice.type === 'optimal'
                ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                : listingAdvice.type === 'hold'
                ? 'bg-amber-800 hover:bg-amber-900 text-white'
                : 'bg-natural-olive hover:opacity-90 text-white'
            }`}
          >
            <span>{isSwahili ? 'Tumia Bei Hii Orodhani' : 'Set as Harvest Price'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
