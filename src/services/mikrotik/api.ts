
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
  private config: MikrotikConfig;

  constructor(config: MikrotikConfig) {
    this.config = config;
    this.baseUrl = `${config.useHttps ? 'https' : 'http'}://${config.address}${config.port ? `:${config.port}` : ''}/rest`;
    this.headers = {
      'Accept': '*/*',
      'Authorization': createAuthHeader(config.username, config.password),
      'Content-Type': 'application/json',
      'User-Agent': 'wireguard-manager/1.0'
    };
    logger.info('MikrotikApi initialized', { baseUrl: this.baseUrl });
  }

  // Generic API methods
  private async request<T>(endpoint: string, method: string, body?: any): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      logger.info(`Making ${method} request to ${url}`);
      logger.request(`API Request: ${method} ${url}`, {
        headers: { ...this.headers, 'Authorization': '[REDACTED]' },
        body: body ? JSON.stringify(body) : undefined
      });
      
      const response = await fetch(url, {
        method,
        mode: 'cors',
        credentials: 'omit',
        headers: this.headers,
        body: method !== 'GET' ? JSON.stringify(body) : undefined
      });
      
      if (!response.ok) {
        logger.error(`API request failed with status ${response.status}`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      logger.request(`API response:`, data);
      return data as T;
    } catch (error) {
      logger.error('API request failed:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('NetworkError') || 
          error instanceof DOMException && error.message.includes('CORS')) {
        toast.error('Erro de CORS: O servidor não permite requisições do navegador');
      } else if (error instanceof TypeError && error.message.includes('Mixed Content')) {
        toast.error('Erro de conteúdo misto: Tentando acessar HTTP a partir de HTTPS');
      } else {
        toast.error('Falha na comunicação com o roteador');
      }
      
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
