
import React, { useState, useEffect } from 'react';
import { useMikrotik } from '@/contexts/mikrotik';
import MikrotikApi, { WireguardInterface } from '@/services/mikrotikService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Network, Plus } from 'lucide-react';
import InterfaceList from '@/components/interfaces/InterfaceList';
import InterfaceFormDialog from '@/components/interfaces/InterfaceFormDialog';
import NotConnected from '@/components/interfaces/NotConnected';
import { formatInterfaceData } from '@/services/mikrotik/utils';

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
      console.log('Interfaces carregadas (raw):', data);

      // Certifique-se de que os dados estão no formato correto
      const formattedData = data.map(item => {
        // Convert the string 'true' or 'false' to boolean values
        const disabled = typeof item.disabled === 'string' 
          ? item.disabled.toLowerCase() === 'true' 
          : Boolean(item.disabled);
          
        const running = typeof item.running === 'string'
          ? item.running.toLowerCase() === 'true'
          : Boolean(item.running);
          
        // Verifica se o objeto tem propriedades no formato kebab-case e converte para camelCase
        const iface: WireguardInterface = {
          id: item.id || item['.id'] || String(Math.random()),
          name: item.name,
          listenPort: item.listenPort || item['listen-port'] || '',
          mtu: item.mtu,
          privateKey: item.privateKey || item['private-key'] || '',
          publicKey: item.publicKey || item['public-key'] || '',
          running: running,
          disabled: disabled
        };
        return iface;
      });

      console.log('Interfaces formatadas:', formattedData);
      setInterfaces(formattedData);
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
      name: 'wireguard1',
      listenPort: '13231',
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
      // Use the correct endpoint with the ID parameter
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
        // Update existing interface - using the formatted data
        const formattedData = formatInterfaceData(formData);
        const updatedInterface = await api.updateInterface(selectedInterface.id, formattedData);
        
        setInterfaces(prev => prev.map(iface => 
          iface.id === selectedInterface.id ? updatedInterface : iface
        ));
        
        toast.success('Interface atualizada com sucesso');
      } else {
        // Create new interface - using the formatted data
        const formattedData = formatInterfaceData(formData);
        const newInterface = await api.createInterface(formattedData);
        
        setInterfaces(prev => [...prev, newInterface]);
        toast.success('Interface criada com sucesso');
      }
      
      setOpenDialog(false);
      // Refresh the interface list to get the updated running status
      fetchInterfaces();
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
