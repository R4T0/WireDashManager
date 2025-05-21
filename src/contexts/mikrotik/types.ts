
export interface MikrotikConfig {
  address: string;
  port: string;
  username: string;
  password: string;
  useHttps: boolean;
}

export interface MikrotikContextType {
  config: MikrotikConfig;
  updateConfig: (newConfig: Partial<MikrotikConfig>) => void;
  saveConfig: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  isConfigured: boolean;
  isConnected: boolean;
  configId: string | null;
}
