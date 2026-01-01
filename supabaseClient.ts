import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'accountable_db_config';

// Helper to read from LocalStorage
const getStoredConfig = () => {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  } catch { return null; }
};

// 1. Hardcoded Configuration
// Updated with your provided Supabase URL and Key
const HARDCODED_URL = "https://yygvujdecirxjiaoywdr.supabase.co" as string;
const HARDCODED_KEY = "sb_publishable_03SJ6cVSMcFxvACi12vOrg_jMecBKGz" as string;

const stored = getStoredConfig();

// 2. Determine final config: Hardcoded takes precedence if set, otherwise LocalStorage
export const activeUrl = (HARDCODED_URL !== "URL") ? HARDCODED_URL : (stored?.url || "");
export const activeKey = (HARDCODED_KEY !== "ANON_KEY") ? HARDCODED_KEY : (stored?.key || "");

// 3. Initialize Client
// We only initialize if we have a valid URL and a Key that isn't the placeholder
const isValidKey = activeKey && activeKey !== "ANON_KEY";

export const supabase = (activeUrl && isValidKey)
  ? createClient(activeUrl, activeKey)
  : null;

export const isSupabaseConfigured = !!supabase;

// 4. Configuration Helpers
export const setupSupabase = (url: string, key: string) => {
  if (!url || !key) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, key }));
  window.location.reload(); // Reload to re-initialize the supabase const
};

export const disconnectSupabase = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};