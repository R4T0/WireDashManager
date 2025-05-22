
import { WireguardPeer } from './types';
import { MikrotikHttpClient } from './http-client';

/**
 * WireGuard Peer operations
 */
export class WireGuardPeerAPI {
  private client: MikrotikHttpClient;

  constructor(client: MikrotikHttpClient) {
    this.client = client;
  }

  async getPeers(): Promise<WireguardPeer[]> {
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
      privateKey: peer['private-key'] || '', // Map the private key when available
      disabled: peer.disabled,
    }));
  }

  async createPeer(peerData: any): Promise<WireguardPeer> {
    console.log('Creating peer with data:', peerData);
    // Make sure endpoint is set to exactly match the expected format from the image example
    const peerDataToSend = {
      ...peerData,
      // Add any missing required fields from the example that might not be set
      "persistent-keepalive": peerData["persistent-keepalive"] || "25"
    };
    
    // The URL should match exactly /rest/interface/wireguard/peers/add from the image
    return this.client.makeRequest<any>('/interface/wireguard/peers', 'PUT', peerDataToSend)
      .then(response => {
        console.log('Peer created, API response:', response);
        const id = response['.id'] || String(Date.now());
        return {
          id,
          name: peerData.name,
          interface: peerData.interface,
          allowedAddress: peerData['allowed-address'],
          endpoint: peerData['endpoint-address'],
          endpointPort: peerData['endpoint-port'],
          publicKey: peerData['public-key'],
          disabled: peerData.disabled,
        };
      });
  }

  async updatePeer(id: string, peerData: any): Promise<WireguardPeer> {
    return this.client.makeRequest<any>(`/interface/wireguard/peers/${id}`, 'PUT', peerData)
      .then(() => ({
        id,
        name: peerData.name,
        interface: peerData.interface,
        allowedAddress: peerData['allowed-address'],
        endpoint: peerData['endpoint-address'],
        endpointPort: peerData['endpoint-port'],
        disabled: peerData.disabled,
      } as WireguardPeer));
  }

  async deletePeer(id: string): Promise<void> {
    return this.client.makeRequest<void>(`/interface/wireguard/peers/${id}`, 'DELETE');
  }
}
