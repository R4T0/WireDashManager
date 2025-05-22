
import { WireguardPeer } from '@/services/mikrotik/types';
import { UsePeerManagementProps } from './types';
import { usePeerForm } from './usePeerForm';
import { usePeerCrud } from './usePeerCrud';
import logger from '@/services/loggerService';

export const usePeerOperations = ({ 
  config, 
  peers, 
  setPeers, 
  interfaces 
}: UsePeerManagementProps & {
  peers: WireguardPeer[];
  setPeers: React.Dispatch<React.SetStateAction<WireguardPeer[]>>;
  interfaces: any[];
}) => {
  const {
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
  } = usePeerForm(peers, interfaces);

  const { createPeer, updatePeer, deletePeer } = usePeerCrud(config, setPeers);

  const handleEdit = (peer: WireguardPeer) => {
    prepareFormForEditing(peer);
  };

  const handleAdd = () => {
    const result = prepareFormForAdding();
    
    if (!result.success && result.message) {
      logger.warn(result.message);
    }
    
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    await deletePeer(id);
  };

  const handleSubmit = async () => {
    try {
      let success = false;
      
      // Converter dados do formulário conforme necessário
      const peerData = {
        ...formData,
        "public-key": formData.publicKey,
        "allowed-address": formData.allowedAddress,
        "endpoint-address": formData.endpoint || "",
        "endpoint-port": formData.endpointPort ? parseInt(formData.endpointPort) : 0,
        "persistent-keepalive": formData.persistentKeepalive ? parseInt(formData.persistentKeepalive) : 25,
        disabled: formData.disabled ? "true" : "false"
      };
      
      if (isEditing && selectedPeer) {
        success = await updatePeer(selectedPeer.id, peerData);
      } else {
        success = await createPeer(peerData);
      }
      
      if (success) {
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Failed to save peer:', error);
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
