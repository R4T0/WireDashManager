import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useWireGuardDefaults } from '@/hooks/qrcode/useWireGuardDefaults';
import logger from '@/services/loggerService';

interface PeerFormData {
  name: string;
  interface: string;
  allowedAddress: string;
  endpoint: string;
  endpointPort: string;
  publicKey?: string;
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
  const { defaults, loading } = useWireGuardDefaults();

  // Preencher endpoint e outros campos com valores padrão quando não estiver em modo de edição
  useEffect(() => {
    if (!isEditing) {
      // Set endpoint defaults if empty
      if (defaults.endpoint && !formData.endpoint) {
        onChange('endpoint', defaults.endpoint);
        onChange('endpointPort', defaults.port || '51820');
      }
      
      // Set IP address default format if empty
      if (defaults.allowedIpRange && (!formData.allowedAddress || formData.allowedAddress === '')) {
        logger.debug('Setting default allowed address from range:', defaults.allowedIpRange);
        
        // Extract network base from IP range
        const ipParts = defaults.allowedIpRange.split('/')[0].split('.');
        if (ipParts.length === 4) {
          const baseNetwork = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
          const nextOctet = "2"; // Um valor padrão seguro para começar
          onChange('allowedAddress', `${baseNetwork}.${nextOctet}/32`);
          logger.debug('Set default allowed address:', `${baseNetwork}.${nextOctet}/32`);
        }
      }
    }
  }, [defaults, isEditing, formData.endpoint, formData.allowedAddress, onChange]);

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
              placeholder="peer10"
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
              placeholder={`${defaults.allowedIpRange?.split('/')[0].replace(/\.\d+$/, '')}.X/32`}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endpoint" className="text-right">
              Endpoint
            </Label>
            <Input
              id="endpoint"
              value={formData.endpoint}
              onChange={(e) => onChange('endpoint', e.target.value)}
              placeholder={loading ? "Carregando..." : defaults.endpoint}
              className="col-span-2 form-input"
            />
            <Input
              id="endpointPort"
              value={formData.endpointPort}
              onChange={(e) => onChange('endpointPort', e.target.value)}
              placeholder={defaults.port || "51820"}
              className="form-input"
            />
          </div>

          {isEditing && formData.publicKey && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publicKey" className="text-right">
                Chave Pública
              </Label>
              <Input
                id="publicKey"
                value={formData.publicKey}
                readOnly
                className="col-span-3 form-input bg-wireguard-muted/50"
              />
            </div>
          )}

          {!isEditing && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Chave Pública
              </Label>
              <div className="col-span-3 text-sm text-muted-foreground">
                Será gerada automaticamente ao criar o peer
              </div>
            </div>
          )}

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
