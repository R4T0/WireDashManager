
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import MikrotikApi from '@/services/mikrotikService';
import { WireguardPeer, WireguardInterface } from '@/services/mikrotik/types';
import { PeerFormData, UsePeerManagementProps } from './types';
import { findNextAvailableIP, validateIPFormat } from './peerUtils';
import { generateKeys } from '@/services/mikrotik/utils';
import { useWireGuardDefaults } from '@/hooks/qrcode/useWireGuardDefaults';
import logger from '@/services/loggerService';

export const usePeerOperations = ({ 
  config, 
  peers, 
  setPeers, 
  interfaces 
}: UsePeerManagementProps & {
  peers: WireguardPeer[];
  setPeers: React.Dispatch<React.SetStateAction<WireguardPeer[]>>;
  interfaces: WireguardInterface[];
}) => {
  const [selectedPeer, setSelectedPeer] = useState<WireguardPeer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { defaults } = useWireGuardDefaults();

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
    logger.info('Editing peer:', peer);
    setSelectedPeer(peer);
    
    // Garantir que todos os campos estejam corretamente preenchidos
    setFormData({
      name: peer.name,
      interface: peer.interface,
      allowedAddress: peer.allowedAddress || peer['allowed-address'] || '',
      endpoint: peer.endpoint || peer['endpoint-address'] || '',
      endpointPort: peer.endpointPort || peer['endpoint-port'] || '51820',
      publicKey: peer.publicKey || peer['public-key'] || '',
      disabled: typeof peer.disabled === 'string' ? peer.disabled === 'true' : Boolean(peer.disabled)
    });
    
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setSelectedPeer(null);
    
    // Get the default interface if available
    const defaultInterface = interfaces.length > 0 ? interfaces[0].name : '';
    
    // Extract network base from the default IP range
    // The format should be like "10.0.0.0/24"
    const ipRange = defaults.allowedIpRange || '10.0.0.0/24';
    
    // Extract the network part (first 3 octets)
    const ipParts = ipRange.split('/')[0].split('.');
    
    // Ensure we have at least 3 octets
    if (ipParts.length < 3) {
      toast.error('Formato do IP padrão inválido');
      return;
    }
    
    // Combine the first 3 octets to form the network base
    const baseNetwork = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
    logger.debug('Network base for new peer:', baseNetwork);
    
    // Generate the next available IP
    const nextIP = findNextAvailableIP(peers, baseNetwork);
    logger.debug('Generated IP for new peer:', nextIP);
    
    // Validate IP format
    if (!validateIPFormat(nextIP)) {
      toast.error('Erro ao gerar endereço IP. Usando formato padrão 10.0.0.2/32');
      // Use a fallback IP if generation fails
      setFormData({
        name: '',
        interface: defaultInterface,
        allowedAddress: '10.0.0.2/32',
        endpoint: defaults.endpoint || '',
        endpointPort: defaults.port || '51820',
        disabled: false
      });
    } else {
      // Use the generated IP
      setFormData({
        name: '',
        interface: defaultInterface,
        allowedAddress: nextIP,
        endpoint: defaults.endpoint || '',
        endpointPort: defaults.port || '51820',
        disabled: false
      });
    }
    
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
          "disabled": formData.disabled ? "true" : "false",
          // Manter a chave pública original
          "public-key": formData.publicKey || selectedPeer.publicKey || selectedPeer['public-key'] || ''
        };
        
        logger.info('Updating peer with data:', peerData);
        await api.updatePeer(selectedPeer.id, peerData);
        
        // Atualizar a lista de peers
        setPeers(prev => prev.map(peer => 
          peer.id === selectedPeer.id ? { 
            ...peer, 
            name: formData.name,
            interface: formData.interface,
            allowedAddress: formData.allowedAddress,
            endpoint: formData.endpoint,
            endpointPort: formData.endpointPort,
            publicKey: peerData["public-key"],
            disabled: formData.disabled
          } : peer
        ));
        
        toast.success('Peer atualizado com sucesso');
      } else {
        // Generate WireGuard keypair for new peer
        const keys = await generateKeys();
        logger.info('Generated WireGuard keys for new peer');
        
        // Preparar os dados para API no formato correto
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
        
        logger.info('Creating new peer with data:', peerData);
        const newPeer = await api.createPeer(peerData);
        
        // Adicionar o novo peer à lista
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
