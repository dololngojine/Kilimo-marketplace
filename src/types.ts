/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CropType = 'maize' | 'sorghum' | 'millet' | 'chili' | 'ginger' | 'beans' | 'wheat';
export type CropGrade = 'Grade 1' | 'Grade 2' | 'Grade 3';

export interface PriceHistoryEntry {
  price: number;
  changedAt: string;
  note?: string;
  previousPrice?: number;
}

export interface Listing {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: CropType;
  grade: CropGrade;
  quantity: number; // in bags or kg (we will standardize on 90kg bags and kgs for spice)
  unit: '90kg Bag' | 'kg';
  pricePerUnit: number; // in KES
  location: string; // e.g., Eldoret, Nakuru, Meru, Nyandarua
  imageUrl?: string;
  voiceUrl?: string; // mock voice note
  isOffline?: boolean;
  status: 'available' | 'sold';
  createdAt: string;
  priceHistory?: PriceHistoryEntry[];
  lastSyncedAt?: string;
}

export interface Order {
  id: string;
  listingId: string;
  crop: CropType;
  quantity: number;
  unit: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  farmerId: string;
  farmerName: string;
  totalAmount: number; // quantity * pricePerUnit + logistics
  escrowStatus: 'Pending' | 'Deposited' | 'Disbursed' | 'Refunded';
  paymentStatus: 'unpaid' | 'pending_payment' | 'paid';
  status: 'pending' | 'dispatched' | 'completed' | 'cancelled';
  isOffline?: boolean;
  createdAt: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: 'farmer' | 'buyer';
  dispatchedAt?: string;
  completedAt?: string;
  waybillNumber?: string;
  deliveryNotes?: string;
  location?: string;
}

export interface MarketPrice {
  id: string;
  crop: CropType;
  grade: CropGrade;
  avgPrice: number; // KES per unit
  unit: string;
  location: string;
  changePercent: number; // e.g., +2.4% or -1.2%
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'farmer' | 'buyer';
  location: string;
  locale: 'en' | 'sw';
  email?: string;
  pin?: string;
  farmName?: string;
  farmSizeAcres?: string;
  primaryCrops?: CropType[];
  cooperative?: string;
  businessName?: string;
  businessType?: string;
  kraPin?: string;
  monthlyDemandVolume?: string;
  payoutChannel?: string;
  mpesaNumber?: string;
  verified?: boolean;
  createdAt?: string;
}

export interface USSDSession {
  phoneNumber: string;
  step: 'welcome' | 'role_select' | 'farmer_menu' | 'buyer_menu' | 'list_crop' | 'list_quantity' | 'list_price' | 'list_location' | 'check_prices' | 'accept_order_id' | 'success';
  role?: 'farmer' | 'buyer';
  tempListing?: Partial<Listing>;
  tempOrderId?: string;
  locale: 'en' | 'sw';
}
