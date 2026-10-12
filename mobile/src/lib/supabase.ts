import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmbsllocbcimlqtomirk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtYnNsbG9jYmNpbWxxdG9taXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzc5NzksImV4cCI6MjEwNTc1Mzk3OX0.CTqWaZ9OQz-Sg5Pj0tQmvQY9LzlIo32iEzePtU3qbRo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
