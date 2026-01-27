
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://byzrvltvctsncxiluxyo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5enJ2bHR2Y3RzbmN4aWx1eHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzM1MzcsImV4cCI6MjA4NTA0OTUzN30.K6W4C4idaHh8yOIcSjomY-UU_c93-Haew2isI5n8_9g'; 

// Initialize the Supabase client
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseAnonKey.startsWith('eyJ')) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.info("Supabase connection is waiting for a valid API key starting with 'eyJ'.");
}
