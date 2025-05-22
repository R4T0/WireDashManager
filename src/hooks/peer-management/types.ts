
import { MikrotikConfig } from '@/services/mikrotik/types';

export interface PeerFormData {
  name: string;
  interface: string;
  allowedAddress: string;
  endpoint: string;
  endpointPort: string;
  publicKey?: string;
  disabled: boolean;
}

export interface UsePeerManagementProps {
  config: MikrotikConfig;
  isConnected: boolean;
  testConnection: () => Promise<boolean>;
}
