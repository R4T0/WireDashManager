
import React from 'react';
import { WireguardInterface } from '@/services/mikrotikService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface InterfaceFormData {
  name: string;
  listenPort: string;
  mtu: string;
  disabled: boolean;
}

interface InterfaceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInterface: WireguardInterface | null;
  isEditing: boolean;
  formData: InterfaceFormData;
  onFormChange: (field: string, value: any) => void;
  onSubmit: () => Promise<void>;
}

const InterfaceFormDialog: React.FC<InterfaceFormDialogProps> = ({
  open,
  onOpenChange,
  selectedInterface,
  isEditing,
  formData,
  onFormChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => onFormChange('name', e.target.value)}
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
              onChange={(e) => onFormChange('listenPort', e.target.value)}
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
              onChange={(e) => onFormChange('mtu', e.target.value)}
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
                onCheckedChange={(checked) => onFormChange('disabled', checked)}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} className="primary-button">
            {isEditing ? 'Salvar Alterações' : 'Criar Interface'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterfaceFormDialog;
