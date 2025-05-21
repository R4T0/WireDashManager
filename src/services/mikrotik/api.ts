
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
  private useProxy: boolean = true;

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

  // Generic API methods - private implementation
  private async makeRequestViaProxy<T>(endpoint: string, method: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    logger.info(`Using proxy for request to ${url}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-proxy', {
        body: {
          url,
          method,
          headers: { 
            ...this.headers, 
            'Authorization': createAuthHeader(this.config.username, this.config.password) 
          },
          body
        }
      });
      
      if (error) {
        logger.error('Proxy request failed:', error);
        throw new Error(`Proxy request failed: ${error.message || 'Unknown error'}`);
      }
      
      logger.request(`API proxy response:`, data);
      
      if (data.status >= 400) {
        throw new Error(`API request failed with status ${data.status}: ${data.statusText}`);
      }
      
      return data.data as T;
    } catch (error) {
      logger.error('Proxy request failed:', error);
      toast.error('Falha na comunicação com o proxy');
      throw error;
    }
  }

  private async makeRequestDirect<T>(endpoint: string, method: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    logger.request(`API Direct Request: ${method} ${url}`, {
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
  }

  // Public method to make requests with proper error handling
  public async makeRequest<T>(endpoint: string, method: string, body?: any): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      logger.info(`Making ${method} request to ${url}`);
      
      if (this.useProxy) {
        return this.makeRequestViaProxy<T>(endpoint, method, body);
      } else {
        return this.makeRequestDirect<T>(endpoint, method, body);
      }
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

  // Public method for testing purposes
  public async testRequest(endpoint: string, method: string, body?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    if (this.useProxy) {
      return this.makeRequestViaProxy(endpoint, method, body);
    } else {
      return this.makeRequestDirect(endpoint, method, body);
    }
  }

  // WireGuard interface methods
  public async getInterfaces(): Promise<WireguardInterface[]> {
    return this.makeRequest<WireguardInterface[]>('/interface/wireguard', 'GET');
  }

  public async createInterface(interfaceData: any): Promise<WireguardInterface> {
    return this.makeRequest<WireguardInterface>('/interface/wireguard', 'PUT', interfaceData);
  }

  public async updateInterface(id: string, interfaceData: any): Promise<WireguardInterface> {
    return this.makeRequest<WireguardInterface>(`/interface/wireguard/${id}`, 'PATCH', interfaceData);
  }

  public async deleteInterface(id: string): Promise<void> {
    // Use the specific ID in the endpoint to delete the interface
    // The format is /interface/wireguard/{id}
    return this.makeRequest<void>(`/interface/wireguard/${id}`, 'DELETE');
  }

  // WireGuard peer methods
  public async getPeers(): Promise<WireguardPeer[]> {
    return this.makeRequest<WireguardPeer[]>('/interface/wireguard/peers', 'GET');
  }

  public async createPeer(peer: any): Promise<WireguardPeer> {
    return this.makeRequest<WireguardPeer>('/interface/wireguard/peers', 'PUT', peer);
  }

  public async updatePeer(id: string, peer: any): Promise<WireguardPeer> {
    return this.makeRequest<WireguardPeer>(`/interface/wireguard/peers/${id}`, 'PATCH', peer);
  }

  public async deletePeer(id: string): Promise<void> {
    return this.makeRequest<void>(`/interface/wireguard/peers/${id}`, 'DELETE');
  }

  // Toggle proxy usage
  public setUseProxy(useProxy: boolean): void {
    this.useProxy = useProxy;
    logger.info(`Proxy mode ${useProxy ? 'enabled' : 'disabled'}`);
  }
}

export default MikrotikApi;
