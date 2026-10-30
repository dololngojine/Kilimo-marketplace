import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  History, 
  CheckCircle2, 
  Cloud, 
  Clock, 
  Pencil,
  WifiOff,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Listing, MarketPrice } from '../types';

interface ListingPriceTrackerProps {
  listing: Listing;
  benchmark?: MarketPrice;
  locale?: 'en' | 'sw';
  isFarmerOwner?: boolean;
  onEdit?: () => void;
}

export const ListingPriceTracker: React.FC<ListingPriceTrackerProps> = ({
  listing,
  benchmark,
  locale = 'en',
  isFarmerOwner = false,
  onEdit
}) => {
  const isSwahili = locale === 'sw';
  const [showHistoryFlyout, setShowHistoryFlyout] = useState<boolean>(false);

  const history = listing.priceHistory || [];
  const hasHistory = history.length > 1;

  // Calculate price trend if revised
  let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
  let diffAmount = 0;
  let diffPercent = '0.0';

  if (hasHistory) {
    const latest = history[history.length - 1];
    const prev = history[history.length - 2];
    diffAmount = latest.price - prev.price;
    if (diffAmount > 0) trendDirection = 'up';
    else if (diffAmount < 0) trendDirection = 'down';

    if (prev.price > 0) {
      diffPercent = ((Math.abs(diffAmount) / prev.price) * 100).toFixed(1);
    }
  }

  // Benchmark comparison
  const benchmarkDiff = benchmark ? listing.pricePerUnit - benchmark.avgPrice : 0;
  const benchmarkPct = benchmark && benchmark.avgPrice > 0 
    ? ((Math.abs(benchmarkDiff) / benchmark.avgPrice) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-1.5 w-full">
      {/* Price row */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-natural-olive font-display italic">
            KES {listing.pricePerUnit.toLocaleString()}
          </span>
          <span className="text-[10px] text-natural-olive/60 font-sans">
            /{listing.unit === '90kg Bag' ? (isSwahili ? 'Gunia' : 'Bag') : 'kg'}
          </span>
        </div>

        {/* Price Revision Trend Pill */}
        {hasHistory && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowHistoryFlyout(!showHistoryFlyout);
            }}
            title={isSwahili ? 'Bofya kuona historia ya bei' : 'Click to view price history'}
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition cursor-pointer border shadow-2xs ${
              trendDirection === 'up'
                ? 'bg-natural-sage/15 text-natural-olive border-natural-sage/30 hover:bg-natural-sage/25'
                : trendDirection === 'down'
                ? 'bg-natural-earth/15 text-natural-earth border-natural-earth/30 hover:bg-natural-earth/25'
                : 'bg-natural-sand text-natural-olive border-natural-bone'
            }`}
          >
            {trendDirection === 'up' ? (
              <TrendingUp className="w-3 h-3 text-natural-sage" />
            ) : trendDirection === 'down' ? (
              <TrendingDown className="w-3 h-3 text-natural-earth" />
            ) : (
              <History className="w-3 h-3" />
            )}
            <span>
              {trendDirection === 'up' ? '+' : trendDirection === 'down' ? '-' : ''}
              {diffPercent}%
            </span>
          </button>
        )}

        {/* Farmer Edit Trigger button */}
        {isFarmerOwner && onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDFCFB] hover:bg-natural-sand border border-natural-bone text-[10px] font-bold text-natural-olive transition cursor-pointer shadow-2xs ml-auto"
          >
            <Pencil className="w-2.5 h-2.5 text-natural-sage" />
            <span>{isSwahili ? 'Hariri Bei' : 'Edit Listing'}</span>
          </button>
        )}
      </div>

      {/* Sync & Benchmark Sub-bar */}
      <div className="flex items-center justify-between text-[9px] font-mono text-natural-olive/70 pt-0.5">
        {/* Sync status */}
        <span className="flex items-center gap-1 text-[9px]">
          {listing.isOffline ? (
            <span className="text-natural-earth flex items-center gap-0.5 font-bold">
              <WifiOff className="w-2.5 h-2.5" />
              {isSwahili ? 'Foleni ya Nje ya Mtandao' : 'Queued Offline'}
            </span>
          ) : (
            <span className="text-natural-olive/80 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-natural-sage" />
              {isSwahili ? 'Imesawazishwa' : 'Synced'}
            </span>
          )}
        </span>

        {/* Benchmark note */}
        {benchmark && (
          <span className="truncate max-w-[170px]" title={`Benchmark: KES ${benchmark.avgPrice}`}>
            {benchmarkDiff === 0 ? (
              <span className="text-natural-olive/80">At NCPB Market Ref</span>
            ) : benchmarkDiff > 0 ? (
              <span className="text-natural-olive/90 font-medium">+{benchmarkPct}% vs ref</span>
            ) : (
              <span className="text-natural-earth font-medium">-{benchmarkPct}% vs ref</span>
            )}
          </span>
        )}
      </div>

      {/* Expandable Price History Flyout */}
      {showHistoryFlyout && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="p-2.5 rounded-xl bg-[#FDFCFB] border border-natural-bone shadow-md text-xs space-y-1.5 my-1.5 animate-fadeIn"
        >
          <div className="flex justify-between items-center text-[10px] font-bold text-natural-olive uppercase tracking-wider border-b border-natural-bone pb-1">
            <span className="flex items-center gap-1">
              <History className="w-3 h-3 text-natural-sage" />
              {isSwahili ? 'Historia ya Mabadiliko' : 'Price Tracking Log'}
            </span>
            <button
              type="button"
              onClick={() => setShowHistoryFlyout(false)}
              className="text-natural-olive/50 hover:text-natural-olive cursor-pointer text-[11px]"
            >
              ×
            </button>
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-mono py-0.5">
                <div>
                  <span className="font-bold text-natural-olive">KES {h.price.toLocaleString()}</span>
                  {h.note && (
                    <span className="text-natural-olive/60 block font-sans text-[9px] line-clamp-1">
                      {h.note}
                    </span>
                  )}
                </div>
                <span className="text-natural-olive/50 text-[9px]">
                  {new Date(h.changedAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
