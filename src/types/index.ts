export interface Market {
  id: string;
  name: string;
  phoneNumber: string;
  monthlyRent: number;
  address?: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  marketId: string;
  shopName: string;
  tenantName: string;
  phoneNumber: string;
  monthlyRent: number;
  paidRent: number;
  currentDue: number;
  dueDate: string;
  paymentStatus: 'Paid' | 'Due';
  shopType: 'Rented' | 'Leased';
  startDate: string;
  endDate: string;
  shopArea?: string;
  paymentDate?: string;
  remark?: string;
}

export interface Garage {
  id: string;
  garageNo: string;
  ownerName: string;
  mobileNumber: string;
  vehicleNumber: string;
  vehicleType: 'Car' | 'Bike' | 'Truck' | 'Other';
  monthlyRent: number;
  paidRent: number;
  paymentStatus: 'Paid' | 'Due';
  currentDue: number;
  leaseEndDate: string;
  dueDate: string;
  leaseType: 'Monthly' | 'Yearly' | 'Long-term';
  address?: string;
  startDate: string;
  paymentDate?: string;
  remark?: string;
}

export interface Payment {
  id: string;
  date: string;
  name: string;
  type: 'Shop' | 'Garage';
  amount: number;
  reference: string;
  remark?: string;
}

export interface BackupRecord {
  id: string;
  name: string;
  description: string;
  type: 'Full Backup' | 'Incremental';
  createdAt: string;
  size: string;
  createdBy: string;
  snapshot?: {
    markets: Market[];
    shops: Shop[];
    garages: Garage[];
    payments: Payment[];
  };
}

export type Page =
  | 'dashboard'
  | 'markets'
  | 'market-detail'
  | 'garages'
  | 'shops'
  | 'settings'
  | 'backup';
