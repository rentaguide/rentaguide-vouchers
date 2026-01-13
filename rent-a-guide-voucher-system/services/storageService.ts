
import { AppState } from '../types';
import { INITIAL_VOUCHER_NUMBER, DEFAULT_SERVICES, DEFAULT_SUPPLIERS, STORAGE_KEY } from '../constants';

export const loadState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        suppliers: parsed.suppliers || DEFAULT_SUPPLIERS,
        services: parsed.services || DEFAULT_SERVICES,
        vouchers: parsed.vouchers || [],
        nextVoucherNumber: parsed.nextVoucherNumber || INITIAL_VOUCHER_NUMBER,
        lastView: parsed.lastView || 'dashboard',
        lastActiveVoucherId: parsed.lastActiveVoucherId || null
      };
    } catch (e) {
      console.error("Failed to parse storage", e);
    }
  }
  return {
    vouchers: [],
    services: DEFAULT_SERVICES,
    suppliers: DEFAULT_SUPPLIERS,
    nextVoucherNumber: INITIAL_VOUCHER_NUMBER,
    lastView: 'dashboard',
    lastActiveVoucherId: null
  };
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
