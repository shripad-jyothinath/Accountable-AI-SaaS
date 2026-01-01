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
    // 1. Initialize Supabase Admin Client
    // We use the Service Role Key to bypass RLS for Admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Supabase configuration missing (URL or Service Role Key).");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 2. Parse Request
    const body = await req.json().catch(() => ({}));
    const { username, password, action = 'stats', taskId } = body;

    // 3. AUTHENTICATION CHECK
    // Allow access if:
    // A) Body contains correct ADMIN_USER/ADMIN_PASSWORD (Backdoor/Easter Egg)
    // B) OR Authorization header contains valid JWT for an Admin User
    
    let isAuthorized = false;

    // Check A: Secrets
    const adminUserSecret = Deno.env.get('ADMIN_USER');
    const adminPassSecret = Deno.env.get('ADMIN_PASSWORD');
    
    if (adminUserSecret && adminPassSecret && username === adminUserSecret && password === adminPassSecret) {
      isAuthorized = true;
    }

    // Check B: JWT
    if (!isAuthorized) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        
        if (user && !authError) {
          // Verify 'is_admin' flag in profiles
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
            
          if (profile?.is_admin) {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid credentials or permissions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 4. EXECUTE ACTIONS
    
    if (action === 'tasks') {
      // Fetch Tasks from the View
      const { data, error } = await supabaseAdmin
        .from('admin_task_overview')
        .select('*')
        .order('scheduled_at', { ascending: false });
        
      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } 
    else if (action === 'verify_task') {
      // Verify a specific task
      if (!taskId) throw new Error("Task ID is required for verification");

      const { data, error } = await supabaseAdmin
        .from('tasks')
        .update({ status: 'verified' })
        .eq('id', taskId)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } 
    else {
      // Default: Fetch Stats (action === 'stats')
      const { count: totalUsers, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;

      const { data: proUsers } = await supabaseAdmin.from('profiles').select('tier').eq('tier', 'PRO');
      const { data: basicUsers } = await supabaseAdmin.from('profiles').select('tier').eq('tier', 'BASIC');
      
      const mrr = ((proUsers?.length || 0) * 40) + ((basicUsers?.length || 0) * 20);

      const { data: recentSignups } = await supabaseAdmin
        .from('profiles')
        .select('email, tier, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const statsData = {
        totalUsers: totalUsers || 0,
        mrr: mrr,
        conversionRate: totalUsers ? Math.round(((proUsers?.length || 0) / totalUsers) * 100) : 0,
        recentSignups: recentSignups || []
      };

      return new Response(JSON.stringify(statsData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})