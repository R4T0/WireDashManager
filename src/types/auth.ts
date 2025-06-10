
export interface SystemUser {
  id: string;
  email: string;
  isAdmin: boolean;
  created_at: string;
}

export interface AuthState {
  user: SystemUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
