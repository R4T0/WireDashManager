
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WireguardPeer } from '@/services/mikrotik/types';

interface PeersTableProps {
  peers: WireguardPeer[] | undefined;
  isLoading: boolean;
}

const PeersTable: React.FC<PeersTableProps> = ({ peers, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-sm text-wireguard-muted-foreground">Carregando peers...</div>
    );
  }

  if (!peers || peers.length === 0) {
    return (
      <div className="text-sm text-wireguard-muted-foreground">
        Nenhum peer encontrado.
      </div>
    );
  }

  // Show up to 5 most recent peers
  const latestPeers = peers.slice(0, 5);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-medium">Nome</TableHead>
          <TableHead className="font-medium">Interface</TableHead>
          <TableHead className="font-medium">Status</TableHead>
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
              <TableCell className="font-medium">{peer.name}</TableCell>
              <TableCell>{peer.interface}</TableCell>
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

export default PeersTable;
