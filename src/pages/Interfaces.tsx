
import React, { useState, useEffect } from 'react';
import { useMikrotik } from '@/contexts/MikrotikContext';
import MikrotikApi, { WireguardInterface } from '@/services/mikrotikService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Network, Plus } from 'lucide-react';
import InterfaceList from '@/components/interfaces/InterfaceList';
import InterfaceFormDialog from '@/components/interfaces/InterfaceFormDialog';
import NotConnected from '@/components/interfaces/NotConnected';

const Interfaces = () => {
  const { config, isConnected, testConnection } = useMikrotik();
  const [interfaces, setInterfaces] = useState<WireguardInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterface, setSelectedInterface] = useState<WireguardInterface | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    listenPort: '',
    mtu: '1420',
    disabled: false
  });

  useEffect(() => {
    if (isConnected) {
      fetchInterfaces();
    } else {
      testConnection().then(success => {
        if (success) {
          fetchInterfaces();
        }
      });
    }
  }, [isConnected]);

  const fetchInterfaces = async () => {
    setLoading(true);
    try {
      const api = new MikrotikApi(config);
      const data = await api.getInterfaces();
      console.log('Interfaces loaded:', data);
      setInterfaces(data);
    } catch (error) {
      console.error('Failed to fetch interfaces:', error);
      toast.error('Falha ao carregar interfaces do roteador');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (iface: WireguardInterface) => {
    setSelectedInterface(iface);
    setFormData({
      name: iface.name,
      listenPort: iface.listenPort,
      mtu: iface.mtu,
      disabled: iface.disabled
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setSelectedInterface(null);
    setFormData({
      name: 'wg-new',
      listenPort: '51820',
      mtu: '1420',
      disabled: false
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta interface?')) {
      return;
    }
    
    try {
      const api = new MikrotikApi(config);
      await api.deleteInterface(id);
      toast.success('Interface excluída com sucesso');
      setInterfaces(prev => prev.filter(iface => iface.id !== id));
    } catch (error) {
      console.error('Failed to delete interface:', error);
      toast.error('Falha ao excluir interface');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const api = new MikrotikApi(config);
      
      if (isEditing && selectedInterface) {
        // Update existing interface
        const updatedInterface = await api.updateInterface(selectedInterface.id, formData);
        
        setInterfaces(prev => prev.map(iface => 
          iface.id === selectedInterface.id ? updatedInterface : iface
        ));
        
        toast.success('Interface atualizada com sucesso');
      } else {
        // Create new interface
        const newInterface = await api.createInterface(formData);
        
        setInterfaces(prev => [...prev, newInterface]);
        toast.success('Interface criada com sucesso');
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to save interface:', error);
      toast.error('Falha ao salvar interface');
    }
  };

  if (!isConnected) {
    return <NotConnected onConnect={testConnection} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Interfaces</h1>
          <p className="text-wireguard-muted-foreground">
            Gerencie as interfaces WireGuard do seu roteador
          </p>
        </div>
        <Button onClick={handleAdd} className="primary-button">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Interface
        </Button>
      </div>

      <Card className="bg-wireguard-muted/50 mb-6">
        <CardHeader>
          <CardTitle>Interfaces WireGuard</CardTitle>
        </CardHeader>
        <CardContent>
          <InterfaceList 
            interfaces={interfaces}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <InterfaceFormDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        selectedInterface={selectedInterface}
        isEditing={isEditing}
        formData={formData}
        onFormChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Interfaces;
