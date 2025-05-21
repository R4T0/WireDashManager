
import React, { useState, useEffect } from 'react';
import { useMikrotik } from '@/contexts/mikrotik';
import MikrotikApi, { generateKeys, generateWireguardConfig, NewPeerConfig } from '@/services/mikrotikService';
import { generateQRCode, saveQRCodeAsImage } from '@/services/qrCodeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { DownloadCloud, FileText, QrCode } from 'lucide-react';

const GenerateConfig = () => {
  const { config, isConnected, testConnection } = useMikrotik();
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [configGenerated, setConfigGenerated] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [configFile, setConfigFile] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<NewPeerConfig>({
    name: '',
    interface: '',
    endpoint: '',
    endpointPort: '51820',
    allowedAddress: '10.0.0.2/32',
    clientDns: '1.1.1.1',
    clientEndpoint: '0.0.0.0',
  });

  useEffect(() => {
    if (isConnected) {
      fetchInterfaces();
    } else {
      testConnection();
    }
  }, [isConnected]);

  const fetchInterfaces = async () => {
    setLoading(true);
    try {
      const api = new MikrotikApi(config);
      const interfacesData = await api.getInterfaces();
      setInterfaces(interfacesData.map(i => i.name));
      
      // Pre-fill form with first interface if available
      if (interfacesData.length > 0) {
        setFormData(prev => ({
          ...prev,
          interface: interfacesData[0].name
        }));
      }
    } catch (error) {
      console.error('Failed to fetch interfaces:', error);
      toast.error('Falha ao carregar interfaces do roteador');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setConfigGenerated(false);
    setQrCodeUrl(null);
    setConfigFile(null);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.interface || !formData.allowedAddress) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }
      
      // In a real app, this would:
      // 1. Generate WireGuard keys
      // 2. Get the server's public key
      // 3. Create the peer on the router
      // 4. Generate the config file
      
      // For this demo, we'll simulate these steps
      
      // 1. Generate keys
      const keys = await generateKeys();
      
      // 2. Simulate getting server public key
      const serverPublicKey = 'SERVER_PUBLIC_KEY_' + Math.random().toString(36).substring(2, 10);
      
      // 3. Simulate creating peer (in real app this would use the API)
      
      // 4. Generate config file
      const configContent = generateWireguardConfig({
        interface: formData.interface,
        privateKey: keys.privateKey,
        publicKey: keys.publicKey,
        address: formData.allowedAddress,
        dns: formData.clientDns,
        endpoint: formData.endpoint,
        endpointPort: formData.endpointPort,
        allowedIps: '0.0.0.0/0, ::/0',
        serverPublicKey: serverPublicKey
      });
      
      // Generate QR code
      const qrCode = await generateQRCode(configContent);
      
      // Update state with results
      setConfigFile(configContent);
      setQrCodeUrl(qrCode);
      setConfigGenerated(true);
      
      toast.success('Configuração gerada com sucesso');
    } catch (error) {
      console.error('Failed to generate config:', error);
      toast.error('Falha ao gerar configuração');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadConfig = () => {
    if (!configFile) return;
    
    // Create a blob with the config content
    const blob = new Blob([configFile], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.name}.conf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast.success('Arquivo de configuração baixado');
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeUrl) return;
    
    // In a real app, this would save the QR code image
    // For this demo, we'll just open the QR code URL in a new tab
    saveQRCodeAsImage(qrCodeUrl, `${formData.name}-qrcode.png`);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">Não conectado ao roteador</h2>
        <p className="text-wireguard-muted-foreground mb-6">
          Por favor, configure a conexão com o roteador Mikrotik primeiro.
        </p>
        <Button onClick={() => testConnection()}>Conectar</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Generate Config</h1>
      <p className="text-wireguard-muted-foreground mb-6">
        Crie uma configuração WireGuard para um novo cliente
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle>Novo Cliente WireGuard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nome do Cliente
                    </Label>
                    <Input
                      id="name"
                      placeholder="laptop-user"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interface">
                      Interface
                    </Label>
                    <Select 
                      value={formData.interface} 
                      onValueChange={(value) => handleChange('interface', value)}
                      disabled={loading || interfaces.length === 0}
                    >
                      <SelectTrigger className="form-input">
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">
                      Endpoint
                    </Label>
                    <Input
                      id="endpoint"
                      placeholder="vpn.example.com"
                      value={formData.endpoint}
                      onChange={(e) => handleChange('endpoint', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endpointPort">
                      Endpoint Port
                    </Label>
                    <Input
                      id="endpointPort"
                      placeholder="51820"
                      value={formData.endpointPort}
                      onChange={(e) => handleChange('endpointPort', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allowedAddress">
                      Allowed Address
                    </Label>
                    <Input
                      id="allowedAddress"
                      placeholder="10.0.0.2/32"
                      value={formData.allowedAddress}
                      onChange={(e) => handleChange('allowedAddress', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientDns">
                      Client DNS
                    </Label>
                    <Input
                      id="clientDns"
                      placeholder="1.1.1.1"
                      value={formData.clientDns}
                      onChange={(e) => handleChange('clientDns', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientEndpoint">
                      Client Endpoint
                    </Label>
                    <Input
                      id="clientEndpoint"
                      placeholder="0.0.0.0"
                      value={formData.clientEndpoint}
                      onChange={(e) => handleChange('clientEndpoint', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !formData.interface}
                    className="primary-button"
                  >
                    {generating ? 'Gerando...' : 'Gerar Configuração'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="bg-wireguard-muted/50 h-full">
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
            </CardHeader>
            <CardContent>
              {configGenerated ? (
                <div className="space-y-6">
                  <Tabs defaultValue="qrcode">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                      <TabsTrigger value="file">Arquivo</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="qrcode" className="pt-4">
                      <div className="flex flex-col items-center space-y-4">
                        {qrCodeUrl && (
                          <div className="bg-white p-3 rounded-lg">
                            <img 
                              src={qrCodeUrl} 
                              alt="WireGuard QR Code" 
                              className="w-48 h-48"
                            />
                          </div>
                        )}
                        
                        <Button
                          onClick={handleDownloadQrCode}
                          disabled={!qrCodeUrl}
                          variant="outline"
                          className="w-full"
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          Baixar QR Code
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="file" className="pt-4">
                      <div className="space-y-4">
                        <div className="bg-wireguard p-3 rounded-md text-xs font-mono overflow-auto max-h-48">
                          {configFile && (
                            <pre>{configFile}</pre>
                          )}
                        </div>
                        
                        <Button
                          onClick={handleDownloadConfig}
                          disabled={!configFile}
                          variant="outline"
                          className="w-full"
                        >
                          <DownloadCloud className="mr-2 h-4 w-4" />
                          Baixar Arquivo .conf
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-10 text-wireguard-muted-foreground space-y-4">
                  <FileText className="h-12 w-12 opacity-30" />
                  <p className="text-center">
                    Preencha o formulário e clique em "Gerar Configuração" para criar um arquivo de configuração e QR code.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GenerateConfig;
