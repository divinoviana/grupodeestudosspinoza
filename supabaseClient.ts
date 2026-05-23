
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qqqkcfwxrncniiuihiyd.supabase.co';
const supabaseKey = 'sb_publishable_EFhGXOVCX7tKDJpewjm9bQ_Z6dNW3P1';

export const supabase = createClient(supabaseUrl, supabaseKey);
