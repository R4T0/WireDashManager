
import { MikrotikConfig } from './types';
import { MikrotikHttpClient } from './http-client';
import { WireGuardInterfaceAPI } from './interface-api';
import { WireGuardPeerAPI } from './peer-api';
import logger from '../loggerService';

/**
 * Mikrotik API Client
 */
class MikrotikApi {
  private client: MikrotikHttpClient;
  private interfaceApi: WireGuardInterfaceAPI;
  private peerApi: WireGuardPeerAPI;

  constructor(config: MikrotikConfig) {
    this.client = new MikrotikHttpClient(config);
    this.interfaceApi = new WireGuardInterfaceAPI(this.client);
    this.peerApi = new WireGuardPeerAPI(this.client);
    logger.info('MikrotikApi initialized');
  }

  // WireGuard interface methods
  public async getInterfaces() {
    return this.interfaceApi.getInterfaces();
  }

  public async createInterface(interfaceData: any) {
    return this.interfaceApi.createInterface(interfaceData);
  }

  public async updateInterface(id: string, interfaceData: any) {
    return this.interfaceApi.updateInterface(id, interfaceData);
  }

  public async deleteInterface(id: string) {
    return this.interfaceApi.deleteInterface(id);
  }

  // WireGuard peer methods
  public async getPeers() {
    return this.peerApi.getPeers();
  }

  public async createPeer(peerData: any) {
    return this.peerApi.createPeer(peerData);
  }

  public async updatePeer(id: string, peerData: any) {
    return this.peerApi.updatePeer(id, peerData);
  }

  public async deletePeer(id: string) {
    return this.peerApi.deletePeer(id);
  }

  // Test connection
  public async testRequest(endpoint: string, method: string, body?: any) {
    return this.client.testRequest(endpoint, method, body);
  }

  // Toggle proxy usage
  public setUseProxy(useProxy: boolean): void {
    this.client.setUseProxy(useProxy);
  }
}

export default MikrotikApi;
