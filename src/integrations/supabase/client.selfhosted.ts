
// Cliente simplificado para modo self-hosted
// Este arquivo simula a interface do Supabase para manter compatibilidade

interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

interface QueryBuilder<T = any> {
  eq: (column: string, value: any) => QueryBuilder<T>;
  order: (column: string, options: any) => QueryBuilder<T>;
  limit: (count: number) => QueryBuilder<T>;
  single: () => Promise<SupabaseResponse<T>>;
  maybeSingle: () => Promise<SupabaseResponse<T>>;
  select: (columns?: string) => QueryBuilder<T>;
}

interface SelectQueryBuilder<T = any> extends Promise<SupabaseResponse<T[]>> {
  eq: (column: string, value: any) => QueryBuilder<T>;
  order: (column: string, options: any) => QueryBuilder<T>;
  limit: (count: number) => QueryBuilder<T>;
  single: () => Promise<SupabaseResponse<T>>;
  maybeSingle: () => Promise<SupabaseResponse<T>>;
}

interface InsertBuilder<T = any> {
  select: (columns?: string) => Promise<SupabaseResponse<T[]>>;
}

interface UpdateBuilder<T = any> {
  eq: (column: string, value: any) => Promise<SupabaseResponse<T[]>>;
}

interface DeleteBuilder {
  eq: (column: string, value: any) => Promise<SupabaseResponse<any>>;
}

interface TableBuilder {
  select: (columns?: string) => SelectQueryBuilder;
  insert: (data: any) => InsertBuilder;
  update: (data: any) => UpdateBuilder;
  delete: () => DeleteBuilder;
}

interface SelfHostedClient {
  from: (table: string) => TableBuilder;
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

  from(table: string): TableBuilder {
    const self = this;
    
    return {
      select: (columns = '*') => {
        const baseQuery = `/${table}?select=${columns}`;
        
        // Create the main promise
        const mainPromise = self.query('GET', baseQuery).then(data => ({
          data,
          error: null
        })) as SelectQueryBuilder;

        // Add query builder methods
        mainPromise.eq = (column: string, value: any) => {
          const query = `${baseQuery}&${column}=eq.${value}`;
          return {
            eq: (col: string, val: any) => mainPromise.eq(col, val),
            order: (col: string, opts: any) => mainPromise.order(col, opts),
            limit: (count: number) => mainPromise.limit(count),
            select: (cols?: string) => mainPromise.select(cols),
            single: async () => {
              const data = await self.query('GET', `${query}&limit=1`);
              return {
                data: data[0] || null,
                error: null
              };
            },
            maybeSingle: async () => {
              const data = await self.query('GET', `${query}&limit=1`);
              return {
                data: data[0] || null,
                error: null
              };
            }
          };
        };

        mainPromise.order = (column: string, options: any) => mainPromise;
        mainPromise.limit = (count: number) => mainPromise;
        mainPromise.single = async () => {
          const data = await self.query('GET', `${baseQuery}&limit=1`);
          return {
            data: data[0] || null,
            error: null
          };
        };
        mainPromise.maybeSingle = async () => {
          const data = await self.query('GET', `${baseQuery}&limit=1`);
          return {
            data: data[0] || null,
            error: null
          };
        };
        
        return mainPromise;
      },
      
      insert: (data: any): InsertBuilder => ({
        select: async (columns = '*') => {
          const result = await self.query('POST', `/${table}`, data);
          return {
            data: Array.isArray(result) ? result : [result],
            error: null
          };
        }
      }),
      
      update: (data: any): UpdateBuilder => ({
        eq: async (column: string, value: any) => {
          const result = await self.query('PATCH', `/${table}?${column}=eq.${value}`, data);
          return {
            data: Array.isArray(result) ? result : [result],
            error: null
          };
        }
      }),
      
      delete: (): DeleteBuilder => ({
        eq: async (column: string, value: any) => {
          await self.query('DELETE', `/${table}?${column}=eq.${value}`);
          return {
            data: null,
            error: null
          };
        }
      })
    };
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
