
import React from 'react';
import { WireguardInterface } from '@/services/mikrotikService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InterfaceListProps {
  interfaces: WireguardInterface[];
  loading: boolean;
  onEdit: (iface: WireguardInterface) => void;
  onDelete: (id: string) => void;
}

const InterfaceList: React.FC<InterfaceListProps> = ({
  interfaces,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return <div className="text-center py-6">Carregando interfaces...</div>;
  }

  if (interfaces.length === 0) {
    return (
      <div className="text-center py-6 text-wireguard-muted-foreground">
        Nenhuma interface encontrada. Clique em "Adicionar Interface" para criar uma nova.
      </div>
    );
  }

  // Helper function to get status text and style based on the running parameter
  const getStatusInfo = (iface: WireguardInterface) => {
    // Check if disabled is true by converting to boolean properly
    const isDisabled = typeof iface.disabled === 'string' 
      ? iface.disabled === "true" 
      : Boolean(iface.disabled);
    
    // Check if running is true by converting to boolean properly
    const isRunning = typeof iface.running === 'string'
      ? iface.running === "true"
      : Boolean(iface.running);
    
    if (isDisabled) {
      return {
        text: 'Desativado',
        className: 'bg-red-900/30 text-red-400'
      };
    } else if (isRunning) {
      return {
        text: 'Rodando',
        className: 'bg-green-900/30 text-green-400'
      };
    } else {
      return {
        text: 'Parado',
        className: 'bg-yellow-900/30 text-yellow-400'
      };
    }
  };

  // Para debug - mostrar a estrutura dos dados recebidos
  console.log('Interfaces recebidas:', interfaces);

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Nome</TableHead>
            <TableHead className="font-medium">Porta</TableHead>
            <TableHead className="font-medium">MTU</TableHead>
            <TableHead className="font-medium">Chave Pública</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="text-right font-medium">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interfaces.map((iface) => {
            const statusInfo = getStatusInfo(iface);
            
            return (
              <TableRow key={iface.id}>
                <TableCell className="font-medium">{iface.name || '-'}</TableCell>
                <TableCell className="font-medium text-wireguard-primary">
                  {iface.listenPort || iface['listen-port'] || '-'}
                </TableCell>
                <TableCell className="font-medium">{iface.mtu || '-'}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="max-w-[200px] truncate cursor-pointer hover:text-wireguard-primary">
                        {iface.publicKey || iface['public-key'] || '-'}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-md bg-black text-white p-2 rounded">
                      <p className="break-all">{iface.publicKey || iface['public-key'] || '-'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(iface)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(iface.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
};

export default InterfaceList;
