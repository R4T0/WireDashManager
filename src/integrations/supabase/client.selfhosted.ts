
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
  eq: (column: string, value: any) => SelectQueryBuilder<T>;
  order: (column: string, options: any) => SelectQueryBuilder<T>;
  limit: (count: number) => SelectQueryBuilder<T>;
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
        
        // Create the main promise that resolves to the expected format
        const promise = self.query('GET', baseQuery).then(data => ({
          data,
          error: null
        })) as SelectQueryBuilder;

        // Add chainable methods
        promise.eq = (column: string, value: any) => {
          const query = `${baseQuery}&${column}=eq.${value}`;
          const chainedPromise = self.query('GET', query).then(data => ({
            data,
            error: null
          })) as SelectQueryBuilder;
          
          // Copy all methods to the new promise
          chainedPromise.eq = promise.eq;
          chainedPromise.order = promise.order;
          chainedPromise.limit = promise.limit;
          chainedPromise.single = () => self.query('GET', `${query}&limit=1`).then(data => ({
            data: data[0] || null,
            error: null
          }));
          chainedPromise.maybeSingle = () => self.query('GET', `${query}&limit=1`).then(data => ({
            data: data[0] || null,
            error: null
          }));
          
          return chainedPromise;
        };

        promise.order = (column: string, options: any) => promise;
        promise.limit = (count: number) => promise;
        promise.single = () => self.query('GET', `${baseQuery}&limit=1`).then(data => ({
          data: data[0] || null,
          error: null
        }));
        promise.maybeSingle = () => self.query('GET', `${baseQuery}&limit=1`).then(data => ({
          data: data[0] || null,
          error: null
        }));
        
        return promise;
      },
      
      insert: (data: any): InsertBuilder => {
        return {
          select: async (columns = '*') => {
            try {
              const result = await self.query('POST', `/${table}`, data);
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
        };
      },
      
      update: (data: any) => ({
        eq: async (column: string, value: any) => {
          try {
            const result = await self.query('PATCH', `/${table}?${column}=eq.${value}`, data);
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
      }),
      
      delete: (): DeleteBuilder => ({
        eq: async (column: string, value: any) => {
          try {
            await self.query('DELETE', `/${table}?${column}=eq.${value}`);
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
