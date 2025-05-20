
import React, { useState } from 'react';
import { generateQRCode, saveQRCodeAsImage } from '@/services/qrCodeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { DownloadCloud, QrCode } from 'lucide-react';

const QRCodePage = () => {
  const [configText, setConfigText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [filename, setFilename] = useState('wireguard-config');

  const handleGenerate = async () => {
    if (!configText.trim()) {
      toast.error('Por favor, insira o conteúdo da configuração');
      return;
    }
    
    setGenerating(true);
    try {
      const qrCode = await generateQRCode(configText);
      setQrCodeUrl(qrCode);
      toast.success('QR Code gerado com sucesso');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Falha ao gerar QR Code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    
    saveQRCodeAsImage(qrCodeUrl, `${filename}-qrcode.png`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">QR Code</h1>
      <p className="text-wireguard-muted-foreground mb-6">
        Gere um QR Code a partir de uma configuração WireGuard existente
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-wireguard-muted/50">
          <CardHeader>
            <CardTitle>Configuração WireGuard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filename">
                  Nome do Arquivo
                </Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="config">
                  Conteúdo do Arquivo .conf
                </Label>
                <Textarea
                  id="config"
                  placeholder="[Interface]
PrivateKey = ...
Address = ...
DNS = ...

[Peer]
PublicKey = ...
AllowedIPs = ...
Endpoint = ..."
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  className="form-input min-h-[200px] font-mono"
                />
              </div>
              
              <Button
                onClick={handleGenerate}
                disabled={generating || !configText.trim()}
                className="primary-button"
              >
                <QrCode className="mr-2 h-4 w-4" />
                {generating ? 'Gerando...' : 'Gerar QR Code'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-wireguard-muted/50">
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
              {qrCodeUrl ? (
                <>
                  <div className="bg-white p-3 rounded-lg">
                    <img 
                      src={qrCodeUrl} 
                      alt="WireGuard QR Code" 
                      className="w-64 h-64"
                    />
                  </div>
                  
                  <Button
                    onClick={handleDownload}
                    className="secondary-button"
                  >
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Baixar QR Code
                  </Button>
                </>
              ) : (
                <div className="text-center text-wireguard-muted-foreground space-y-2">
                  <QrCode className="h-12 w-12 mx-auto opacity-30" />
                  <p>
                    Insira o conteúdo do arquivo de configuração WireGuard para gerar um QR Code.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRCodePage;
