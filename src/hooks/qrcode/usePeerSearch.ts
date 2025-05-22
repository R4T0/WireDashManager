
import { useState } from 'react';
import { WireguardPeer } from '@/services/mikrotik/types';
import logger from '@/services/loggerService';

export const usePeerSearch = () => {
  const [peers, setPeers] = useState<WireguardPeer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<WireguardPeer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter peers based on search query
  const filteredPeers = searchQuery
    ? peers.filter(peer => 
        peer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        peer.comment?.toLowerCase().includes(searchQuery.toLowerCase()))
    : peers;

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
