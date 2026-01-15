
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hgsipjamidvgmanarhts.supabase.co';
const supabaseKey = 'sb_publishable_a5chTfjTZg-RUhy1kXHYWQ_F1imjNjP';

export const supabase = createClient(supabaseUrl, supabaseKey);
