
// Cliente simplificado para modo self-hosted
// Este arquivo simula a interface do Supabase para manter compatibilidade

interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

interface SelectQueryBuilder {
  eq: (column: string, value: any) => SelectQueryBuilder;
  order: (column: string, options: any) => SelectQueryBuilder;
  limit: (count: number) => SelectQueryBuilder;
  single: () => Promise<SupabaseResponse<any>>;
  maybeSingle: () => Promise<SupabaseResponse<any>>;
}

interface InsertBuilder {
  select: (columns?: string) => Promise<SupabaseResponse<any[]>>;
}

interface UpdateBuilder {
  eq: (column: string, value: any) => Promise<SupabaseResponse<any[]>>;
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
        let filters: string[] = [];
        
        const queryBuilder: SelectQueryBuilder = {
          eq: (column: string, value: any) => {
            filters.push(`${column}=eq.${value}`);
            return queryBuilder;
          },
          order: (column: string, options: any) => {
            const direction = options?.ascending === false ? 'desc' : 'asc';
            filters.push(`order=${column}.${direction}`);
            return queryBuilder;
          },
          limit: (count: number) => {
            filters.push(`limit=${count}`);
            return queryBuilder;
          },
          single: async () => {
            const query = filters.length > 0 ? `${baseQuery}&${filters.join('&')}` : baseQuery;
            try {
              const data = await self.query('GET', `${query}&limit=1`);
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
          },
          maybeSingle: async () => {
            const query = filters.length > 0 ? `${baseQuery}&${filters.join('&')}` : baseQuery;
            try {
              const data = await self.query('GET', `${query}&limit=1`);
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
        };
        
        return queryBuilder;
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
      
      update: (data: any): UpdateBuilder => ({
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
