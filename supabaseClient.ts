
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gazpzkcnyfmfnzhwarob.supabase.co';
const supabaseKey = 'sb_publishable_XQssUC8DYOjDUnM0BE1aFA__MU3SlZa';

export const supabase = createClient(supabaseUrl, supabaseKey);
