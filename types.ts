
export interface Voucher {
  id: number;
  voucherNumber: number;
  to: string;
  serviceType: string;
  dateOfService: string;
  visitTime: string;
  tourNumber: string;
  numberOfTravelers: number;
  serviceDescription: string;
  guideName: string;
  createdAt: string;
}

export type ViewMode = 'dashboard' | 'create' | 'edit' | 'preview';

export interface AppState {
  vouchers: Voucher[];
  services: string[];
  suppliers: string[];
  nextVoucherNumber: number;
  // Session persistence fields
  lastView?: ViewMode;
  lastActiveVoucherId?: number | null;
}
