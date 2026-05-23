import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not found in environment. Falling back to local offline-only mode."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder-project-ref.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

// Helper to check if Supabase is fully configured
export const isSupabaseConfigured = () => {
  return (
    !!supabaseUrl &&
    supabaseUrl !== "https://placeholder-project-ref.supabase.co" &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== "placeholder-anon-key"
  );
};
