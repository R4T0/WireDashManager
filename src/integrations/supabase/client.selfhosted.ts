
// Cliente simplificado para modo self-hosted
// Este arquivo simula a interface do Supabase para manter compatibilidade

interface SelfHostedClient {
  from: (table: string) => any;
  auth: {
    signUp: (credentials: any) => Promise<any>;
    signInWithPassword: (credentials: any) => Promise<any>;
    signOut: () => Promise<any>;
    getSession: () => Promise<any>;
    onAuthStateChange: (callback: any) => any;
  };
  functions: {
    invoke: (name: string, options: any) => Promise<any>;
  };
}

class SelfHostedSupabaseClient implements SelfHostedClient {
  private apiUrl = '/api';

  from(table: string) {
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => this.query('GET', `/${table}?${column}=eq.${value}&select=${columns}`),
        order: (column: string, options: any) => this.query('GET', `/${table}?select=${columns}&order=${column}.${options.ascending ? 'asc' : 'desc'}`),
        limit: (count: number) => this.query('GET', `/${table}?select=${columns}&limit=${count}`),
        single: () => this.query('GET', `/${table}?select=${columns}&limit=1`).then(data => data[0]),
        maybeSingle: () => this.query('GET', `/${table}?select=${columns}&limit=1`).then(data => data[0] || null),
      }),
      insert: (data: any) => ({
        select: () => this.query('POST', `/${table}`, data)
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => this.query('PATCH', `/${table}?${column}=eq.${value}`, data)
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => this.query('DELETE', `/${table}?${column}=eq.${value}`)
      })
    };
  }

  auth = {
    signUp: async (credentials: { email: string; password: string }) => {
      return this.query('POST', '/auth/signup', credentials);
    },
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      return this.query('POST', '/auth/signin', credentials);
    },
    signOut: async () => {
      return this.query('POST', '/auth/signout');
    },
    getSession: async () => {
      return this.query('GET', '/auth/session');
    },
    onAuthStateChange: (callback: any) => {
      // Implementação simplificada
      return { unsubscribe: () => {} };
    }
  };

  functions = {
    invoke: async (name: string, options: any) => {
      return this.query('POST', `/functions/${name}`, options.body);
    }
  };

  private async query(method: string, endpoint: string, data?: any) {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

export const supabase = new SelfHostedSupabaseClient();
