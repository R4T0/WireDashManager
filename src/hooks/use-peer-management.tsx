
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import MikrotikApi, { WireguardPeer } from '@/services/mikrotikService';
import { MikrotikConfig } from '@/services/mikrotik/types';

export interface PeerFormData {
  name: string;
  interface: string;
  allowedAddress: string;
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
      disabled: peer.disabled
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setSelectedPeer(null);
    setFormData({
      name: '',
      interface: interfaces.length > 0 ? interfaces[0] : '',
      allowedAddress: '10.0.0.0/32',
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
        await api.updatePeer(selectedPeer.id, formData);
        setPeers(prev => prev.map(peer => 
          peer.id === selectedPeer.id ? { ...peer, ...formData } : peer
        ));
        toast.success('Peer atualizado com sucesso');
      } else {
        const newPeer = await api.createPeer(formData);
        setPeers(prev => [...prev, newPeer as WireguardPeer]);
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
