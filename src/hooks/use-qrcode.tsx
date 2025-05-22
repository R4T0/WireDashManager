
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { WireguardInterface } from '@/services/mikrotik/types';
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
  const [interfaces, setInterfaces] = useState<WireguardInterface[]>([]);
  
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
      logger.info("Connection is active, fetching peers and interfaces");
      fetchData();
    } else {
      logger.info("Not connected to router, testing connection");
      testConnection().then(connected => {
        if (connected) {
          logger.info("Connection test successful, fetching data");
          fetchData();
        } else {
          logger.warn("Connection test failed");
        }
      });
    }
  }, [isConnected]);

  const fetchData = async () => {
    setLoading(true);
    try {
      logger.info("Importing mikrotikService and fetching data");
      const api = new (await import('@/services/mikrotikService')).default(config);
      
      logger.info("API initialized, getting peers and interfaces");
      const [peersData, interfacesData] = await Promise.all([
        api.getPeers(),
        api.getInterfaces()
      ]);
      
      logger.info(`Received ${peersData.length} peers and ${interfacesData.length} interfaces from API`);
      setPeers(peersData);
      setInterfaces(interfacesData);
      
      // Log the interfaces data to verify we're getting the public keys
      logger.debug("Interfaces data:", interfacesData);
    } catch (error) {
      logger.error('Failed to fetch data:', error);
      toast.error('Falha ao carregar dados do roteador');
    } finally {
      setLoading(false);
    }
  };

  const handlePeerSelect = (peerId: string) => {
    const peer = selectPeer(peerId);
    if (peer) {
      logger.info(`Selected peer: ${peer.name}, interface: ${peer.interface}`);
      logger.debug(`Available interfaces:`, interfaces);
      
      // Find the interface to log its data
      const matchingInterface = interfaces.find(iface => iface.name === peer.interface);
      logger.debug(`Matching interface for peer:`, matchingInterface);
      
      // Generate config with actual interface data
      const sampleConfig = generateSampleConfig(peer, defaults, interfaces);
      logger.info(`Generated config for peer ${peer.name}`);
      logger.debug(`Config content:`, sampleConfig);
      
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
