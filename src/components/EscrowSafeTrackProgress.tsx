import React from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  PackageCheck, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Order } from '../types';

interface EscrowSafeTrackProgressProps {
  order: Order;
  locale?: 'en' | 'sw';
}

interface LogisticsPhase {
  key: 'pending' | 'dispatched' | 'completed';
  labelEn: string;
  labelSw: string;
  sublabelEn: string;
  sublabelSw: string;
  targetPercent: number;
}

const PHASES: LogisticsPhase[] = [
  {
    key: 'pending',
    labelEn: 'Awaiting Dispatch',
    labelSw: 'Inasubiri Kusafirishwa',
    sublabelEn: 'Farmer preparing cargo',
    sublabelSw: 'Mkulima anatayarisha mzigo',
    targetPercent: 20
  },
  {
    key: 'dispatched',
    labelEn: 'In Transit',
    labelSw: 'Kwenye Usafiri',
    sublabelEn: 'En route via transit courier',
    sublabelSw: 'Mzigo uko barabarani',
    targetPercent: 65
  },
  {
    key: 'completed',
    labelEn: 'Delivered & Released',
    labelSw: 'Umefikishwa & Pesa Zimetolewa',
    sublabelEn: 'Inspected and verified',
    sublabelSw: 'Imekaguliwa na kuthibitishwa',
    targetPercent: 100
  }
];

