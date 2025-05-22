
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMikrotik } from '@/contexts/mikrotik';
import MikrotikApi from '@/services/mikrotikService';
import { toast } from '@/components/ui/sonner';

interface SystemStats {
  interfaces: number;
  peers: number;
  activeConnections: number;
}

interface SystemData {
  version: string;
  uptime: string;
  model: string;
  cpu: string;
  memory: string;
}

export const useSystemStats = () => {
  const { isConfigured, isConnected, testConnection, config } = useMikrotik();
  const [stats, setStats] = useState<SystemStats>({
    interfaces: 0,
    peers: 0,
    activeConnections: 0,
  });

  // Fetch system info
  const { data: systemData, isLoading: systemLoading } = useQuery({
    queryKey: ['system-info'],
    queryFn: async () => {
      if (!isConnected || !config) return null;
      try {
        // This is a placeholder for actual system info fetching
        // In a real implementation, you would call an API endpoint that returns system information
        return {
          version: 'RouterOS 7.x',
          uptime: '10 days, 5 hours',
          model: 'MikroTik RouterBoard',
          cpu: '15%',
          memory: '30%'
        } as SystemData;
      } catch (error) {
        console.error('Error fetching system info:', error);
        return null;
      }
    },
    enabled: isConnected && isConfigured,
  });

  // Fetch interfaces data
  const { data: interfacesData, isLoading: interfacesLoading } = useQuery({
    queryKey: ['interfaces'],
    queryFn: async () => {
      if (!isConnected || !config) return [];
      try {
        const api = new MikrotikApi(config);
        return await api.getInterfaces();
      } catch (error) {
        console.error('Error fetching interfaces:', error);
        toast.error('Falha ao carregar interfaces');
        return [];
      }
    },
    enabled: isConnected && isConfigured,
  });

  // Fetch peers data
  const { data: peersData, isLoading: peersLoading } = useQuery({
    queryKey: ['peers'],
    queryFn: async () => {
      if (!isConnected || !config) return [];
      try {
        const api = new MikrotikApi(config);
        return await api.getPeers();
      } catch (error) {
        console.error('Error fetching peers:', error);
        toast.error('Falha ao carregar peers');
        return [];
      }
    },
    enabled: isConnected && isConfigured,
  });

  useEffect(() => {
    if (isConnected) {
      // Update stats with real data, properly handling boolean string values
      const activeInterfaces = interfacesData?.filter(iface => {
        // Handle both boolean and string representations of "running"
        const isRunning = typeof iface.running === 'string'
          ? iface.running === "true"
          : Boolean(iface.running);
        return isRunning;
      }).length || 0;
      
      const activePeers = peersData?.filter(peer => {
        // Handle both boolean and string representations of "disabled"
        const isDisabled = typeof peer.disabled === 'string'
          ? peer.disabled === "true"
          : Boolean(peer.disabled);
        return !isDisabled; // Count peers that are not disabled
      }).length || 0;
      
      setStats({
        interfaces: interfacesData?.length || 0,
        peers: peersData?.length || 0,
        activeConnections: activePeers,
      });
    }
  }, [isConnected, interfacesData, peersData]);

  // Connection check on component mount
  useEffect(() => {
    if (isConfigured && !isConnected) {
      testConnection();
    }
  }, [isConfigured, isConnected, testConnection]);

  return {
    isConfigured,
    isConnected,
    testConnection,
    config,
    stats,
    systemData,
    interfacesData,
    peersData,
    systemLoading,
    interfacesLoading,
    peersLoading
  };
};

export default useSystemStats;
