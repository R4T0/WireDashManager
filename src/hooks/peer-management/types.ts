
import { MikrotikConfig, WireguardInterface } from '@/services/mikrotik/types';

export interface PeerFormData {
  name: string;
  interface: string;
  allowedAddress: string;
  endpoint: string;
  endpointPort: string;
  publicKey?: string;
  persistentKeepalive?: string;
  disabled: boolean;
}

export interface UsePeerManagementProps {
  config: MikrotikConfig;
  isConnected: boolean;
  testConnection: () => Promise<boolean>;
}
