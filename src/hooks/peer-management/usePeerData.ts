
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import MikrotikApi from '@/services/mikrotikService';
import { WireguardPeer } from '@/services/mikrotik/types';
import { UsePeerManagementProps } from './types';

export const usePeerData = ({ config, isConnected, testConnection }: UsePeerManagementProps) => {
  const [peers, setPeers] = useState<WireguardPeer[]>([]);
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      fetchData();
    } else {
      testConnection();
    }
  }, [isConnected]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const api = new MikrotikApi(config);
      const [peersData, interfacesData] = await Promise.all([
        api.getPeers(),
        api.getInterfaces()
      ]);
      
      setPeers(peersData);
      setInterfaces(interfacesData.map(i => i.name));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Falha ao carregar dados do roteador');
    } finally {
      setLoading(false);
    }
  };

  return {
    peers,
    setPeers,
    interfaces,
    loading,
    fetchData
  };
};
