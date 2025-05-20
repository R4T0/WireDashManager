
import { useState, useEffect } from 'react';
import { WireguardPeer } from '@/services/mikrotik/types';
import logger from '@/services/loggerService';

export const usePeerSearch = () => {
  const [peers, setPeers] = useState<WireguardPeer[]>([]);
  const [filteredPeers, setFilteredPeers] = useState<WireguardPeer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<WireguardPeer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPeers(peers);
    } else {
      const filtered = peers.filter(peer =>
        peer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      logger.debug(`Filtered peers from ${peers.length} to ${filtered.length} with query: ${searchQuery}`);
      setFilteredPeers(filtered);
    }
  }, [searchQuery, peers]);

  const handlePeerSelect = (peerId: string) => {
    const peer = peers.find(p => p.id === peerId);
    if (peer) {
      logger.info(`Selected peer: ${peer.name} (${peer.interface})`, peer);
      setSelectedPeer(peer);
      return peer;
    }
    return null;
  };

  return {
    peers,
    setPeers,
    filteredPeers,
    selectedPeer,
    setSelectedPeer,
    searchQuery,
    setSearchQuery,
    handlePeerSelect,
  };
};
