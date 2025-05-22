
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
      
      if (isEditing && selectedPeer) {
        success = await updatePeer(selectedPeer.id, formData);
      } else {
        success = await createPeer(formData);
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
