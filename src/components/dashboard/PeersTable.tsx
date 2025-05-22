
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WireguardPeer } from '@/services/mikrotik/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PeersTableProps {
  peers: WireguardPeer[] | undefined;
  isLoading: boolean;
  isMobile?: boolean;
}

const PeersTable: React.FC<PeersTableProps> = ({ peers, isLoading, isMobile }) => {
  if (isLoading) {
    return (
      <Card className="bg-wireguard-muted/50">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Peers Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs md:text-sm text-wireguard-muted-foreground">Carregando peers...</div>
        </CardContent>
      </Card>
    );
  }

  if (!peers || peers.length === 0) {
    return (
      <Card className="bg-wireguard-muted/50">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Peers Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs md:text-sm text-wireguard-muted-foreground">
            Nenhum peer encontrado.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show up to 5 most recent peers
  const latestPeers = peers.slice(0, isMobile ? 3 : 5);

  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-base md:text-lg">Peers Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-xs md:text-sm">Nome</TableHead>
                {!isMobile && <TableHead className="font-medium text-xs md:text-sm">Interface</TableHead>}
                <TableHead className="font-medium text-xs md:text-sm">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestPeers.map((peer) => {
                const isDisabled = typeof peer.disabled === 'string' 
                  ? peer.disabled === "true" 
                  : Boolean(peer.disabled);
                
                let statusText = isDisabled ? "Desativado" : "Ativo";
                let statusClass = isDisabled 
                  ? "bg-red-900/30 text-red-400" 
                  : "bg-green-900/30 text-green-400";
                
                return (
                  <TableRow key={peer.id}>
                    <TableCell className="font-medium text-xs md:text-sm p-2 md:p-4">{peer.name}</TableCell>
                    {!isMobile && <TableCell className="text-xs md:text-sm p-2 md:p-4">{peer.interface}</TableCell>}
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

export default PeersTable;
