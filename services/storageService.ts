
import { AppState, Voucher } from '../types';
import { INITIAL_VOUCHER_NUMBER, DEFAULT_SERVICES, DEFAULT_SUPPLIERS, DEFAULT_GUIDES } from '../constants';
import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'rent_a_guide_full_state';

export const loadState = async (): Promise<AppState> => {
  // Try Cloud First
  if (supabase) {
    try {
      // Fetch vouchers
      const { data: vouchersData, error: vError } = await supabase
        .from('vouchers')
        .select('*')
        .order('voucherNumber', { ascending: false });

      // Fetch lists
      const { data: listsData, error: lError } = await supabase
        .from('app_lists')
        .select('*');

      // Fetch sequence config
      const { data: configData, error: cError } = await supabase
        .from('app_config')
        .select('*')
        .eq('key', 'next_voucher_number')
        .maybeSingle(); // maybeSingle doesn't throw if not found

      if (!vError && !lError) {
        return {
          vouchers: (vouchersData as Voucher[]) || [],
          services: listsData?.filter(i => i.type === 'service').map(i => i.name).sort() || DEFAULT_SERVICES,
          suppliers: listsData?.filter(i => i.type === 'supplier').map(i => i.name).sort() || DEFAULT_SUPPLIERS,
          guides: listsData?.filter(i => i.type === 'guide').map(i => i.name).sort() || DEFAULT_GUIDES,
          nextVoucherNumber: configData?.value || INITIAL_VOUCHER_NUMBER,
          lastView: 'dashboard',
          lastActiveVoucherId: null
        };
      }
    } catch (error) {
      console.warn("Supabase query failed. Ensure tables are created in Supabase SQL editor.", error);
    }
  }

  // Fallback to Local Storage
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local storage data", e);
    }
  }

  return {
    vouchers: [],
    services: DEFAULT_SERVICES,
    suppliers: DEFAULT_SUPPLIERS,
    guides: DEFAULT_GUIDES,
    nextVoucherNumber: INITIAL_VOUCHER_NUMBER,
    lastView: 'dashboard',
    lastActiveVoucherId: null
  };
};

const persistLocally = (state: AppState) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
};

export const saveVoucher = async (voucher: Voucher, currentState: AppState) => {
  if (supabase) {
    try {
      const { error } = await supabase.from('vouchers').upsert(voucher);
      if (error) throw error;
    } catch (e) {
      console.error("Cloud save failed", e);
    }
  }
  
  // Always update local for offline resilience
  const updatedVouchers = currentState.vouchers.some(v => v.id === voucher.id)
    ? currentState.vouchers.map(v => v.id === voucher.id ? voucher : v)
    : [voucher, ...currentState.vouchers];
  
  persistLocally({ ...currentState, vouchers: updatedVouchers });
};

export const deleteVoucherFromDb = async (id: number, currentState: AppState) => {
  if (supabase) {
    try {
      await supabase.from('vouchers').delete().eq('id', id);
    } catch (e) {
      console.error("Cloud delete failed", e);
    }
  }
  persistLocally({ ...currentState, vouchers: currentState.vouchers.filter(v => v.id !== id) });
};

export const updateListItem = async (type: 'service' | 'supplier' | 'guide', name: string, action: 'add' | 'delete' | 'update', currentState: AppState, oldName?: string) => {
  if (supabase) {
    try {
      if (action === 'add') await supabase.from('app_lists').insert({ type, name });
      else if (action === 'delete') await supabase.from('app_lists').delete().eq('type', type).eq('name', name);
      else if (action === 'update' && oldName) await supabase.from('app_lists').update({ name }).eq('type', type).eq('name', oldName);
    } catch (e) {
      console.error("Cloud list update failed", e);
    }
  }

  // Local Sync
  const listKey = type === 'guide' ? 'guides' : type === 'supplier' ? 'suppliers' : 'services';
  let newList = [...(currentState as any)[listKey]];
  if (action === 'add') newList = [...newList, name].sort();
  if (action === 'delete') newList = newList.filter(i => i !== name);
  if (action === 'update' && oldName) newList = newList.map(i => i === oldName ? name : i).sort();
  
  persistLocally({ ...currentState, [listKey]: newList });
};

export const updateNextVoucherNumber = async (num: number, currentState: AppState) => {
  if (supabase) {
    try {
      await supabase.from('app_config').upsert({ key: 'next_voucher_number', value: num });
    } catch (e) {
      console.error("Cloud config update failed", e);
    }
  }
  persistLocally({ ...currentState, nextVoucherNumber: num });
};

export const saveSessionState = (view: string, activeId: number | null) => {
  localStorage.setItem('rent_a_guide_session', JSON.stringify({ lastView: view, lastActiveVoucherId: activeId }));
};

export const loadSessionState = () => {
  const saved = localStorage.getItem('rent_a_guide_session');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};
