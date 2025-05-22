
import { useState } from 'react';
import { PeerFormData } from './types';
import { WireguardPeer, WireguardInterface } from '@/services/mikrotik/types';
import { findNextAvailableIP, validateIPFormat } from './peerUtils';
import { useWireGuardDefaults } from '@/hooks/qrcode/useWireGuardDefaults';
import logger from '@/services/loggerService';

export const usePeerForm = (peers: WireguardPeer[], interfaces: WireguardInterface[]) => {
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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const prepareFormForEditing = (peer: WireguardPeer) => {
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

  const prepareFormForAdding = () => {
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
      return {
        success: false,
        message: 'Formato do IP padrão inválido'
      };
    }
    
    // Combine the first 3 octets to form the network base
    const baseNetwork = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
    logger.debug('Network base for new peer:', baseNetwork);
    
    // Generate the next available IP
    const nextIP = findNextAvailableIP(peers, baseNetwork);
    logger.debug('Generated IP for new peer:', nextIP);
    
    // Validate IP format
    if (!validateIPFormat(nextIP)) {
      // Use a fallback IP if generation fails
      setFormData({
        name: '',
        interface: defaultInterface,
        allowedAddress: '10.0.0.2/32',
        endpoint: defaults.endpoint || '',
        endpointPort: defaults.port || '51820',
        disabled: false
      });
      
      return {
        success: false,
        message: 'Erro ao gerar endereço IP. Usando formato padrão 10.0.0.2/32'
      };
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
      
      return { success: true };
    }
  };

  const resetForm = () => {
    setSelectedPeer(null);
    setIsEditing(false);
    setFormData({
      name: '',
      interface: '',
      allowedAddress: '',
      endpoint: '',
      endpointPort: '51820',
      disabled: false
    });
  };

  return {
    selectedPeer,
    isEditing,
    openDialog,
    formData,
    handleChange,
    prepareFormForEditing,
    prepareFormForAdding,
    resetForm,
    setOpenDialog,
    setIsEditing
  };
};
