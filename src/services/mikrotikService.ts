
/**
 * Mikrotik Service - Main entry point
 * 
 * This file re-exports all components from the refactored service for backward compatibility
 */

// Export types
export type {
  MikrotikConfig,
  WireguardInterface,
  WireguardPeer,
  NewPeerConfig,
  WireguardConfig
} from './mikrotik/types';

// Export utility functions
export {
  generateKeys,
  generateWireguardConfig
} from './mikrotik/utils';

// Export API class
import MikrotikApi from './mikrotik/api';
export default MikrotikApi;
