
import React from 'react';
import { QrCode, DownloadCloud } from 'lucide-react';
import { WireguardPeer } from '@/services/mikrotikService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QRCodeDisplayProps {
  qrCodeUrl: string | null;
  selectedPeer: WireguardPeer | null;
  loading: boolean;
  handleDownloadQrCode: () => void;
  handleDownloadConfig: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeUrl,
  selectedPeer,
  loading,
  handleDownloadQrCode,
  handleDownloadConfig
}) => {
  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader>
        <CardTitle>QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        {qrCodeUrl && selectedPeer ? (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-white p-3 rounded-lg">
              <img 
                src={qrCodeUrl} 
                alt="WireGuard QR Code" 
                className="w-64 h-64"
              />
            </div>
            
            <div className="flex space-x-4 w-full">
              <Button
                onClick={handleDownloadQrCode}
                variant="default"
                className="flex-1"
              >
                <DownloadCloud className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              
              <Button
                onClick={handleDownloadConfig}
                variant="outline"
                className="flex-1"
              >
                Download Config
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-wireguard-muted-foreground space-y-4">
            <QrCode className="h-16 w-16 opacity-30" />
            <p>
              {loading ? 'Carregando peers...' : 'Selecione um peer para visualizar o QR Code da configuração'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
