import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://zciesjpginurjsnpqhcs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_N_-AVo6UuXEJ0uEtaMh28Q_HJYCen-h";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
