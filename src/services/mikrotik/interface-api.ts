
import { WireguardInterface } from './types';
import { MikrotikHttpClient } from './http-client';

/**
 * WireGuard Interface operations
 */
export class WireGuardInterfaceAPI {
  private client: MikrotikHttpClient;

  constructor(client: MikrotikHttpClient) {
    this.client = client;
  }

  async getInterfaces(): Promise<WireguardInterface[]> {
    return this.client.makeRequest<WireguardInterface[]>('/interface/wireguard', 'GET');
  }

  async createInterface(interfaceData: any): Promise<WireguardInterface> {
    return this.client.makeRequest<WireguardInterface>('/interface/wireguard', 'PUT', interfaceData);
  }

  async updateInterface(id: string, interfaceData: any): Promise<WireguardInterface> {
    return this.client.makeRequest<WireguardInterface>(`/interface/wireguard/${id}`, 'PATCH', interfaceData);
  }

  async deleteInterface(id: string): Promise<void> {
    return this.client.makeRequest<void>(`/interface/wireguard/${id}`, 'DELETE');
  }
}
