
import { createClient } from '@supabase/supabase-js';

// Supabase credentials provided by the user
const supabaseUrl = 'https://byzrvltvctsncxiluxyo.supabase.co';
// Updated with the new Publishable Key provided by the user
const supabaseAnonKey = 'sb_publishable_SPKC2OOjuNByBBgauqEMzA_Qr2pHRFK';

// Initialize the Supabase client
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.info("Supabase credentials not found. App is running in Local Storage mode.");
}
