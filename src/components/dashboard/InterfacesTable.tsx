
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WireguardInterface } from '@/services/mikrotik/types';

interface InterfacesTableProps {
  interfaces: WireguardInterface[] | undefined;
  isLoading: boolean;
}

const InterfacesTable: React.FC<InterfacesTableProps> = ({ interfaces, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-sm text-wireguard-muted-foreground">Carregando interfaces...</div>
    );
  }

  if (!interfaces || interfaces.length === 0) {
    return (
      <div className="text-sm text-wireguard-muted-foreground">
        Nenhuma interface encontrada.
      </div>
    );
  }

  // Show up to 3 most recent interfaces
  const latestInterfaces = interfaces.slice(0, 3);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-medium">Nome</TableHead>
          <TableHead className="font-medium">Porta</TableHead>
          <TableHead className="font-medium">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {latestInterfaces.map((iface) => {
          const isDisabled = typeof iface.disabled === 'string' 
            ? iface.disabled === "true" 
            : Boolean(iface.disabled);
          
          const isRunning = typeof iface.running === 'string'
            ? iface.running === "true"
            : Boolean(iface.running);
          
          let statusText = "Desconhecido";
          let statusClass = "bg-gray-900/30 text-gray-400";
          
          if (isDisabled) {
            statusText = "Desativado";
            statusClass = "bg-red-900/30 text-red-400";
          } else if (isRunning) {
            statusText = "Rodando";
            statusClass = "bg-green-900/30 text-green-400";
          } else {
            statusText = "Parado";
            statusClass = "bg-yellow-900/30 text-yellow-400";
          }
          
          return (
            <TableRow key={iface.id}>
              <TableCell className="font-medium">{iface.name}</TableCell>
              <TableCell>{iface.listenPort || iface['listen-port'] || '-'}</TableCell>
              <TableCell>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs ${statusClass}`}>
                  {statusText}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default InterfacesTable;
