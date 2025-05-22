
import React, { useState } from 'react';
import { WireguardPeer, WireguardInterface } from '@/services/mikrotik/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, QrCode, DownloadCloud, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import QRCodeDisplay from '@/components/qrcode/QRCodeDisplay';
import { useWireGuardDefaults } from '@/hooks/qrcode/useWireGuardDefaults';
import { useQRCodeGeneration } from '@/hooks/qrcode/useQRCodeGeneration';

interface PeerListProps {
  peers: WireguardPeer[];
  loading: boolean;
  onEdit: (peer: WireguardPeer) => void;
  onDelete: (id: string) => void;
  interfaces: WireguardInterface[];
}

const PeerList = ({ peers, loading, onEdit, onDelete, interfaces }: PeerListProps) => {
  const [selectedPeer, setSelectedPeer] = useState<WireguardPeer | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  const { defaults } = useWireGuardDefaults();
  const { 
    qrCodeUrl, 
    configText, 
    generateSampleConfig, 
    handleGenerateQRCode,
    handleDownloadQrCode, 
    handleDownloadConfig 
  } = useQRCodeGeneration();

  const handleQrCodeClick = (peer: WireguardPeer) => {
    setSelectedPeer(peer);
    
    // Generate the QR code
    const config = generateSampleConfig(peer, defaults, interfaces);
    handleGenerateQRCode(config);
    
    // Open the dialog
    setQrDialogOpen(true);
  };

  const downloadQrCode = () => {
    if (selectedPeer && qrCodeUrl) {
      handleDownloadQrCode(qrCodeUrl, selectedPeer);
    }
  };

  const downloadConfig = () => {
    if (selectedPeer && configText) {
      handleDownloadConfig(configText, selectedPeer);
    }
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
    <>
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

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - {selectedPeer?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            {qrCodeUrl && (
              <div className="bg-white p-3 rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="WireGuard QR Code" 
                  className="w-64 h-64"
                />
              </div>
            )}
            <div className="flex space-x-3 w-full">
              <Button
                onClick={downloadQrCode}
                variant="default"
                className="flex-1"
              >
                <DownloadCloud className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              
              <Button
                onClick={downloadConfig}
                variant="outline"
                className="flex-1"
              >
                Download Config
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PeerList;
