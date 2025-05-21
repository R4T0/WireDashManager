
/**
 * Type definitions for Mikrotik API
 */

export interface MikrotikConfig {
  address: string;
  port: string;
  username: string;
  password: string;
  useHttps: boolean;
}

export interface WireguardInterface {
  id: string;
  name: string;
  listenPort: string;
  mtu: string;
  privateKey: string;
  publicKey: string;
  running: boolean;
  disabled: boolean;
}

export interface WireguardPeer {
  id: string;
  name: string;
  interface: string;
  allowedAddress: string;
  endpoint: string;
  endpointPort: string;
  publicKey: string;
  presharedKey?: string;
  disabled: boolean;
}

export interface NewPeerConfig {
  name: string;
  interface: string;
  endpoint: string;
  endpointPort: string;
  allowedAddress: string;
  clientDns: string;
  clientEndpoint: string;
}

export interface WireguardConfig {
  interface: string;
  privateKey: string;
  publicKey: string;
  address: string;
  dns: string;
  endpoint: string;
  endpointPort: string;
  allowedIps: string;
  serverPublicKey: string;
}

export interface MikrotikContextType {
  config: MikrotikConfig;
  updateConfig: (config: Partial<MikrotikConfig>) => void;
  saveConfig: () => Promise<void>;
  testConnection: (useProxy?: boolean) => Promise<boolean>;
  isConnected: boolean;
  isConfigured: boolean;
  configId: string | null;
}
