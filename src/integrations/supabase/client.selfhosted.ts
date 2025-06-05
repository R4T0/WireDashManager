

// Cliente simplificado para modo self-hosted
// Este arquivo simula a interface do Supabase para manter compatibilidade

interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

// Simplified query builder without circular references
class SimpleSelectQueryBuilder {
  private baseQuery: string;
  private filters: string[] = [];
  private apiClient: SelfHostedSupabaseClient;

  constructor(baseQuery: string, apiClient: SelfHostedSupabaseClient) {
    this.baseQuery = baseQuery;
    this.apiClient = apiClient;
  }

  eq(column: string, value: any) {
    this.filters.push(`${column}=eq.${value}`);
    return this;
  }

  order(column: string, options: any) {
    const direction = options?.ascending === false ? 'desc' : 'asc';
    this.filters.push(`order=${column}.${direction}`);
    return this;
  }

  limit(count: number) {
    this.filters.push(`limit=${count}`);
    return this;
  }

  async single() {
    const query = this.filters.length > 0 ? `${this.baseQuery}&${this.filters.join('&')}` : this.baseQuery;
    try {
      const data = await this.apiClient.query('GET', `${query}&limit=1`);
      return {
        data: data[0] || null,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error
      };
    }
  }

  async maybeSingle() {
    const query = this.filters.length > 0 ? `${this.baseQuery}&${this.filters.join('&')}` : this.baseQuery;
    try {
      const data = await this.apiClient.query('GET', `${query}&limit=1`);
      return {
        data: data[0] || null,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error
      };
    }
  }
}

class SimpleInsertBuilder {
  private apiClient: SelfHostedSupabaseClient;
  private table: string;
  private data: any;

  constructor(table: string, data: any, apiClient: SelfHostedSupabaseClient) {
    this.table = table;
    this.data = data;
    this.apiClient = apiClient;
  }

  async select(columns = '*') {
    try {
      const result = await this.apiClient.query('POST', `/${this.table}`, this.data);
      return {
        data: Array.isArray(result) ? result : [result],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error
      };
    }
  }
}

class SimpleUpdateBuilder {
  private apiClient: SelfHostedSupabaseClient;
  private table: string;
  private data: any;

  constructor(table: string, data: any, apiClient: SelfHostedSupabaseClient) {
    this.table = table;
    this.data = data;
    this.apiClient = apiClient;
  }

  async eq(column: string, value: any) {
    try {
      const result = await this.apiClient.query('PATCH', `/${this.table}?${column}=eq.${value}`, this.data);
      return {
        data: Array.isArray(result) ? result : [result],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error
      };
    }
  }
}

class SimpleDeleteBuilder {
  private apiClient: SelfHostedSupabaseClient;
  private table: string;

  constructor(table: string, apiClient: SelfHostedSupabaseClient) {
    this.table = table;
    this.apiClient = apiClient;
  }

  async eq(column: string, value: any) {
    try {
      await this.apiClient.query('DELETE', `/${this.table}?${column}=eq.${value}`);
      return {
        data: null,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error
      };
    }
  }
}

class SimpleTableBuilder {
  private table: string;
  private apiClient: SelfHostedSupabaseClient;

  constructor(table: string, apiClient: SelfHostedSupabaseClient) {
    this.table = table;
    this.apiClient = apiClient;
  }

  select(columns = '*') {
    const baseQuery = `/${this.table}?select=${columns}`;
    return new SimpleSelectQueryBuilder(baseQuery, this.apiClient);
  }

  insert(data: any) {
    return new SimpleInsertBuilder(this.table, data, this.apiClient);
  }

  update(data: any) {
    return new SimpleUpdateBuilder(this.table, data, this.apiClient);
  }

  delete() {
    return new SimpleDeleteBuilder(this.table, this.apiClient);
  }
}

interface SelfHostedClient {
  from: (table: string) => SimpleTableBuilder;
  auth: {
    signUp: (credentials: any) => Promise<SupabaseResponse<any>>;
    signInWithPassword: (credentials: any) => Promise<SupabaseResponse<any>>;
    signOut: () => Promise<SupabaseResponse<any>>;
    getSession: () => Promise<SupabaseResponse<any>>;
    onAuthStateChange: (callback: any) => any;
  };
  functions: {
    invoke: (name: string, options: any) => Promise<SupabaseResponse<any>>;
  };
}

class SelfHostedSupabaseClient implements SelfHostedClient {
  private apiUrl = '/api';

  from(table: string): SimpleTableBuilder {
    return new SimpleTableBuilder(table, this);
  }

  auth = {
    signUp: async (credentials: { email: string; password: string }) => {
      try {
        const result = await this.query('POST', '/auth/signup', credentials);
        return {
          data: { user: result },
          error: null
        };
      } catch (error: any) {
        return {
          data: { user: null },
          error: { message: error.message }
        };
      }
    },
    
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      try {
        const result = await this.query('POST', '/auth/signin', credentials);
        return {
          data: { user: result },
          error: null
        };
      } catch (error: any) {
        return {
          data: { user: null },
          error: { message: error.message }
        };
      }
    },
    
    signOut: async () => {
      try {
        await this.query('POST', '/auth/signout');
        return {
          data: {},
          error: null
        };
      } catch (error: any) {
        return {
          data: {},
          error: { message: error.message }
        };
      }
    },
    
    getSession: async () => {
      try {
        const result = await this.query('GET', '/auth/session');
        return {
          data: { session: result },
          error: null
        };
      } catch (error: any) {
        return {
          data: { session: null },
          error: { message: error.message }
        };
      }
    },
    
    onAuthStateChange: (callback: any) => {
      // Implementação simplificada
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  functions = {
    invoke: async (name: string, options: any) => {
      try {
        const result = await this.query('POST', `/functions/${name}`, options.body);
        return {
          data: result,
          error: null
        };
      } catch (error: any) {
        return {
          data: null,
          error: { message: error.message }
        };
      }
    }
  };

  async query(method: string, endpoint: string, data?: any) {
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

