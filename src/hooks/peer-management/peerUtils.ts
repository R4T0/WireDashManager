
import { WireguardPeer } from '@/services/mikrotik/types';

/**
 * Find the next available IP address in the network
 */
export const findNextAvailableIP = (peers: WireguardPeer[], baseNetwork: string = '10.10.0'): string => {
  // Extract the base network without the last octet
  const networkBase = baseNetwork.substring(0, baseNetwork.lastIndexOf('.') + 1);
  
  // Extract used IPs from existing peers with the same network
  const usedIPs = peers
    .map(peer => peer.allowedAddress)
    .filter(addr => addr && addr.startsWith(networkBase))
    .map(addr => {
      const parts = addr.split('/');
      const ip = parts[0];
      const lastOctetWithDot = ip.substring(ip.lastIndexOf('.') + 1);
      return parseInt(lastOctetWithDot, 10);
    });

  // Find the next available number
  let nextNum = 2; // Start from .2 (typically .1 is for gateway)
  while (usedIPs.includes(nextNum)) {
    nextNum++;
    
    // Safety check to prevent infinite loops
    if (nextNum > 254) {
      console.warn('IP range exhausted, recycling to 2');
      nextNum = 2;
      break;
    }
  }

  return `${networkBase}${nextNum}/32`;
};
