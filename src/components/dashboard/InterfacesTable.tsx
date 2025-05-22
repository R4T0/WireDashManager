
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WireguardInterface } from '@/services/mikrotik/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InterfacesTableProps {
  interfaces: WireguardInterface[] | undefined;
  isLoading: boolean;
  isMobile?: boolean;
}

const InterfacesTable: React.FC<InterfacesTableProps> = ({ interfaces, isLoading, isMobile }) => {
  if (isLoading) {
    return (
      <Card className="bg-wireguard-muted/50">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Interfaces Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs md:text-sm text-wireguard-muted-foreground">Carregando interfaces...</div>
        </CardContent>
      </Card>
    );
  }

  if (!interfaces || interfaces.length === 0) {
    return (
      <Card className="bg-wireguard-muted/50">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Interfaces Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs md:text-sm text-wireguard-muted-foreground">
            Nenhuma interface encontrada.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show up to 3 most recent interfaces
  const latestInterfaces = interfaces.slice(0, 3);

  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-base md:text-lg">Interfaces Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-xs md:text-sm">Nome</TableHead>
                {!isMobile && <TableHead className="font-medium text-xs md:text-sm">Porta</TableHead>}
                <TableHead className="font-medium text-xs md:text-sm">Status</TableHead>
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
                    <TableCell className="font-medium text-xs md:text-sm p-2 md:p-4">{iface.name}</TableCell>
                    {!isMobile && <TableCell className="text-xs md:text-sm p-2 md:p-4">{iface.listenPort || iface['listen-port'] || '-'}</TableCell>}
                    <TableCell className="p-2 md:p-4">
                      <span className={`inline-flex px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs ${statusClass}`}>
                        {statusText}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterfacesTable;
