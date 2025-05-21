
import React from 'react';
import { useMikrotik } from '@/contexts/mikrotik';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PeerList from '@/components/peers/PeerList';
import PeerForm from '@/components/peers/PeerForm';
import { usePeerManagement } from '@/hooks/use-peer-management';
import NotConnected from '@/components/peers/NotConnected';

const Peers = () => {
  const { config, isConnected, testConnection } = useMikrotik();
  const {
    peers,
    interfaces,
    loading,
    openDialog,
    formData,
    isEditing,
    handleAdd,
    handleEdit,
    handleDelete,
    handleChange,
    handleSubmit,
    setOpenDialog
  } = usePeerManagement(config, isConnected, testConnection);

  if (!isConnected) {
    return <NotConnected onConnect={testConnection} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Peers</h1>
          <p className="text-wireguard-muted-foreground">
            Gerencie os peers WireGuard do seu roteador
          </p>
        </div>
        <Button onClick={handleAdd} className="primary-button">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Peer
        </Button>
      </div>

      <Card className="bg-wireguard-muted/50">
        <CardHeader>
          <CardTitle>Peers WireGuard</CardTitle>
        </CardHeader>
        <CardContent>
          <PeerList 
            peers={peers} 
            loading={loading} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        </CardContent>
      </Card>

      <PeerForm
        isOpen={openDialog}
        onClose={() => setOpenDialog(false)}
        formData={formData}
        interfaces={interfaces}
        isEditing={isEditing}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Peers;
