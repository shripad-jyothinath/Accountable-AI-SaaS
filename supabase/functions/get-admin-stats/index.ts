// Follow this setup guide to deploy: https://supabase.com/docs/guides/functions/deploy
// 1. supabase login
// 2. supabase functions new get-admin-stats
// 3. Paste this code
// 4. supabase functions deploy get-admin-stats
// 5. supabase secrets set ADMIN_USER=admin
// 6. supabase secrets set ADMIN_PASSWORD=secure_password
// Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are usually set automatically by Supabase.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Security Check: Verify Admin Credentials
    const { username, password } = await req.json().catch(() => ({}));
    const adminUserSecret = Deno.env.get('ADMIN_USER');
    const adminPassSecret = Deno.env.get('ADMIN_PASSWORD');

    // If secrets are not set in the environment, blocking access is safer.
    if (!adminUserSecret || !adminPassSecret) {
       console.error("Admin secrets not configured on server.");
       throw new Error("Server misconfiguration");
    }

    if (username !== adminUserSecret || password !== adminPassSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid credentials' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 2. Create a Supabase client with the SERVICE ROLE KEY
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Supabase configuration missing in Edge Function secrets.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 3. Fetch Aggregated Data
    
    // Total Users
    const { count: totalUsers, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (userError) throw userError

    // Calculate MRR (Simplified logic)
    const { data: proUsers } = await supabaseAdmin
      .from('profiles')
      .select('tier')
      .eq('tier', 'PRO')
    
    const { data: basicUsers } = await supabaseAdmin
      .from('profiles')
      .select('tier')
      .eq('tier', 'BASIC')

    const mrr = ((proUsers?.length || 0) * 40) + ((basicUsers?.length || 0) * 20)

    // Recent Signups (Last 5)
    const { data: recentSignups } = await supabaseAdmin
      .from('profiles')
      .select('email, tier, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // 4. Return Data
    const data = {
      totalUsers: totalUsers || 0,
      mrr: mrr,
      conversionRate: totalUsers ? Math.round(((proUsers?.length || 0) / totalUsers) * 100) : 0,
      recentSignups: recentSignups || []
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})