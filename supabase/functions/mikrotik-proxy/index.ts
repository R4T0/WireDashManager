
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, user-agent',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Parse the request body
    const requestData = await req.json();

    // Extract the Mikrotik router details from the request
    const { url, method, headers, body } = requestData;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Logging the request
    console.log(`Proxying request to: ${url}`);
    
    // Create fetch options
    const fetchOptions: RequestInit = {
      method: method || 'GET',
      headers: headers || {},
      body: body ? JSON.stringify(body) : undefined,
    };

    // Make the request to the Mikrotik router
    const response = await fetch(url, fetchOptions);
    
    // Get the response body
    let responseBody;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    // Return the response with CORS headers
    return new Response(JSON.stringify({ 
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    // Return error response with CORS headers
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
});
