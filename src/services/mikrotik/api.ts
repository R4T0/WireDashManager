
import { toast } from '@/components/ui/sonner';
import logger from '../loggerService';
import { createAuthHeader, getMockInterfaces, getMockPeers } from './utils';
import { MikrotikConfig, WireguardInterface, WireguardPeer } from './types';

/**
 * Mikrotik API Client
 */
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
      
      // For real API calls, we would use fetch like this:
      // const response = await fetch(`${this.baseUrl}${endpoint}`, {
      //   method,
      //   headers: this.headers,
      //   body: method !== 'GET' ? JSON.stringify(body) : undefined
      // });
      //
      // if (!response.ok) {
      //   throw new Error(`API request failed with status ${response.status}`);
      // }
      //
      // return await response.json();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate responses based on endpoint
      if (endpoint.includes('/interface/wireguard') && method === 'GET') {
        const mockData = getMockInterfaces();
        logger.info('Mock interfaces response:', mockData);
        return mockData as unknown as T;
      }
      
      if (endpoint.includes('/interface/wireguard/peers') && method === 'GET') {
        const mockData = getMockPeers();
        logger.info('Mock peers response:', mockData);
        return mockData as unknown as T;
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

  // WireGuard interface methods
  public async getInterfaces(): Promise<WireguardInterface[]> {
    return this.request<WireguardInterface[]>('/interface/wireguard', 'GET');
  }

  public async createInterface(interfaceData: any): Promise<WireguardInterface> {
    return this.request<WireguardInterface>('/interface/wireguard', 'PUT', interfaceData);
  }

  public async updateInterface(id: string, interfaceData: any): Promise<WireguardInterface> {
    return this.request<WireguardInterface>(`/interface/wireguard/${id}`, 'PATCH', interfaceData);
  }

  public async deleteInterface(id: string): Promise<void> {
    return this.request<void>(`/interface/wireguard/${id}`, 'DELETE');
  }

  // WireGuard peer methods
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

export default MikrotikApi;
