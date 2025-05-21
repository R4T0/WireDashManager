
import logger from '../loggerService';

/**
 * Utility functions for Mikrotik API
 */

// Utility to create authentication header for API requests
export const createAuthHeader = (username: string, password: string): string => {
  // Format the auth header as shown in the image: Basic YWRtaW46TWljcm8uR2VyLjIwMDA=
  const authHeader = `Basic ${window.btoa(`${username}:${password}`)}`;
  logger.debug('Created auth header', { username });
  return authHeader;
};

// Generate WireGuard keypair
export const generateKeys = async (): Promise<{privateKey: string, publicKey: string}> => {
  // In a real app, we would call a backend service for this
  // For simulation, we'll return mock keys
  logger.info('Generating WireGuard keypair');
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const keys = {
    privateKey: 'PRIVATE_KEY_' + Math.random().toString(36).substring(2, 10),
    publicKey: 'PUBLIC_KEY_' + Math.random().toString(36).substring(2, 10),
  };
  
  logger.info('Generated keypair', { publicKey: keys.publicKey });
  return keys;
};

// Generate WireGuard configuration file content
export const generateWireguardConfig = (config: import('./types').WireguardConfig): string => {
  logger.info('Generating WireGuard config', { config });
  return `[Interface]
PrivateKey = ${config.privateKey}
Address = ${config.address}
DNS = ${config.dns}

[Peer]
PublicKey = ${config.serverPublicKey}
AllowedIPs = ${config.allowedIps}
Endpoint = ${config.endpoint}:${config.endpointPort}
`;
};

// Mock data generators for testing
export const getMockInterfaces = (): import('./types').WireguardInterface[] => {
  return [
    {
      id: '1',
      name: 'wg-vpn1',
      listenPort: '51820',
      mtu: '1420',
      privateKey: '*****',
      publicKey: 'abcdefghijklmnopqrstuvwxyz123456789ABCDEF=',
      running: true,
      disabled: false
    },
    {
      id: '2',
      name: 'wg-office',
      listenPort: '51821',
      mtu: '1420',
      privateKey: '*****',
      publicKey: 'ABCDEF123456789abcdefghijklmnopqrstuvwxyz=',
      running: true,
      disabled: false
    }
  ];
};

export const getMockPeers = (): import('./types').WireguardPeer[] => {
  return [
    {
      id: '1',
      name: 'user-laptop',
      interface: 'wg-vpn1',
      allowedAddress: '10.0.0.2/32',
      endpoint: '0.0.0.0',
      endpointPort: '0',
      publicKey: 'xy12345abcdefghijklmnopqrstuvwxyz67890ABC=',
      disabled: false
    },
    {
      id: '2',
      name: 'user-phone',
      interface: 'wg-vpn1',
      allowedAddress: '10.0.0.3/32',
      endpoint: '0.0.0.0',
      endpointPort: '0',
      publicKey: '67890ABCxy12345abcdefghijklmnopqrstuvwxyz=',
      disabled: false
    }
  ];
};
