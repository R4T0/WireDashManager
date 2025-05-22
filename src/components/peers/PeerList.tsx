
import React from 'react';
import { WireguardPeer } from '@/services/mikrotikService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, QrCode, DownloadCloud, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PeerListProps {
  peers: WireguardPeer[];
  loading: boolean;
  onEdit: (peer: WireguardPeer) => void;
  onDelete: (id: string) => void;
}

const PeerList = ({ peers, loading, onEdit, onDelete }: PeerListProps) => {
  const navigate = useNavigate();

  const handleQrCodeClick = (peer: WireguardPeer) => {
    // Navigate to QRCode page with peer ID
    navigate(`/qrcode?peerId=${peer['.id']}`);
  };

  if (loading) {
    return <div className="text-center py-6">Carregando peers...</div>;
  }

  if (peers.length === 0) {
    return (
      <div className="text-center py-6 text-wireguard-muted-foreground">
        Nenhum peer encontrado. Clique em "Adicionar Peer" para criar um novo.
      </div>
    );
  }

  // Helper function to get status text and style based on disabled parameter
  const getStatusInfo = (peer: WireguardPeer) => {
    // Check if disabled is true by converting to boolean properly
    const isDisabled = typeof peer.disabled === 'string' 
      ? peer.disabled === "true" 
      : Boolean(peer.disabled);

    if (isDisabled) {
      return {
        text: 'Desativado',
        className: 'bg-red-900/30 text-red-400'
      };
    } else {
      return {
        text: 'Ativo',
        className: 'bg-green-900/30 text-green-400'
      };
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Interface</TableHead>
          <TableHead>Allowed Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {peers.map((peer) => {
          const statusInfo = getStatusInfo(peer);
          
          return (
            <TableRow key={peer.id}>
              <TableCell className="font-medium">{peer.name}</TableCell>
              <TableCell>{peer.interface}</TableCell>
              <TableCell>{peer.allowedAddress}</TableCell>
              <TableCell>
                <span 
                  className={`inline-flex px-2 py-1 rounded-full text-xs ${statusInfo.className}`}
                >
                  {statusInfo.text}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(peer)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQrCodeClick(peer)}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <DownloadCloud className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(peer.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default PeerList;
