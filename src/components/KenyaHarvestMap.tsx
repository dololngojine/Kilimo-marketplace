import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Wheat, 
  Layers, 
  Filter, 
  RotateCcw, 
  TrendingUp, 
  Info, 
  Sparkles, 
  Eye, 
  Check, 
  Compass, 
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Listing, CropType } from '../types';

interface CountyData {
  id: string;
  name: string;
  countyName: string;
  region: string;
  regionSw: string;
  agroZone: string;
  agroZoneSw: string;
  x: number; // in 800px viewBox
  y: number; // in 900px viewBox
  mainCrops: CropType[];
  description: string;
  descriptionSw: string;
}

export const KENYA_COUNTIES: CountyData[] = [
  {
    id: "eldoret",
    name: "Eldoret",
    countyName: "Uasin Gishu County",
    region: "North Rift Grain Belt",
    regionSw: "Bonde la Kaskazini la Nafaka",
    agroZone: "High Potential Grain Highlands",
    agroZoneSw: "Nyanda za Juu za Mazao",
    x: 145,
    y: 402,
    mainCrops: ["maize", "wheat", "millet"],
    description: "National grain breadbasket with expansive commercial cereal plantations.",
    descriptionSw: "Ghala kuu la taifa la nafaka lenye mashamba mapana ya mahindi na ngano."
  },
  {
    id: "nakuru",
    name: "Nakuru",
    countyName: "Nakuru County",
    region: "Central Rift Valley",
    regionSw: "Bonde la Kati la Ufa",
    agroZone: "Volcanic Fertile Basin",
    agroZoneSw: "Bonde Lenye Rutuba ya Volkano",
    x: 225,
    y: 478,
    mainCrops: ["maize", "beans", "sorghum"],
    description: "Major agro-logistics hub connecting western producers to central consumer markets.",
    descriptionSw: "Kituo kikuu cha usafirishaji kinachounganisha magharibi na masoko ya kati."
  },
  {
    id: "nyandarua",
    name: "Nyandarua",
    countyName: "Nyandarua County",
    region: "Aberdare Highlands",
    regionSw: "Nyanda za Juu za Aberdare",
    agroZone: "Cool Sub-Alpine Horticulture",
    agroZoneSw: "Eneo Baridi la Kilimo cha Bustani",
    x: 269,
    y: 467,
    mainCrops: ["chili", "beans", "wheat"],
    description: "High altitude cool climate ideal for premium export chilis and tubers.",
    descriptionSw: "Eneo baridi lenye mwinuko linalofaa pilipili safi za kuuza na mizizi."
  },
  {
    id: "meru",
    name: "Meru",
    countyName: "Meru County",
    region: "Mount Kenya Eastern Slopes",
    regionSw: "Miteremko ya Mashariki ya Mlima Kenya",
    agroZone: "Rich Volcanic Soil Slopes",
    agroZoneSw: "Udongo Mzuri wa Mlima",
    x: 381,
    y: 446,
    mainCrops: ["sorghum", "millet", "beans"],
    description: "Drought-resilient sorghum & millet powerhouse on rich Mt. Kenya volcanic soils.",
    descriptionSw: "Eneo kuu la mtama na wimbi kwenye udongo wa volkano wa Mlima Kenya."
  },
  {
    id: "kakamega",
    name: "Kakamega",
    countyName: "Kakamega County",
    region: "Western Rainforest Zone",
    regionSw: "Ukanda wa Msitu Magharibi",
    agroZone: "High Rainfall Moist Basin",
    agroZoneSw: "Ukanda wa Mvua Nyingi",
    x: 94,
    y: 423,
    mainCrops: ["ginger", "beans", "maize"],
    description: "Humid tropical climate supporting aromatic ginger roots and legumes.",
    descriptionSw: "Hali ya hewa ya unyevu inayofaa tangawizi kali yenye harufu nzuri na mikunde."
  },
  {
    id: "nairobi",
    name: "Nairobi",
    countyName: "Nairobi County",
    region: "National Central Terminal",
    regionSw: "Kituo Kikuu cha Taifa",
    agroZone: "Commercial Wholesale Center",
    agroZoneSw: "Soko Kuu la Jumla",
    x: 298,
    y: 571,
    mainCrops: ["maize", "chili", "ginger"],
    description: "Wakulima Market & national wholesale consolidation terminal.",
    descriptionSw: "Soko la Wakulima na kituo cha kitaifa cha mauzo ya jumla ya mazao."
  },
  {
    id: "kisumu",
    name: "Kisumu",
    countyName: "Kisumu County",
    region: "Lake Victoria Basin",
    regionSw: "Bonde la Ziwa Victoria",
    agroZone: "Lacustrine Lowlands",
    agroZoneSw: "Nyanda za Chini za Ziwa",
    x: 96,
    y: 459,
    mainCrops: ["sorghum", "millet"],
    description: "Key lake distribution port trading cereals and lake basin agricultural produce.",
    descriptionSw: "Bandari kuu ya ziwa inayouza nafaka na mazao ya bonde la ziwa."
  },
  {
    id: "mombasa",
    name: "Mombasa",
    countyName: "Mombasa County",
    region: "Coastal Maritime Hub",
    regionSw: "Ukanda wa Pwani",
    agroZone: "Maritime Coastal Plain",
    agroZoneSw: "Uwanda wa Bahari",
    x: 580,
    y: 829,
    mainCrops: ["ginger", "chili"],
    description: "Deep sea port & regional maritime distribution gateway.",
    descriptionSw: "Bandari kuu ya kimataifa na kituo cha usafirishaji cha pwani."
  }
];

