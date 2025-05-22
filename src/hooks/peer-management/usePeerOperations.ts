
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import MikrotikApi from '@/services/mikrotikService';
import { WireguardPeer } from '@/services/mikrotik/types';
import { PeerFormData, UsePeerManagementProps } from './types';
import { findNextAvailableIP } from './peerUtils';
import { generateKeys } from '@/services/mikrotik/utils';

export const usePeerOperations = ({ 
  config, 
  peers, 
  setPeers, 
  interfaces 
}: UsePeerManagementProps & {
  peers: WireguardPeer[];
  setPeers: React.Dispatch<React.SetStateAction<WireguardPeer[]>>;
  interfaces: string[];
}) => {
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

  const handleAdd = () => {
    setSelectedPeer(null);
    
    // Get the default interface if available
    const defaultInterface = interfaces.length > 0 ? interfaces[0] : '';
    
    // Generate the next available IP
    const nextIP = findNextAvailableIP(peers);
    
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
    selectedPeer,
    isEditing,
    openDialog,
    formData,
    handleEdit,
    handleAdd,
    handleDelete,
    handleChange,
    handleSubmit,
    setOpenDialog
  };
};
