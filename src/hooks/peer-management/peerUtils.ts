
import { WireguardPeer } from '@/services/mikrotik/types';

/**
 * Find the next available IP address in the network
 */
export const findNextAvailableIP = (peers: WireguardPeer[], baseNetwork: string): string => {
  // Ensure baseNetwork is properly formatted (has all 3 octets)
  const networkParts = baseNetwork.split('.');
  if (networkParts.length !== 3) {
    console.error('Invalid base network format, expected 3 octets:', baseNetwork);
    // Default to a safe format
    return '10.0.0.2/32';
  }
  
  // Extract used IPs from existing peers with the same network
  const usedIPs = peers
    .map(peer => peer.allowedAddress || peer['allowed-address'])
    .filter(Boolean)
    .filter(addr => addr.startsWith(baseNetwork))
    .map(addr => {
      const parts = addr.split('/');
      const ip = parts[0];
      const lastOctet = ip.substring(ip.lastIndexOf('.') + 1);
      return parseInt(lastOctet, 10);
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

  // Return properly formatted IP with CIDR notation
  return `${baseNetwork}.${nextNum}/32`;
};

/**
 * Validates if an IP address has the correct format
 */
export const validateIPFormat = (ip: string): boolean => {
  // Check if the IP has all 4 octets before the CIDR notation
  const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/\d{1,2}$/;
  const match = ipPattern.test(ip);
  
  if (!match) {
    console.error('Invalid IP format:', ip);
  }
  
  return match;
};
