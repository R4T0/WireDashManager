
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import MikrotikApi, { WireguardPeer } from '@/services/mikrotikService';
import { MikrotikConfig } from '@/services/mikrotik/types';
import { generateKeys } from '@/services/mikrotik/utils';

export interface PeerFormData {
  name: string;
  interface: string;
  allowedAddress: string;
  endpoint: string;
  endpointPort: string;
  publicKey?: string;
  disabled: boolean;
}

export const usePeerManagement = (config: MikrotikConfig, isConnected: boolean, testConnection: () => Promise<boolean>) => {
  const [peers, setPeers] = useState<WireguardPeer[]>([]);
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeer, setSelectedPeer] = useState<WireguardPeer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PeerFormData>({
    name: '',
    interface: '',
    allowedAddress: '',
    endpoint: '',
    endpointPort: '51820',
    disabled: false
  });

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

  const handleEdit = (peer: WireguardPeer) => {
    setSelectedPeer(peer);
    setFormData({
      name: peer.name,
      interface: peer.interface,
      allowedAddress: peer.allowedAddress,
      endpoint: peer.endpoint || '',
      endpointPort: peer.endpointPort || '51820',
      publicKey: peer.publicKey,
      disabled: typeof peer.disabled === 'string' ? peer.disabled === 'true' : Boolean(peer.disabled)
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  // Function to find the next available IP address
  const findNextAvailableIP = (baseNetwork: string = '10.10.0'): string => {
    // Extract used IPs from existing peers with same network
    const usedIPs = peers
      .map(peer => peer.allowedAddress)
      .filter(addr => addr.startsWith(baseNetwork))
      .map(addr => {
        const parts = addr.split('/');
        const ip = parts[0];
        return parseInt(ip.split('.').pop() || '0', 10);
      });

    // Find the next available number
    let nextNum = 2; // Start from .2 (typically .1 is for gateway)
    while (usedIPs.includes(nextNum)) {
      nextNum++;
    }

    return `${baseNetwork}.${nextNum}/32`;
  };

  const handleAdd = () => {
    setSelectedPeer(null);
    
    // Get the default interface if available
    const defaultInterface = interfaces.length > 0 ? interfaces[0] : '';
    
    // Generate the next available IP
    const nextIP = findNextAvailableIP();
    
    setFormData({
      name: '',
      interface: defaultInterface,
      allowedAddress: nextIP,
      endpoint: '',
      endpointPort: '51820',
      disabled: false
    });
    
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este peer?')) {
      return;
    }
    
    try {
      const api = new MikrotikApi(config);
      await api.deletePeer(id);
      setPeers(prev => prev.filter(peer => peer.id !== id));
      toast.success('Peer excluído com sucesso');
    } catch (error) {
      console.error('Failed to delete peer:', error);
      toast.error('Falha ao excluir peer');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const api = new MikrotikApi(config);
      
      if (isEditing && selectedPeer) {
        // Preparar os dados para API no formato correto
        const peerData = {
          name: formData.name,
          interface: formData.interface,
          "allowed-address": formData.allowedAddress,
          "endpoint-address": formData.endpoint,
          "endpoint-port": formData.endpointPort,
          disabled: formData.disabled ? "true" : "false"
        };
        
        await api.updatePeer(selectedPeer.id, peerData);
        setPeers(prev => prev.map(peer => 
          peer.id === selectedPeer.id ? { 
            ...peer, 
            name: formData.name,
            interface: formData.interface,
            allowedAddress: formData.allowedAddress,
            endpoint: formData.endpoint,
            endpointPort: formData.endpointPort,
            disabled: formData.disabled
          } : peer
        ));
        toast.success('Peer atualizado com sucesso');
      } else {
        // Generate WireGuard keypair
        const keys = await generateKeys();
        console.log('Generated WireGuard keys:', keys);
        
        // Preparar os dados para API no formato exato do exemplo da imagem
        const peerData = {
          "interface": formData.interface,
          "public-key": keys.publicKey,
          "allowed-address": formData.allowedAddress,
          "endpoint-address": formData.endpoint || "",
          "endpoint-port": formData.endpointPort,
          "name": formData.name,
          "persistent-keepalive": "25",
          "disabled": formData.disabled ? "true" : "false"
        };
        
        console.log('Sending peer data to API:', peerData);
        const newPeer = await api.createPeer(peerData);
        console.log('API response for peer creation:', newPeer);
        
        setPeers(prev => [...prev, {
          ...newPeer,
          id: newPeer.id,
          name: formData.name,
          interface: formData.interface,
          allowedAddress: formData.allowedAddress,
          endpoint: formData.endpoint,
          endpointPort: formData.endpointPort,
          publicKey: keys.publicKey,
          disabled: formData.disabled
        } as WireguardPeer]);
        
        toast.success('Peer criado com sucesso');
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to save peer:', error);
      toast.error('Falha ao salvar peer');
    }
  };

  return {
    peers,
    interfaces,
    loading,
    selectedPeer,
    isEditing,
    openDialog,
    formData,
    fetchData,
    handleEdit,
    handleAdd,
    handleDelete,
    handleChange,
    handleSubmit,
    setOpenDialog
  };
};
