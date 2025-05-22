
import logger from '../loggerService';

/**
 * Utility functions for Mikrotik API
 */

// Utility to create authentication header for API requests
export const createAuthHeader = (username: string, password: string): string => {
  logger.info('DEBUG: Created auth header', { username });
  
  // Use the btoa function to create a Base64 encoded string for Basic Auth
  // Format: "Basic base64(username:password)"
  return 'Basic ' + btoa(`${username}:${password}`);
};

// Generate WireGuard keypair
export const generateKeys = async (): Promise<{privateKey: string, publicKey: string}> => {
  // In a real app, we would call a backend service for this
  // For simulation, we'll return mock keys that match the WireGuard format
  logger.info('Generating WireGuard keypair');
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate a fake but properly formatted WireGuard public key (base64 encoded, 32 bytes = 44 chars with padding)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let publicKey = '';
  for (let i = 0; i < 43; i++) {
    publicKey += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  publicKey += '='; // WireGuard keys typically end with = padding
  
  const privateKey = 'PRIVATE_KEY_' + Math.random().toString(36).substring(2, 10);
  
  const keys = {
    privateKey,
    publicKey,
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

// Format interface data for API request
export const formatInterfaceData = (formData: any): Record<string, string> => {
  // Convert the form data to match the Mikrotik API format as shown in the image
  return {
    name: formData.name,
    "listen-port": formData.listenPort,
    mtu: formData.mtu,
    disabled: formData.disabled ? "true" : "false"
  };
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
