
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
    const peer = peers.find(p => p['.id'] === peerId);
    if (peer) {
      logger.info(`Selected peer: ${peer.name}`);
      setSelectedPeer(peer);
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
