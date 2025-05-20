
import React, { useState, useEffect } from 'react';
import { useMikrotik } from '@/contexts/MikrotikContext';
import MikrotikApi, { WireguardPeer } from '@/services/mikrotikService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { DownloadCloud, Edit, Plus, QrCode, Trash } from 'lucide-react';

const Peers = () => {
  const { config, isConnected, testConnection } = useMikrotik();
  const [peers, setPeers] = useState<WireguardPeer[]>([]);
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeer, setSelectedPeer] = useState<WireguardPeer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    interface: '',
    allowedAddress: '',
    disabled: false
  });

  useEffect(() => {
    if (isConnected) {
      fetchData();
    } else {
      testConnection();
    }
  }, [isConnected]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const api = new MikrotikApi(config);
      const [peersData, interfacesData] = await Promise.all([
        api.getPeers(),
        api.getInterfaces()
      ]);
      
      setPeers(peersData);
      setInterfaces(interfacesData.map(i => i.name));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Falha ao carregar dados do roteador');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (peer: WireguardPeer) => {
    setSelectedPeer(peer);
    setFormData({
      name: peer.name,
      interface: peer.interface,
      allowedAddress: peer.allowedAddress,
      disabled: peer.disabled
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setSelectedPeer(null);
    setFormData({
      name: '',
      interface: interfaces.length > 0 ? interfaces[0] : '',
      allowedAddress: '10.0.0.0/32',
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
        await api.updatePeer(selectedPeer.id, formData);
        setPeers(prev => prev.map(peer => 
          peer.id === selectedPeer.id ? { ...peer, ...formData } : peer
        ));
        toast.success('Peer atualizado com sucesso');
      } else {
        const newPeer = await api.createPeer(formData);
        setPeers(prev => [...prev, newPeer as WireguardPeer]);
        toast.success('Peer criado com sucesso');
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to save peer:', error);
      toast.error('Falha ao salvar peer');
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
          {loading ? (
            <div className="text-center py-6">Carregando peers...</div>
          ) : peers.length === 0 ? (
            <div className="text-center py-6 text-wireguard-muted-foreground">
              Nenhum peer encontrado. Clique em "Adicionar Peer" para criar um novo.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Interface</TableHead>
                  <TableHead>Endereço Permitido</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peers.map((peer) => (
                  <TableRow key={peer.id}>
                    <TableCell className="font-medium">{peer.name}</TableCell>
                    <TableCell>{peer.interface}</TableCell>
                    <TableCell>{peer.allowedAddress}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${peer.disabled ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                        {peer.disabled ? 'Desativado' : 'Ativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(peer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <DownloadCloud className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(peer.id)}>
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

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-wireguard-muted/80 backdrop-blur-sm border border-wireguard-muted">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Peer' : 'Adicionar Peer'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Edite as informações do peer WireGuard.'
                : 'Preencha os dados para criar um novo peer WireGuard.'}
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
              <Label htmlFor="interface" className="text-right">
                Interface
              </Label>
              <Select 
                value={formData.interface} 
                onValueChange={(value) => handleChange('interface', value)}
              >
                <SelectTrigger className="col-span-3 form-input">
                  <SelectValue placeholder="Selecione uma interface" />
                </SelectTrigger>
                <SelectContent>
                  {interfaces.map((iface) => (
                    <SelectItem key={iface} value={iface}>
                      {iface}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="allowedAddress" className="text-right">
                Endereço Permitido
              </Label>
              <Input
                id="allowedAddress"
                value={formData.allowedAddress}
                onChange={(e) => handleChange('allowedAddress', e.target.value)}
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
              {isEditing ? 'Salvar Alterações' : 'Criar Peer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Peers;
