
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface PeerFormData {
  name: string;
  interface: string;
  allowedAddress: string;
  disabled: boolean;
}

interface PeerFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PeerFormData;
  interfaces: string[];
  isEditing: boolean;
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
}

const PeerForm = ({
  isOpen,
  onClose,
  formData,
  interfaces,
  isEditing,
  onChange,
  onSubmit,
}: PeerFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              onChange={(e) => onChange('name', e.target.value)}
              className="col-span-3 form-input"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interface" className="text-right">
              Interface
            </Label>
            <Select
              value={formData.interface}
              onValueChange={(value) => onChange('interface', value)}
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
              onChange={(e) => onChange('allowedAddress', e.target.value)}
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
                onCheckedChange={(checked) => onChange('disabled', checked)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} className="primary-button">
            {isEditing ? 'Salvar Alterações' : 'Criar Peer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PeerForm;
