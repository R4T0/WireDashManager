
import { WireguardPeer } from '@/services/mikrotik/types';

/**
 * Find the next available IP address in the network
 */
export const findNextAvailableIP = (peers: WireguardPeer[], baseNetwork: string = '10.10.0'): string => {
  // Extract used IPs from existing peers with same network
  const usedIPs = peers
    .map(peer => peer.allowedAddress)
    .filter(addr => addr.startsWith(baseNetwork))
    .map(addr => {
      const parts = addr.split('/');
      const ip = parts[0];
      return parseInt(ip.split('.').pop() || '0', 10);
    });

  // Find the next available number
  let nextNum = 2; // Start from .2 (typically .1 is for gateway)
  while (usedIPs.includes(nextNum)) {
    nextNum++;
  }

  return `${baseNetwork}.${nextNum}/32`;
};
