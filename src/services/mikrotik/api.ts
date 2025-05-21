
import { toast } from '@/components/ui/sonner';
import logger from '../loggerService';
import { createAuthHeader, getMockInterfaces, getMockPeers } from './utils';
import { MikrotikConfig, WireguardInterface, WireguardPeer } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Mikrotik API Client
 */
class MikrotikApi {
  private baseUrl: string;
  private headers: Record<string, string>;
  private config: MikrotikConfig;

  constructor(config: MikrotikConfig) {
    this.config = config;
    this.baseUrl = `${config.useHttps ? 'https' : 'http'}://${config.address}:${config.port}/rest`;
    this.headers = {
      'Accept': '*/*',
      'Authorization': createAuthHeader(config.username, config.password),
      'User-Agent': 'wireguard-manager/1.0'
    };
    logger.info('MikrotikApi initialized', { baseUrl: this.baseUrl });
  }

  // Generic API methods
  private async request<T>(endpoint: string, method: string, body?: any): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      logger.info(`Making ${method} request to ${url} via proxy`);
      logger.request(`API Request via proxy: ${method} ${url}`, {
        headers: { ...this.headers, 'Authorization': '[REDACTED]' },
        body: body ? JSON.stringify(body) : undefined
      });
      
      // Usar a edge function como proxy para evitar problemas de CORS e Mixed Content
      const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('mikrotik-proxy', {
        body: {
          url,
          method,
          headers: this.headers,
          body: method !== 'GET' ? body : undefined
        }
      });
      
      if (proxyError) {
        logger.error('Proxy request failed:', proxyError);
        throw new Error(`Proxy error: ${proxyError.message}`);
      }
      
      if (!proxyResponse) {
        throw new Error('No response from proxy');
      }
      
      if (proxyResponse.status >= 400) {
        throw new Error(`API request failed with status ${proxyResponse.status}`);
      }
      
      logger.request(`Proxy response:`, proxyResponse);
      return proxyResponse.body as T;
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
