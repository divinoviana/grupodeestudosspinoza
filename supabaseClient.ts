
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://roakqjszitzncohzwdpo.supabase.co';
const supabaseKey = 'sb_publishable_hLFVCVTZm9rwz45ORYRzyw_jV3VD26M';

export const supabase = createClient(supabaseUrl, supabaseKey);
