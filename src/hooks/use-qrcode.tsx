
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { WireguardPeer } from '@/services/mikrotik/types';
import logger from '@/services/loggerService';
import { usePeerSearch } from './qrcode/usePeerSearch';
import { useQRCodeGeneration } from './qrcode/useQRCodeGeneration';
import { useWireGuardDefaults } from './qrcode/useWireGuardDefaults';

interface UseQRCodeProps {
  isConnected: boolean;
  testConnection: () => Promise<boolean>;
  config: any;
}

export const useQRCode = ({ isConnected, testConnection, config }: UseQRCodeProps) => {
  const [loading, setLoading] = useState(true);
  
  const { defaults } = useWireGuardDefaults();
  
  const { 
    peers, 
    setPeers, 
    filteredPeers, 
    selectedPeer, 
    setSelectedPeer,
    searchQuery, 
    setSearchQuery, 
    handlePeerSelect: selectPeer 
  } = usePeerSearch();
  
  const { 
    qrCodeUrl, 
    configText, 
    setConfigText, 
    generateSampleConfig, 
    handleGenerateQRCode,
    handleDownloadQrCode,
    handleDownloadConfig 
  } = useQRCodeGeneration();

  useEffect(() => {
    if (isConnected) {
      logger.info("Connection is active, fetching peers");
      fetchPeers();
    } else {
      logger.info("Not connected to router, testing connection");
      testConnection().then(connected => {
        if (connected) {
          logger.info("Connection test successful, fetching peers");
          fetchPeers();
        } else {
          logger.warn("Connection test failed");
        }
      });
    }
  }, [isConnected]);

  const fetchPeers = async () => {
    setLoading(true);
    try {
      logger.info("Importing mikrotikService and fetching peers");
      const api = new (await import('@/services/mikrotikService')).default(config);
      logger.info("API initialized, getting peers");
      const peersData = await api.getPeers();
      logger.info(`Received ${peersData.length} peers from API`, peersData);
      setPeers(peersData);
    } catch (error) {
      logger.error('Failed to fetch peers:', error);
      toast.error('Falha ao carregar peers do roteador');
    } finally {
      setLoading(false);
    }
  };

  const handlePeerSelect = (peerId: string) => {
    const peer = selectPeer(peerId);
    if (peer) {
      // Generate a sample config
      const sampleConfig = generateSampleConfig(peer, defaults);
      setConfigText(sampleConfig);
      handleGenerateQRCode(sampleConfig);
    }
  };

  const downloadQrCode = () => {
    handleDownloadQrCode(qrCodeUrl, selectedPeer);
  };

  const downloadConfig = () => {
    handleDownloadConfig(configText, selectedPeer);
  };

  return {
    peers,
    filteredPeers,
    selectedPeer,
    searchQuery,
    qrCodeUrl,
    loading,
    configText,
    setSearchQuery,
    handlePeerSelect,
    handleDownloadQrCode: downloadQrCode,
    handleDownloadConfig: downloadConfig,
  };
};
