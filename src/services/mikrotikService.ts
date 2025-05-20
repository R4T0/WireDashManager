
import { toast } from '@/components/ui/sonner';
import logger from './loggerService';

// Types
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

// Utility to simulate backend auth header creation
const createAuthHeader = (username: string, password: string): string => {
  // In a real scenario, we would use btoa for Base64 encoding
  const authHeader = `Basic ${window.btoa(`${username}:${password}`)}`;
  logger.debug('Created auth header', { username });
  return authHeader;
};

// Base API class
class MikrotikApi {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: MikrotikConfig) {
    this.baseUrl = `${config.useHttps ? 'https' : 'http'}://${config.address}:${config.port}/rest`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': createAuthHeader(config.username, config.password),
      'User-Agent': 'wireguard-manager/1.0'
    };
    logger.info('MikrotikApi initialized', { baseUrl: this.baseUrl });
  }

  // Generic API methods
  private async request<T>(endpoint: string, method: string, body?: any): Promise<T> {
    try {
      logger.info(`Making ${method} request to ${this.baseUrl}${endpoint}`);
      logger.info('Headers:', this.headers);
      if (body) logger.info('Body:', body);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate responses based on endpoint
      if (endpoint.includes('/interface/wireguard') && method === 'GET') {
        const mockData = this.getMockInterfaces();
        logger.info('Mock interfaces response:', mockData);
        return this.getMockInterfaces() as unknown as T;
      }
      
      if (endpoint.includes('/interface/wireguard/peers') && method === 'GET') {
        const mockData = this.getMockPeers();
        logger.info('Mock peers response:', mockData);
        return this.getMockPeers() as unknown as T;
      }
      
      // For PUT/POST/PATCH requests, just return success
      if (['PUT', 'POST', 'PATCH'].includes(method)) {
        const response = { success: true, ...body };
        logger.info(`${method} response:`, response);
        return response as unknown as T;
      }
      
      // Default response
      const defaultResponse = { success: true };
      logger.info('Default response:', defaultResponse);
      return defaultResponse as unknown as T;
    } catch (error) {
      logger.error('API request failed:', error);
      toast.error('Falha na comunicação com o roteador');
      throw error;
    }
  }

  private getMockInterfaces(): WireguardInterface[] {
    return [
      {
        id: '1',
        name: 'wg-vpn1',
        listenPort: '51820',
        mtu: '1420',
        privateKey: '*****',
        publicKey: 'abcdefghijklmnopqrstuvwxyz123456789ABCDEF=',
        running: true,
        disabled: false
      },
      {
        id: '2',
        name: 'wg-office',
        listenPort: '51821',
        mtu: '1420',
        privateKey: '*****',
        publicKey: 'ABCDEF123456789abcdefghijklmnopqrstuvwxyz=',
        running: true,
        disabled: false
      }
    ];
  }

  private getMockPeers(): WireguardPeer[] {
    return [
      {
        id: '1',
        name: 'user-laptop',
        interface: 'wg-vpn1',
        allowedAddress: '10.0.0.2/32',
        endpoint: '0.0.0.0',
        endpointPort: '0',
        publicKey: 'xy12345abcdefghijklmnopqrstuvwxyz67890ABC=',
        disabled: false
      },
      {
        id: '2',
        name: 'user-phone',
        interface: 'wg-vpn1',
        allowedAddress: '10.0.0.3/32',
        endpoint: '0.0.0.0',
        endpointPort: '0',
        publicKey: '67890ABCxy12345abcdefghijklmnopqrstuvwxyz=',
        disabled: false
      }
    ];
  }

  // WireGuard specific methods
  public async getInterfaces(): Promise<WireguardInterface[]> {
    return this.request<WireguardInterface[]>('/interface/wireguard', 'GET');
  }

  public async getPeers(): Promise<WireguardPeer[]> {
    return this.request<WireguardPeer[]>('/interface/wireguard/peers', 'GET');
  }

  public async createPeer(peer: any): Promise<WireguardPeer> {
    return this.request<WireguardPeer>('/interface/wireguard/peers', 'PUT', peer);
  }

  public async updatePeer(id: string, peer: any): Promise<WireguardPeer> {
    return this.request<WireguardPeer>(`/interface/wireguard/peers/${id}`, 'PATCH', peer);
  }

  public async deletePeer(id: string): Promise<void> {
    return this.request<void>(`/interface/wireguard/peers/${id}`, 'DELETE');
  }
}

// Utility functions
export const generateKeys = async (): Promise<{privateKey: string, publicKey: string}> => {
  // In a real app, we would call a backend service for this
  // For simulation, we'll return mock keys
  logger.info('Generating WireGuard keypair');
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const keys = {
    privateKey: 'PRIVATE_KEY_' + Math.random().toString(36).substring(2, 10),
    publicKey: 'PUBLIC_KEY_' + Math.random().toString(36).substring(2, 10),
  };
  
  logger.info('Generated keypair', { publicKey: keys.publicKey });
  return keys;
};

export const generateWireguardConfig = (config: WireguardConfig): string => {
  logger.info('Generating WireGuard config', { config });
  return `[Interface]
PrivateKey = ${config.privateKey}
Address = ${config.address}
DNS = ${config.dns}

[Peer]
PublicKey = ${config.serverPublicKey}
AllowedIPs = ${config.allowedIps}
Endpoint = ${config.endpoint}:${config.endpointPort}
`;
};

export default MikrotikApi;
