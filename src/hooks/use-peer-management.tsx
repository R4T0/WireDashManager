
import { UsePeerManagementProps } from './peer-management/types';
import { usePeerData } from './peer-management/usePeerData';
import { usePeerOperations } from './peer-management/usePeerOperations';

export type { PeerFormData } from './peer-management/types';

export const usePeerManagement = (config: UsePeerManagementProps['config'], isConnected: boolean, testConnection: () => Promise<boolean>) => {
  const { peers, setPeers, interfaces, loading, fetchData } = usePeerData({ 
    config, 
    isConnected, 
    testConnection 
  });

  const {
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
  } = usePeerOperations({
    config,
    isConnected,
    testConnection,
    peers,
    setPeers,
    interfaces
  });

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
