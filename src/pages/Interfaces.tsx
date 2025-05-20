
import React, { useState, useEffect } from 'react';
import { useMikrotik } from '@/contexts/MikrotikContext';
import MikrotikApi, { WireguardInterface } from '@/services/mikrotikService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Edit, Network, Plus, Trash } from 'lucide-react';
import LogViewer from '@/components/debug/LogViewer';

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
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">Não conectado ao roteador</h2>
        <p className="text-wireguard-muted-foreground mb-6">
          Por favor, configure a conexão com o roteador Mikrotik primeiro.
        </p>
        <Button onClick={() => testConnection()}>Conectar</Button>
      </div>
    );
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
          {loading ? (
            <div className="text-center py-6">Carregando interfaces...</div>
          ) : interfaces.length === 0 ? (
            <div className="text-center py-6 text-wireguard-muted-foreground">
              Nenhuma interface encontrada. Clique em "Adicionar Interface" para criar uma nova.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Porta</TableHead>
                  <TableHead>MTU</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interfaces.map((iface) => (
                  <TableRow key={iface.id}>
                    <TableCell className="font-medium">{iface.name}</TableCell>
                    <TableCell>{iface.listenPort}</TableCell>
                    <TableCell>{iface.mtu}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${iface.disabled ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                        {iface.disabled ? 'Desativado' : (iface.running ? 'Rodando' : 'Parado')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(iface)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(iface.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <LogViewer />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-wireguard-muted/80 backdrop-blur-sm border border-wireguard-muted">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Interface' : 'Adicionar Interface'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Edite as informações da interface WireGuard.'
                : 'Preencha os dados para criar uma nova interface WireGuard.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="col-span-3 form-input"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="listenPort" className="text-right">
                Porta
              </Label>
              <Input
                id="listenPort"
                value={formData.listenPort}
                onChange={(e) => handleChange('listenPort', e.target.value)}
                className="col-span-3 form-input"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mtu" className="text-right">
                MTU
              </Label>
              <Input
                id="mtu"
                value={formData.mtu}
                onChange={(e) => handleChange('mtu', e.target.value)}
                className="col-span-3 form-input"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="disabled" className="text-right">
                Desativado
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="disabled"
                  checked={formData.disabled}
                  onCheckedChange={(checked) => handleChange('disabled', checked)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="primary-button">
              {isEditing ? 'Salvar Alterações' : 'Criar Interface'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Interfaces;
