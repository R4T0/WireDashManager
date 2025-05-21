
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { url, method, headers, body } = await req.json();
    
    // Log the request
    console.log(`Proxying ${method} request to: ${url}`);
    
    // Create headers for the proxy request
    const proxyHeaders = {
      ...headers,
      // Remove any custom headers that might cause issues
      'Origin': undefined,
      'Referer': undefined,
    };
    
    // Make the request to the target
    const response = await fetch(url, {
      method: method,
      headers: proxyHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // Get the response data
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // Return the response with CORS headers
    return new Response(JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries())
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error("Proxy error:", error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Failed to proxy request'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
