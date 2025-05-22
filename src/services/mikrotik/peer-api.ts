
import { WireguardPeer } from './types';
import { MikrotikHttpClient } from './http-client';
import logger from '@/services/loggerService';

/**
 * WireGuard Peer operations
 */
export class WireGuardPeerAPI {
  private client: MikrotikHttpClient;

  constructor(client: MikrotikHttpClient) {
    this.client = client;
  }

  async getPeers(): Promise<WireguardPeer[]> {
    logger.debug('Fetching WireGuard peers');
    return this.client.makeRequest<WireguardPeer[]>('/interface/wireguard/peers', 'GET')
      .then(peers => this.mapPeerResponseToPeerObjects(peers));
  }

  // Mapeia as respostas da API para o formato utilizado pela aplicação
  private mapPeerResponseToPeerObjects(peers: any[]): WireguardPeer[] {
    return peers.map(peer => ({
      id: peer['.id'],
      name: peer.name,
      interface: peer.interface,
      allowedAddress: peer['allowed-address'],
      endpoint: peer['endpoint-address'],
      endpointPort: peer['endpoint-port'],
      publicKey: peer['public-key'],
      privateKey: peer['private-key'] || '', 
      disabled: peer.disabled,
      // Mapear quaisquer outros campos retornados pela API
      ...peer
    }));
  }

  async createPeer(peerData: any): Promise<WireguardPeer> {
    logger.info('Creating peer with data:', peerData);
    
    // Ensure all required fields are present
    const peerDataToSend = {
      ...peerData,
      "persistent-keepalive": peerData["persistent-keepalive"] || "25"
    };
    
    return this.client.makeRequest<any>('/interface/wireguard/peers', 'PUT', peerDataToSend)
      .then(response => {
        logger.debug('Peer created, API response:', response);
        const id = response['.id'] || String(Date.now());
        
        // Map created peer to application format
        return {
          id,
          name: peerData.name,
          interface: peerData.interface,
          allowedAddress: peerData['allowed-address'],
          endpoint: peerData['endpoint-address'],
          endpointPort: peerData['endpoint-port'],
          publicKey: peerData['public-key'],
          disabled: peerData.disabled,
          // Include any other relevant fields
          ...response
        };
      });
  }

  async updatePeer(id: string, peerData: any): Promise<WireguardPeer> {
    logger.info(`Updating peer ${id} with data:`, peerData);
    
    return this.client.makeRequest<any>(`/interface/wireguard/peers/${id}`, 'PATCH', peerData)
      .then(response => {
        logger.debug(`Peer ${id} updated, API response:`, response);
        
        // Map updated peer to application format
        return {
          id,
          name: peerData.name,
          interface: peerData.interface,
          allowedAddress: peerData['allowed-address'],
          endpoint: peerData['endpoint-address'],
          endpointPort: peerData['endpoint-port'],
          publicKey: peerData['public-key'],
          disabled: peerData.disabled,
          // Include any other relevant fields
          ...response
        } as WireguardPeer;
      });
  }

  async deletePeer(id: string): Promise<void> {
    logger.info(`Deleting peer ${id}`);
    return this.client.makeRequest<void>(`/interface/wireguard/peers/${id}`, 'DELETE');
  }
}