export const EscrowSafeTrackProgress: React.FC<EscrowSafeTrackProgressProps> = ({ 
  order, 
  locale = 'en' 
}) => {
  const isSwahili = locale === 'sw';
  const orderTime = new Date(order.createdAt).getTime();
  const now = Date.now();
  const hoursSinceOrder = Math.max(0, (now - orderTime) / (1000 * 60 * 60));

  // Calculate delivery window and progress
  // Standard transit window in Kenya for agricultural freight is 24 - 48 hours from dispatch
  let progressPercent = 15;
  let etaText = '';
  let etaWindow = '';
  let statusBadge = '';
  let statusColor = 'text-natural-olive';
  let barColor = 'bg-natural-sage';

  const orderDateObj = new Date(order.createdAt);
  // Expected delivery window: min 24h, max 48h from creation/dispatch
  const estArrivalMin = new Date(orderDateObj.getTime() + 24 * 3600 * 1000);
  const estArrivalMax = new Date(orderDateObj.getTime() + 48 * 3600 * 1000);

  const formatDateRange = (dMin: Date, dMax: Date) => {
    const minDay = dMin.toLocaleDateString(isSwahili ? 'sw-KE' : 'en-KE', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    const maxDay = dMax.toLocaleDateString(isSwahili ? 'sw-KE' : 'en-KE', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    const timeStr = dMax.toLocaleTimeString(isSwahili ? 'sw-KE' : 'en-KE', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${minDay} – ${maxDay} (by ~${timeStr})`;
  };

  if (order.status === 'completed') {
    progressPercent = 100;
    etaText = isSwahili ? 'Mzigo Umewasili & Kukaguliwa' : 'Cargo Delivered & Inspected';
    etaWindow = isSwahili ? 'Mkataba Umekamilika' : 'Delivery Confirmed';
    statusBadge = isSwahili ? 'Imekamilika' : 'Delivered';
    statusColor = 'text-natural-olive';
    barColor = 'bg-natural-olive';
  } else if (order.status === 'dispatched') {
    // In transit phase: dynamically calculate elapsed hours vs 36hr standard window
    // Starts at 50%, smoothly climbs towards 90%
    const transitProgress = Math.min(40, (hoursSinceOrder / 36) * 40);
    progressPercent = Math.min(92, Math.round(50 + transitProgress));

    const remainingHours = Math.max(2, Math.round(36 - hoursSinceOrder));
    etaText = isSwahili 
      ? `Inatarajiwa ndani ya masaa ${remainingHours}` 
      : `Estimated within ~${remainingHours} hrs`;
    etaWindow = formatDateRange(estArrivalMin, estArrivalMax);
    statusBadge = isSwahili ? 'Kwenye Njia' : 'In Transit';
    statusColor = 'text-natural-sage';
    barColor = 'bg-natural-sage';
  } else if (order.paymentStatus === 'paid') {
    // Paid, awaiting farmer packaging and cargo pickup
    progressPercent = Math.min(42, Math.round(22 + (hoursSinceOrder / 12) * 15));
    etaText = isSwahili ? 'Inasubiri gari la mzigo kuondoka' : 'Awaiting transit dispatch';
    etaWindow = formatDateRange(estArrivalMin, estArrivalMax);
    statusBadge = isSwahili ? 'Inatayarishwa' : 'Packaging & Ready';
    statusColor = 'text-natural-olive';
    barColor = 'bg-natural-sage';
  } else {
    // Unpaid or awaiting M-Pesa push
    progressPercent = 10;
    etaText = isSwahili ? 'Inasubiri amana ya M-Pesa kwenye escrow' : 'Awaiting M-Pesa escrow lock';
    etaWindow = isSwahili ? 'Saa 24-48 baada ya amana' : '24-48h post-escrow deposit';
    statusBadge = isSwahili ? 'Haijalipwa' : 'Unfunded';
    statusColor = 'text-natural-earth';
    barColor = 'bg-natural-earth/70';
  }

  const currentStepIndex = order.status === 'completed' ? 2 : order.status === 'dispatched' ? 1 : 0;

  return (
    <div className="bg-natural-sand/50 rounded-2xl p-3.5 border border-natural-bone/80 space-y-2.5 my-2">
      {/* Header: Status + Estimated Window */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <Truck className={`w-3.5 h-3.5 ${statusColor}`} />
          <span className="font-bold text-natural-olive tracking-tight text-[11px] uppercase">
            {isSwahili ? 'Makadirio ya Uwasilishaji' : 'Estimated Delivery Window'}
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] text-natural-olive/80 bg-[#FDFCFB] px-2 py-0.5 rounded-full border border-natural-bone">
          <Clock className="w-3 h-3 text-natural-sage" />
          <span className="font-bold">{etaText}</span>
        </div>
      </div>

      {/* Progress Bar with smooth animation */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-natural-bone/70 rounded-full overflow-hidden p-0.5 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${barColor} relative overflow-hidden`}
          >
            {/* Shimmer light effect for active transit */}
            {order.status === 'dispatched' && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2"
              />
            )}
          </motion.div>
        </div>
        
        <div className="flex justify-between items-center text-[10px] font-mono text-natural-olive/70 px-0.5">
          <span>{isSwahili ? 'Uthibitisho' : 'Created'}: {orderDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="font-bold text-natural-olive">{progressPercent}%</span>
          <span>{isSwahili ? 'Muda' : 'Target'}: {etaWindow.split(' ')[0]}</span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-natural-bone/60">
        {PHASES.map((phase, idx) => {
          const isDone = idx < currentStepIndex || order.status === 'completed';
          const isCurrent = idx === currentStepIndex && order.status !== 'completed';
          return (
            <div 
              key={phase.key} 
              className={`flex flex-col items-center text-center p-1 rounded-xl transition ${
                isCurrent 
                  ? 'bg-[#FDFCFB] border border-natural-sage/40 shadow-2xs' 
                  : isDone 
                  ? 'opacity-85' 
                  : 'opacity-40'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-natural-olive" />
                ) : isCurrent ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-natural-sage opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-natural-sage"></span>
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-natural-bone border border-natural-olive/30" />
                )}
              </div>
              <span className="text-[9px] font-bold text-natural-olive uppercase leading-tight">
                {isSwahili ? phase.labelSw : phase.labelEn}
              </span>
              <span className="text-[8px] text-natural-olive/60 font-sans line-clamp-1 hidden sm:block mt-0.5">
                {isSwahili ? phase.sublabelSw : phase.sublabelEn}
              </span>
            </div>
          );
        })}
      </div>

      {/* Delivery Schedule Details Banner */}
      <div className="flex items-start gap-1.5 bg-[#FDFCFB] p-2 rounded-xl border border-natural-bone text-[10px] text-natural-olive/80">
        <Calendar className="w-3.5 h-3.5 text-natural-sage shrink-0 mt-0.5" />
        <div className="leading-tight">
          <span className="font-semibold text-natural-olive">
            {isSwahili ? 'Dirisha la Uwasilishaji: ' : 'Target Delivery Window: '}
          </span>
          <span className="font-mono text-natural-text font-medium">{etaWindow}</span>
          <p className="text-[9px] text-natural-olive/60 mt-0.5">
            {isSwahili 
              ? 'Malipo yako ya M-Pesa yatabaki salama kwenye Escrow mpaka ukague mzigo unapoletwa.' 
              : 'Escrow vault holds funds until you physically verify bag count and quality on arrival.'}
          </p>
        </div>
      </div>
    </div>
  );
};
