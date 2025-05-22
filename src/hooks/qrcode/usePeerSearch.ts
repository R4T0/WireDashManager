
import { useState } from 'react';
import { WireguardPeer } from '@/services/mikrotik/types';
import logger from '@/services/loggerService';

export const usePeerSearch = () => {
  const [peers, setPeers] = useState<WireguardPeer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<WireguardPeer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter peers based on search query
  const filteredPeers = peers.filter(peer => {
    if (!searchQuery || typeof searchQuery !== 'string') return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = peer.name?.toLowerCase().includes(query);
    const commentMatch = peer.comment?.toLowerCase().includes(query);
    
    return nameMatch || commentMatch;
  });

  const handlePeerSelect = (peerId: string) => {
    logger.info(`Selecting peer with ID: ${peerId}`);
    const peer = peers.find(p => p['.id'] === peerId);
    
    if (peer) {
      logger.info(`Found peer: ${peer.name}`);
      setSelectedPeer(peer);
    } else {
      logger.warn(`No peer found with ID: ${peerId}`);
    }
    
    return peer;
  };

  return {
    peers,
    setPeers,
    filteredPeers,
    selectedPeer,
    setSelectedPeer,
    searchQuery,
    setSearchQuery,
    handlePeerSelect
  };
};
