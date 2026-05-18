import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// إنشاء العميل البرمجي للاتصال بقاعدة البيانات
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
