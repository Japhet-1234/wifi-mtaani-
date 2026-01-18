
export interface WiFiPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  dataLimit: string;
  speed: string;
}

export type PaymentProvider = 'Manual Transfer';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Transaction {
  id: string;
  phone: string;
  packageId: string;
  amount: number;
  timestamp: string;
  status: 'pending_request' | 'completed';
  voucherCode?: string; // Track which code was sent
}

export interface RouterDevice {
  id: string;
  name: string;
  location: string;
  macAddress: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

export interface Voucher {
  code: string;
  packageId: string;
  isUsed: boolean;
  createdAt: string;
  usedAt?: string; // For tracing business records
  usedBy?: string; // Phone number or device ID
}

export type AppView = 'client' | 'admin-login' | 'admin-dashboard';