const CROP_TRANSLATIONS: Record<string, { en: string; sw: string; color: string }> = {
  maize: { en: "Maize", sw: "Mahindi", color: "bg-amber-100 text-amber-900 border-amber-300" },
  sorghum: { en: "Sorghum", sw: "Mtama", color: "bg-orange-100 text-orange-900 border-orange-300" },
  millet: { en: "Millet", sw: "Wimbi", color: "bg-yellow-100 text-yellow-900 border-yellow-300" },
  chili: { en: "Red Chili", sw: "Pilipili", color: "bg-red-100 text-red-900 border-red-300" },
  ginger: { en: "Ginger", sw: "Tangawizi", color: "bg-amber-100 text-amber-950 border-amber-400" },
  beans: { en: "Beans", sw: "Maharagwe", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  wheat: { en: "Wheat", sw: "Ngano", color: "bg-stone-100 text-stone-900 border-stone-300" }
};

interface KenyaHarvestMapProps {
  listings: Listing[];
  selectedLocation: string;
  onSelectCounty: (countyName: string) => void;
  locale: "en" | "sw";
  activeCropFilter?: string;
  activeGradeFilter?: string;
}

export const KenyaHarvestMap: React.FC<KenyaHarvestMapProps> = ({
  listings,
  selectedLocation,
  onSelectCounty,
  locale,
  activeCropFilter = "all",
  activeGradeFilter = "all"
}) => {
  const [hoveredCountyId, setHoveredCountyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "regions">("map");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Group listings by county location
  const countyMetrics = useMemo(() => {
    const map = new Map<string, {
      count: number;
      totalVolumeBags: number;
      totalVolumeKg: number;
      crops: Set<CropType>;
      listings: Listing[];
      minPrice: number;
      maxPrice: number;
    }>();

    // Initialize all counties with zero values
    KENYA_COUNTIES.forEach(c => {
      map.set(c.name.toLowerCase(), {
        count: 0,
        totalVolumeBags: 0,
        totalVolumeKg: 0,
        crops: new Set<CropType>(),
        listings: [],
        minPrice: Infinity,
        maxPrice: -Infinity
      });
    });

    // Populate from current filtered listings
    listings.forEach(l => {
      const locKey = l.location.toLowerCase();
      let metric = map.get(locKey);
      if (!metric) {
        // Fallback for partial match
        const found = KENYA_COUNTIES.find(c => locKey.includes(c.name.toLowerCase()));
        if (found) {
          metric = map.get(found.name.toLowerCase());
        }
      }

      if (metric) {
        metric.count += 1;
        metric.crops.add(l.crop);
        metric.listings.push(l);
        if (l.unit === "90kg Bag") {
          metric.totalVolumeBags += l.quantity;
        } else {
          metric.totalVolumeKg += l.quantity;
        }
        if (l.pricePerUnit < metric.minPrice) metric.minPrice = l.pricePerUnit;
        if (l.pricePerUnit > metric.maxPrice) metric.maxPrice = l.pricePerUnit;
      }
    });

    return map;
  }, [listings]);

  // Overall totals for summary badges
  const totalActiveCounties = useMemo(() => {
    let count = 0;
    countyMetrics.forEach(m => {
      if (m.count > 0) count++;
    });
    return count;
  }, [countyMetrics]);

  const topCountyByVolume = useMemo(() => {
    let topName = "";
    let maxCount = 0;
    countyMetrics.forEach((m, key) => {
      if (m.count > maxCount) {
        maxCount = m.count;
        const matched = KENYA_COUNTIES.find(c => c.name.toLowerCase() === key);
        topName = matched ? matched.name : key;
      }
    });
    return topName;
  }, [countyMetrics]);

  const selectedCountyObj = useMemo(() => {
    if (selectedLocation === "all") return null;
    return KENYA_COUNTIES.find(c => c.name.toLowerCase() === selectedLocation.toLowerCase()) || null;
  }, [selectedLocation]);

  const hoveredCountyObj = useMemo(() => {
    if (!hoveredCountyId) return null;
    return KENYA_COUNTIES.find(c => c.id === hoveredCountyId) || null;
  }, [hoveredCountyId]);

  const activeFocusCounty = hoveredCountyObj || selectedCountyObj;
  const activeFocusMetric = activeFocusCounty ? countyMetrics.get(activeFocusCounty.name.toLowerCase()) : null;

  return (
    <div className="bg-[#FDFCFB] rounded-[32px] shadow-sm border border-natural-bone p-5 lg:p-6 space-y-5 select-none transition-all">
      {/* MAP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-natural-bone pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-natural-olive text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4 text-natural-sage" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-natural-olive uppercase tracking-tight font-display italic flex items-center gap-2">
                {locale === "en" ? "Kenyan Harvest Geographic Distribution" : "Ramani ya Usambazaji wa Mavuno Kenya"}
              </h3>
              <p className="text-[11px] text-natural-olive/70 font-medium">
                {locale === "en" 
                  ? "Live farm supply density by county • Click any marker to filter catalog" 
                  : "Mavuno ya mashambani kwa kaunti • Bofya eneo kuchuja bidhaa"}
              </p>
            </div>
          </div>
        </div>

        {/* View Switches & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {selectedLocation !== "all" && (
            <button
              type="button"
              onClick={() => onSelectCounty("all")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-natural-sand text-natural-olive border border-natural-bone hover:bg-natural-bone transition cursor-pointer"
              title={locale === "en" ? "Reset filter to all Kenya" : "Rejesha kaunti zote"}
            >
              <RotateCcw className="w-3 h-3 text-natural-sage" />
              <span>{locale === "en" ? "Reset to All Kenya" : "Onyesha Kaunti Zote"}</span>
            </button>
          )}

          <div className="bg-natural-sand p-1 rounded-full border border-natural-bone flex items-center gap-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1 ${activeTab === "map" ? "bg-natural-olive text-white shadow-xs" : "text-natural-olive/70 hover:text-natural-olive"}`}
            >
              <MapPin className="w-3 h-3" />
              <span>{locale === "en" ? "Interactive Map" : "Ramani"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("regions")}
              className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1 ${activeTab === "regions" ? "bg-natural-olive text-white shadow-xs" : "text-natural-olive/70 hover:text-natural-olive"}`}
            >
              <Layers className="w-3 h-3" />
              <span>{locale === "en" ? "Agro Hubs" : "Mikoa"}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full bg-natural-sand border border-natural-bone text-natural-olive hover:bg-natural-bone transition cursor-pointer hidden md:flex items-center justify-center"
            title={isExpanded ? "Collapse Map" : "Expand Map"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SUMMARY STATS TICKER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
        <div className="bg-natural-sand/60 border border-natural-bone rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-natural-olive/60 font-mono">
            {locale === "en" ? "Active Hubs" : "Kaunti Zenye Mazao"}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold font-display text-natural-olive">{totalActiveCounties}</span>
            <span className="text-[11px] text-natural-olive/60 font-medium">/ {KENYA_COUNTIES.length}</span>
          </div>
        </div>

        <div className="bg-natural-sand/60 border border-natural-bone rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-natural-olive/60 font-mono">
            {locale === "en" ? "Filtered Listings" : "Mavuno Yaliyoorodheshwa"}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold font-display text-natural-olive">{listings.length}</span>
            <span className="text-[11px] text-natural-olive/60 font-medium">{locale === "en" ? "lots" : "mizigo"}</span>
          </div>
        </div>

        <div className="bg-natural-sand/60 border border-natural-bone rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-natural-olive/60 font-mono">
            {locale === "en" ? "Leading Origin" : "Kaunti Inayoongoza"}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1 truncate">
            <span className="text-sm font-bold font-display text-natural-olive truncate">
              {topCountyByVolume || (locale === "en" ? "None" : "Hakuna")}
            </span>
          </div>
        </div>

        <div className="bg-natural-sand/60 border border-natural-bone rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-natural-olive/60 font-mono">
            {locale === "en" ? "Selected County" : "Kaunti Iliyochaguliwa"}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1 truncate">
            <span className="text-sm font-bold font-display text-natural-sage truncate">
              {selectedLocation === "all" ? (locale === "en" ? "All Kenya" : "Kenya Yote") : selectedLocation}
            </span>
          </div>
        </div>
      </div>

      {/* ACTIVE CROP / GRADE NOTICE PILL */}
      {(activeCropFilter !== "all" || activeGradeFilter !== "all") && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-natural-sand/40 border border-natural-bone rounded-xl text-xs text-natural-olive/80">
          <Filter className="w-3.5 h-3.5 text-natural-sage flex-shrink-0" />
          <span>
            {locale === "en" ? "Map showing supply for: " : "Ramani inaonyesha upatikanaji wa: "}
            <strong className="text-natural-olive uppercase">
              {activeCropFilter !== "all" ? (CROP_TRANSLATIONS[activeCropFilter]?.[locale] || activeCropFilter) : (locale === "en" ? "All Crops" : "Mazao Yote")}
            </strong>
            {activeGradeFilter !== "all" && (
              <span> • <strong className="text-natural-olive">{activeGradeFilter}</strong></span>
            )}
          </span>
        </div>
      )}

      {/* MAIN VIEW: INTERACTIVE MAP OR REGIONS GRID */}
      {activeTab === "map" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* MAP CANVAS CONTAINER */}
          <div className={`relative bg-[#F4F1EA] rounded-3xl border-2 border-natural-bone overflow-hidden shadow-inner p-2 lg:p-4 ${isExpanded ? "lg:col-span-8 h-[540px]" : "lg:col-span-7 h-[440px]"} flex items-center justify-center`}>
            
            {/* Compass Rose Accent */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-center bg-[#FDFCFB]/90 backdrop-blur-xs border border-natural-bone rounded-2xl p-2 px-2.5 shadow-xs pointer-events-none">
              <span className="text-[9px] font-mono font-bold text-natural-earth">N ▲</span>
              <Compass className="w-4 h-4 text-natural-olive my-0.5" />
              <span className="text-[8px] font-mono text-natural-olive/50">KENYA</span>
            </div>

            {/* Scale / Coordinate Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-[#FDFCFB]/90 backdrop-blur-xs border border-natural-bone rounded-2xl p-2 px-3 text-[10px] font-mono text-natural-olive/70 shadow-xs pointer-events-none flex flex-col gap-0.5">
              <span className="font-bold text-natural-olive flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                {locale === "en" ? "Active Harvest" : "Mavuno Yapo"}
              </span>
              <span className="text-[9px] text-natural-olive/60">0° Equator • WGS84</span>
            </div>

            {/* SVG MAP ELEMENT */}
            <svg 
              viewBox="0 0 800 900" 
              className="w-full h-full max-h-full object-contain filter drop-shadow-sm select-none"
              style={{ maxHeight: "100%" }}
            >
              <defs>
                {/* Kenya Terrain Gradient */}
                <linearGradient id="kenyaLand" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EFECE3" />
                  <stop offset="50%" stopColor="#E8E4D8" />
                  <stop offset="100%" stopColor="#DED9C9" />
                </linearGradient>

                {/* Lake Victoria & Turkana Water Gradient */}
                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A8C7BE" />
                  <stop offset="100%" stopColor="#8EAFAB" />
                </linearGradient>

                {/* Indian Ocean Gradient */}
                <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B3CFCE" />
                  <stop offset="100%" stopColor="#96B8B7" />
                </linearGradient>

                {/* Grain Belt Highland Tint */}
                <radialGradient id="highlandGlow" cx="30%" cy="50%" r="40%">
                  <stop offset="0%" stopColor="#A3A375" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#A3A375" stopOpacity="0" />
                </radialGradient>

                {/* Active marker glow pulse */}
                <filter id="markerGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#5A5A40" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Surrounding Geography Subtle Grid */}
              <g opacity="0.15" stroke="#5A5A40" strokeWidth="0.8" strokeDasharray="4 8">
                <line x1="0" y1="225" x2="800" y2="225" />
                <line x1="0" y1="450" x2="800" y2="450" strokeWidth="1.5" strokeDasharray="none" /> {/* Equator */}
                <line x1="0" y1="675" x2="800" y2="675" />
                <line x1="200" y1="0" x2="200" y2="900" />
                <line x1="400" y1="0" x2="400" y2="900" />
                <line x1="600" y1="0" x2="600" y2="900" />
              </g>

              {/* Equator Line Label */}
              <text x="40" y="445" fill="#5A5A40" opacity="0.4" fontSize="12" fontFamily="monospace" fontWeight="bold">
                0° EQUATOR (IKWETA)
              </text>

              {/* INDIAN OCEAN WATER BODY */}
              <path
                d="M 535,889 L 580,829 L 598,790 L 624,752 L 701,663 L 770,609 L 800,600 L 800,900 L 525,900 Z"
                fill="url(#oceanGrad)"
                opacity="0.75"
              />
              <text x="670" y="800" fill="#4B7776" opacity="0.6" fontSize="13" fontFamily="serif" fontStyle="italic">
                Indian Ocean
              </text>

              {/* KENYA NATIONAL PERIMETER OUTLINE (Authentic Geographic Bounds) */}
              <path
                d="
                  M 148,19 
                  L 217,28 
                  L 365,75 
                  L 514,122 
                  L 800,84 
                  L 711,263 
                  L 662,450 
                  L 760,600 
                  L 770,609 
                  L 701,663 
                  L 624,752 
                  L 598,790 
                  L 580,829 
                  L 535,889 
                  L 525,877 
                  L 382,769 
                  L 365,731 
                  L 295,689 
                  L 217,638 
                  L 66,567 
                  L 35,539 
                  L 64,499 
                  L 39,489 
                  L 15,441 
                  L 31,407 
                  L 74,343 
                  L 97,336 
                  L 109,263 
                  L 59,169 
                  L 49,56 
                  Z
                "
                fill="url(#kenyaLand)"
                stroke="#5A5A40"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* HIGHLAND BREADBASKET ELEVATION GLOW */}
              <ellipse 
                cx="240" 
                cy="460" 
                rx="160" 
                ry="110" 
                fill="url(#highlandGlow)" 
                pointerEvents="none"
              />

              {/* LAKE TURKANA (Jade Sea in North Kenya) */}
              <path
                d="M 230,50 Q 248,110 240,160 Q 235,195 245,230 Q 225,210 215,160 Q 210,100 220,55 Z"
                fill="url(#waterGrad)"
                stroke="#6B938A"
                strokeWidth="1.2"
              />
              <text x="250" y="140" fill="#507870" opacity="0.75" fontSize="11" fontFamily="sans-serif" fontStyle="italic">
                Lake Turkana
              </text>

              {/* LAKE VICTORIA (Western Shore & Winam Gulf) */}
              <path
                d="M 15,441 Q 65,470 96,462 Q 70,490 64,499 Q 39,489 35,539 L 0,550 L 0,430 Z"
                fill="url(#waterGrad)"
                stroke="#6B938A"
                strokeWidth="1.2"
              />
              <text x="25" y="475" fill="#507870" opacity="0.8" fontSize="11" fontFamily="sans-serif" fontStyle="italic">
                Lake Victoria
              </text>

              {/* GREAT RIFT VALLEY TRENCH INDICATION */}
              <path
                d="M 235,230 Q 210,340 220,440 Q 225,480 250,560 Q 240,640 230,680"
                fill="none"
                stroke="#8B4513"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                opacity="0.3"
              />

              {/* MOUNT KENYA PEAK SYMBOL (Elevation: 5,199m) */}
              <g transform="translate(345, 460)">
                <path d="M 0,0 L 7,-14 L 14,0 Z" fill="#8B4513" opacity="0.45" />
                <path d="M 3,-6 L 7,-14 L 11,-6 Z" fill="#FFFFFF" opacity="0.8" />
                <text x="18" y="-4" fill="#5A5A40" fontSize="9" fontFamily="monospace" opacity="0.6">
                  Mt. Kenya (5,199m)
                </text>
              </g>

              {/* MOUNT ELGON PEAK SYMBOL */}
              <g transform="translate(68, 340)">
                <path d="M 0,0 L 6,-11 L 12,0 Z" fill="#8B4513" opacity="0.35" />
                <text x="15" y="-2" fill="#5A5A40" fontSize="8" fontFamily="monospace" opacity="0.5">
                  Mt. Elgon
                </text>
              </g>

              {/* REGIONAL COUNTY BOUNDARY SECTORS (Subtle Delineations) */}
              <g opacity="0.25" stroke="#5A5A40" strokeWidth="1" strokeDasharray="3 3" fill="none">
                {/* North Rift / Uasin Gishu boundary */}
                <path d="M 110,360 Q 180,360 200,430 L 150,450 Z" />
                {/* Central Aberdares / Nyandarua */}
                <path d="M 230,440 Q 300,430 310,500 L 250,510 Z" />
                {/* Mount Kenya Meru sector */}
                <path d="M 340,410 Q 420,400 430,490 L 350,500 Z" />
              </g>

              {/* INTERACTIVE COUNTY MARKERS */}
              {KENYA_COUNTIES.map((county) => {
                const metric = countyMetrics.get(county.name.toLowerCase());
                const count = metric?.count || 0;
                const isSelected = selectedLocation.toLowerCase() === county.name.toLowerCase();
                const isHovered = hoveredCountyId === county.id;
                const hasListings = count > 0;

                // Marker visual properties
                const baseRadius = hasListings ? Math.min(18, 11 + count * 2.5) : 8;
                const markerColor = isSelected ? "#5A5A40" : hasListings ? "#3E7B5C" : "#A3A375";

                return (
                  <g 
                    key={county.id}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => {
                      if (isSelected) {
                        onSelectCounty("all");
                      } else {
                        onSelectCounty(county.name);
                      }
                    }}
                    onMouseEnter={() => setHoveredCountyId(county.id)}
                    onMouseLeave={() => setHoveredCountyId(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${county.name}: ${count} harvest listings available`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectCounty(isSelected ? "all" : county.name);
                      }
                    }}
                  >
                    {/* Animated Pulsing Wave Radar Ring for active counties */}
                    {hasListings && (
                      <circle
                        cx={county.x}
                        cy={county.y}
                        r={baseRadius + 10}
                        fill="none"
                        stroke="#3E7B5C"
                        strokeWidth="2"
                        opacity={isHovered || isSelected ? "0.8" : "0.4"}
                        className="animate-ping origin-center"
                        style={{ transformOrigin: `${county.x}px ${county.y}px`, animationDuration: "3s" }}
                      />
                    )}

                    {/* Outer Selection Aura Ring */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={county.x}
                        cy={county.y}
                        r={baseRadius + 7}
                        fill={isSelected ? "#5A5A40" : "#3E7B5C"}
                        fillOpacity="0.2"
                        stroke={isSelected ? "#5A5A40" : "#3E7B5C"}
                        strokeWidth="1.5"
                        strokeDasharray={isSelected ? "none" : "2 2"}
                      />
                    )}

                    {/* Main Circular Marker Core */}
                    <circle
                      cx={county.x}
                      cy={county.y}
                      r={baseRadius}
                      fill={hasListings ? (isSelected ? "#5A5A40" : "#2E694E") : "#D4D0C2"}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      filter="url(#markerGlow)"
                    />

                    {/* Center Icon or Count Badge */}
                    {hasListings ? (
                      <text
                        x={county.x}
                        y={county.y + 4}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={baseRadius > 14 ? "12" : "10"}
                        fontWeight="bold"
                        fontFamily="monospace"
                        pointerEvents="none"
                      >
                        {count}
                      </text>
                    ) : (
                      <circle
                        cx={county.x}
                        cy={county.y}
                        r="3"
                        fill="#5A5A40"
                        opacity="0.5"
                      />
                    )}

                    {/* County Name Label on Map */}
                    <g transform={`translate(${county.x}, ${county.y + baseRadius + 14})`}>
                      {/* Background pill for text legibility */}
                      <rect
                        x="-38"
                        y="-10"
                        width="76"
                        height="16"
                        rx="8"
                        fill="#FDFCFB"
                        fillOpacity={isSelected ? "1" : "0.85"}
                        stroke={isSelected ? "#5A5A40" : hasListings ? "#3E7B5C" : "#DDD8CB"}
                        strokeWidth={isSelected ? "1.5" : "0.8"}
                      />
                      <text
                        x="0"
                        y="1.5"
                        textAnchor="middle"
                        fill={isSelected ? "#5A5A40" : hasListings ? "#1B4734" : "#6E6B5D"}
                        fontSize="9.5"
                        fontWeight={isSelected || hasListings ? "bold" : "500"}
                        fontFamily="sans-serif"
                      >
                        {county.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* SIDEBAR: COUNTY DETAILS & LISTINGS FLYOUT */}
          <div className={`${isExpanded ? "lg:col-span-4" : "lg:col-span-5"} space-y-4`}>
            {activeFocusCounty ? (
              <motion.div
                key={activeFocusCounty.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-natural-sand/40 border-2 border-natural-bone rounded-3xl p-5 space-y-4 shadow-xs"
              >
                {/* Header with County & Zone Info */}
                <div className="flex items-start justify-between gap-3 border-b border-natural-bone pb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-natural-olive inline-block"></span>
                      <h4 className="text-base font-bold font-display text-natural-olive tracking-tight">
                        {activeFocusCounty.name}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-natural-olive/70 block">
                      {activeFocusCounty.countyName}
                    </span>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-natural-sand text-natural-olive border border-natural-bone">
                      {locale === "en" ? activeFocusCounty.region : activeFocusCounty.regionSw}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedLocation.toLowerCase() === activeFocusCounty.name.toLowerCase()) {
                        onSelectCounty("all");
                      } else {
                        onSelectCounty(activeFocusCounty.name);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      selectedLocation.toLowerCase() === activeFocusCounty.name.toLowerCase()
                        ? "bg-natural-olive text-white"
                        : "bg-natural-sage text-white hover:opacity-90"
                    }`}
                  >
                    {selectedLocation.toLowerCase() === activeFocusCounty.name.toLowerCase() ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{locale === "en" ? "Active Filter" : "Imechaguliwa"}</span>
                      </>
                    ) : (
                      <>
                        <Filter className="w-3.5 h-3.5" />
                        <span>{locale === "en" ? "Filter Soko" : "Chuja Hapa"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Agro-ecological description */}
                <p className="text-xs text-natural-olive/80 leading-relaxed italic">
                  "{locale === "en" ? activeFocusCounty.description : activeFocusCounty.descriptionSw}"
                </p>

                {/* Harvest Supply Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-[#FDFCFB] border border-natural-bone rounded-2xl p-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-natural-olive/60 block uppercase">
                      {locale === "en" ? "Current Listings" : "Mizigo Iliyopo"}
                    </span>
                    <span className="text-lg font-bold font-display text-natural-olive">
                      {activeFocusMetric?.count || 0} {locale === "en" ? "lots" : "mizigo"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-natural-olive/60 block uppercase">
                      {locale === "en" ? "Volume in Stock" : "Jumla ya Mavuno"}
                    </span>
                    <span className="text-sm font-bold font-display text-natural-olive">
                      {activeFocusMetric?.totalVolumeBags ? `${activeFocusMetric.totalVolumeBags.toLocaleString()} Bags` : ""}
                      {activeFocusMetric?.totalVolumeBags && activeFocusMetric?.totalVolumeKg ? " • " : ""}
                      {activeFocusMetric?.totalVolumeKg ? `${activeFocusMetric.totalVolumeKg.toLocaleString()} kg` : ""}
                      {!activeFocusMetric?.totalVolumeBags && !activeFocusMetric?.totalVolumeKg ? "0 units" : ""}
                    </span>
                  </div>
                </div>

                {/* Available Crops in this County */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-natural-olive/60 block mb-1.5 font-mono">
                    {locale === "en" ? "Crops Available from this Hub:" : "Mazao Yanayopatikana Eneo Hili:"}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {activeFocusCounty.mainCrops.map(crop => {
                      const hasActiveCrop = activeFocusMetric?.crops.has(crop);
                      const cropInfo = CROP_TRANSLATIONS[crop] || { en: crop, sw: crop, color: "bg-natural-sand text-natural-olive" };
                      return (
                        <span
                          key={crop}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                            hasActiveCrop 
                              ? cropInfo.color + " shadow-xs" 
                              : "bg-natural-bone/40 text-natural-olive/50 border-natural-bone"
                          }`}
                        >
                          <Wheat className="w-3 h-3" />
                          <span>{cropInfo[locale]}</span>
                          {hasActiveCrop && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Listing Preview Snippets */}
                {activeFocusMetric && activeFocusMetric.listings.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-natural-olive/60 font-mono block">
                      {locale === "en" ? "Available Lots in this County:" : "Mavuno Yanayouzwa:"}
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {activeFocusMetric.listings.slice(0, 3).map(item => (
                        <div key={item.id} className="bg-[#FDFCFB] border border-natural-bone rounded-xl p-2 px-3 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-natural-olive capitalize">
                              {CROP_TRANSLATIONS[item.crop]?.[locale] || item.crop}
                            </span>
                            <span className="text-[10px] text-natural-olive/60 block font-mono">
                              {item.farmerName} • {item.grade}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-natural-olive block">
                              KES {item.pricePerUnit.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-natural-sage font-medium">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-natural-sand/30 border-2 border-dashed border-natural-bone rounded-3xl p-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[280px]">
                <div className="w-12 h-12 rounded-full bg-natural-sand flex items-center justify-center text-natural-olive">
                  <MapPin className="w-6 h-6 text-natural-sage" />
                </div>
                <h4 className="text-sm font-bold text-natural-olive uppercase tracking-tight font-display">
                  {locale === "en" ? "Select a Kenyan County Marker" : "Chagua Eneo Kwenye Ramani"}
                </h4>
                <p className="text-xs text-natural-olive/70 max-w-xs leading-normal">
                  {locale === "en"
                    ? "Hover over or tap any county marker on the map to inspect farm gate volumes, verified producers, and prevailing cereal prices."
                    : "Weka kishale au bofya alama yoyote ya kaunti kuona idadi ya mazao, wakulima, na bei za soko."}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {KENYA_COUNTIES.slice(0, 4).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelectCounty(c.name)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-natural-sand text-natural-olive border border-natural-bone transition cursor-pointer"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* REGIONS GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {KENYA_COUNTIES.map(county => {
            const metric = countyMetrics.get(county.name.toLowerCase());
            const count = metric?.count || 0;
            const isSelected = selectedLocation.toLowerCase() === county.name.toLowerCase();

            return (
              <div
                key={county.id}
                onClick={() => onSelectCounty(isSelected ? "all" : county.name)}
                className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-natural-olive text-white border-natural-olive shadow-sm"
                    : count > 0
                    ? "bg-[#FDFCFB] hover:bg-natural-sand/40 border-natural-bone text-natural-olive"
                    : "bg-natural-sand/20 border-natural-bone/60 text-natural-olive/60"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold font-display tracking-tight">{county.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isSelected 
                        ? "bg-[#4A4A35] text-natural-sage" 
                        : count > 0 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-natural-sand text-natural-olive/60"
                    }`}>
                      {count} {locale === "en" ? "lots" : "mizigo"}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono block mt-0.5 ${isSelected ? "text-natural-sand" : "text-natural-olive/60"}`}>
                    {county.countyName}
                  </span>
                  <p className={`text-[11px] mt-2 leading-relaxed line-clamp-2 ${isSelected ? "text-white/80" : "text-natural-olive/80"}`}>
                    {locale === "en" ? county.description : county.descriptionSw}
                  </p>
                </div>

                <div className="border-t border-natural-bone/40 pt-2 flex items-center justify-between text-[10px] font-mono">
                  <span>{locale === "en" ? county.region : county.regionSw}</span>
                  <ArrowRight className="w-3 h-3 text-natural-sage" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK COUNTY PILLS ROW FOR RAPID SELECTION */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-natural-olive/60 font-mono flex-shrink-0 mr-1">
          {locale === "en" ? "Quick County Filter:" : "Chagua Kaunti Moja kwa Moja:"}
        </span>
        <button
          type="button"
          onClick={() => onSelectCounty("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition flex-shrink-0 cursor-pointer ${
            selectedLocation === "all"
              ? "bg-natural-olive text-white shadow-xs"
              : "bg-natural-sand text-natural-olive hover:bg-natural-bone border border-natural-bone"
          }`}
        >
          {locale === "en" ? "All Kenya (47)" : "Kenya Yote"}
        </button>
        {KENYA_COUNTIES.map(c => {
          const metric = countyMetrics.get(c.name.toLowerCase());
          const count = metric?.count || 0;
          const isSelected = selectedLocation.toLowerCase() === c.name.toLowerCase();

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCounty(isSelected ? "all" : c.name)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex-shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                isSelected
                  ? "bg-natural-olive text-white border-natural-olive shadow-xs"
                  : count > 0
                  ? "bg-[#FDFCFB] text-natural-olive hover:bg-natural-sand border-natural-bone"
                  : "bg-natural-sand/40 text-natural-olive/60 border-natural-bone/60"
              }`}
            >
              <span>{c.name}</span>
              {count > 0 && (
                <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-mono ${
                  isSelected ? "bg-white text-natural-olive" : "bg-natural-sage text-white"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
