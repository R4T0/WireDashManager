
// Cliente simplificado para modo self-hosted
// Este arquivo simula a interface do Supabase para manter compatibilidade

interface SupabaseResponse<T> {
  data: T;
  error: any;
}

interface QueryBuilder {
  eq: (column: string, value: any) => QueryBuilder;
  order: (column: string, options: any) => QueryBuilder;
  limit: (count: number) => QueryBuilder;
  single: () => Promise<SupabaseResponse<any>>;
  maybeSingle: () => Promise<SupabaseResponse<any>>;
  select: (columns?: string) => QueryBuilder;
}

interface InsertBuilder {
  select: (columns?: string) => Promise<SupabaseResponse<any>>;
}

interface UpdateBuilder {
  eq: (column: string, value: any) => UpdateBuilder;
  select: (columns?: string) => Promise<SupabaseResponse<any>>;
}

interface DeleteBuilder {
  eq: (column: string, value: any) => Promise<SupabaseResponse<any>>;
}

interface SelfHostedClient {
  from: (table: string) => any;
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

  from(table: string) {
    const self = this;
    
    return {
      select: (columns = '*') => {
        const queryBuilder: QueryBuilder = {
          eq: (column: string, value: any) => {
            return {
              ...queryBuilder,
              single: () => self.query('GET', `/${table}?${column}=eq.${value}&select=${columns}&limit=1`).then(data => ({
                data: data[0] || null,
                error: null
              })),
              maybeSingle: () => self.query('GET', `/${table}?${column}=eq.${value}&select=${columns}&limit=1`).then(data => ({
                data: data[0] || null,
                error: null
              }))
            };
          },
          order: (column: string, options: any) => ({
            ...queryBuilder,
            eq: queryBuilder.eq
          }),
          limit: (count: number) => ({
            ...queryBuilder,
            eq: queryBuilder.eq
          }),
          single: () => self.query('GET', `/${table}?select=${columns}&limit=1`).then(data => ({
            data: data[0] || null,
            error: null
          })),
          maybeSingle: () => self.query('GET', `/${table}?select=${columns}&limit=1`).then(data => ({
            data: data[0] || null,
            error: null
          })),
          select: () => queryBuilder
        };
        
        // Return a promise that resolves to the data for direct usage
        const promise = self.query('GET', `/${table}?select=${columns}`).then(data => ({
          data,
          error: null
        }));
        
        // Attach query builder methods to the promise
        Object.assign(promise, queryBuilder);
        
        return promise as any;
      },
      
      insert: (data: any) => {
        const insertBuilder: InsertBuilder = {
          select: (columns = '*') => self.query('POST', `/${table}`, data).then(result => ({
            data: result,
            error: null
          }))
        };
        return insertBuilder;
      },
      
      update: (data: any) => {
        const updateBuilder: UpdateBuilder = {
          eq: (column: string, value: any) => ({
            select: (columns = '*') => self.query('PATCH', `/${table}?${column}=eq.${value}`, data).then(result => ({
              data: result,
              error: null
            }))
          })
        };
        return updateBuilder;
      },
      
      delete: () => {
        const deleteBuilder: DeleteBuilder = {
          eq: (column: string, value: any) => self.query('DELETE', `/${table}?${column}=eq.${value}`).then(() => ({
            data: null,
            error: null
          }))
        };
        return deleteBuilder;
      }
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
