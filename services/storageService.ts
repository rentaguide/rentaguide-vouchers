
import { AppState, Voucher } from '../types';
import { INITIAL_VOUCHER_NUMBER, DEFAULT_SERVICES, DEFAULT_SUPPLIERS, DEFAULT_GUIDES } from '../constants';
import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'rent_a_guide_full_state';

// --- COLUMN MAPPING HELPERS ---
// Postgres stores columns in lowercase (e.g., vouchernumber).
// Our App uses camelCase (e.g., voucherNumber).
// We must translate between them to avoid 400 errors.

const mapVoucherFromDb = (dbVoucher: any): Voucher => ({
  id: dbVoucher.id,
  voucherNumber: dbVoucher.vouchernumber,
  to: dbVoucher.to,
  serviceType: dbVoucher.servicetype,
  dateOfService: dbVoucher.dateofservice,
  visitTime: dbVoucher.visittime,
  tourNumber: dbVoucher.tournumber,
  numberOfTravelers: dbVoucher.numberoftravelers,
  serviceDescription: dbVoucher.servicedescription,
  guideName: dbVoucher.guidename,
  createdAt: dbVoucher.createdat || new Date().toISOString()
});

const mapVoucherToDb = (appVoucher: Voucher) => ({
  id: appVoucher.id,
  vouchernumber: appVoucher.voucherNumber,
  to: appVoucher.to,
  servicetype: appVoucher.serviceType,
  dateofservice: appVoucher.dateOfService,
  visittime: appVoucher.visitTime,
  tournumber: appVoucher.tourNumber,
  numberoftravelers: appVoucher.numberOfTravelers,
  servicedescription: appVoucher.serviceDescription,
  guidename: appVoucher.guideName,
  createdat: appVoucher.createdAt
});

export const loadState = async (): Promise<AppState> => {
  let cloudData: Partial<AppState> | null = null;
  let usedCloud = false;

  // 1. Try Loading from Cloud (Supabase)
  if (supabase) {
    try {
      // Fetch vouchers
      const { data: vouchersData, error: vError } = await supabase
        .from('vouchers')
        .select('*')
        .order('vouchernumber', { ascending: false }); // Note: order by DB column name

      if (vError) throw vError;

      // Fetch lists
      const { data: listsData, error: lError } = await supabase
        .from('app_lists')
        .select('*');
        
      if (lError) throw lError;

      // Fetch sequence config
      const { data: configData, error: cError } = await supabase
        .from('app_config')
        .select('*')
        .eq('key', 'next_voucher_number')
        .maybeSingle();

      // Map DB snake_case/lowercase to App camelCase
      const mappedVouchers = (vouchersData || []).map(mapVoucherFromDb);

      // If we got here, requests succeeded
      cloudData = {
        vouchers: mappedVouchers,
        services: listsData?.filter(i => i.type === 'service').map(i => i.name).sort() || DEFAULT_SERVICES,
        suppliers: listsData?.filter(i => i.type === 'supplier').map(i => i.name).sort() || DEFAULT_SUPPLIERS,
        guides: listsData?.filter(i => i.type === 'guide').map(i => i.name).sort() || DEFAULT_GUIDES,
        nextVoucherNumber: configData?.value || INITIAL_VOUCHER_NUMBER,
        lastView: 'dashboard',
        lastActiveVoucherId: null
      };
      usedCloud = true;
      console.log("Data loaded successfully from Supabase Cloud.");
    } catch (error) {
      console.warn("Supabase load failed (using local storage instead):", error);
      usedCloud = false;
    }
  }

  // 2. Load from Local Storage (Fallback or primary if cloud failed)
  const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
  let localData: AppState | null = null;
  
  if (localSaved) {
    try {
      localData = JSON.parse(localSaved);
    } catch (e) {
      console.error("Failed to parse local storage data", e);
    }
  }

  // 3. Decision Strategy
  if (usedCloud && cloudData) {
    return cloudData as AppState;
  }

  if (localData) {
    console.log("Data loaded from Local Storage.");
    return localData;
  }

  console.log("No data found. Initializing defaults.");
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
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Local storage save failed", e);
  }
};

export const saveVoucher = async (voucher: Voucher, currentState: AppState) => {
  // 1. Save to Cloud
  if (supabase) {
    try {
      // Convert to DB format (lowercase keys)
      const dbPayload = mapVoucherToDb(voucher);
      const { error } = await supabase.from('vouchers').upsert(dbPayload);
      if (error) {
        console.error("Cloud save error:", error);
      } else {
        console.log("Voucher saved to Cloud successfully");
      }
    } catch (e) {
      console.error("Cloud save exception:", e);
    }
  }
  
  // 2. Update Local State & Storage
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
