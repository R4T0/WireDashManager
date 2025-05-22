
import React, { useState, useEffect } from 'react';
import { useMikrotik } from '@/contexts/mikrotik';
import MikrotikApi, { generateKeys } from '@/services/mikrotikService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { DownloadCloud, FileText, QrCode } from 'lucide-react';
import { useQRCodeGeneration } from '@/hooks/qrcode/useQRCodeGeneration';
import { useWireGuardDefaults } from '@/hooks/qrcode/useWireGuardDefaults';
import logger from '@/services/loggerService';
import NotConnected from '@/components/peers/NotConnected';

// Interface para o formulário
interface FormData {
  name: string;
  interface: string;
  allowedAddress: string;
  endpoint: string;
  endpointPort: string;
  publicKey: string;
  persistentKeepalive: string;
  disabled: boolean;
}

const GenerateConfig = () => {
  const { config, isConnected, testConnection } = useMikrotik();
  const [interfaces, setInterfaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { defaults } = useWireGuardDefaults();

  // Utiliza o mesmo hook useQRCodeGeneration usado na tela QR Code
  const {
    qrCodeUrl,
    configText,
    generateSampleConfig,
    handleGenerateQRCode,
    handleDownloadQrCode,
    handleDownloadConfig,
  } = useQRCodeGeneration();

  // Form state - com valores padrão
  const [formData, setFormData] = useState<FormData>({
    name: '',
    interface: '',
    allowedAddress: '10.0.0.2/32',
    endpoint: '',
    endpointPort: '51820',
    publicKey: '',
    persistentKeepalive: '25',
    disabled: false
  });

  useEffect(() => {
    if (isConnected) {
      fetchInterfaces();
    } else {
      testConnection();
    }
  }, [isConnected]);

  useEffect(() => {
    // Quando os defaults forem carregados, atualizar o formulário
    if (defaults) {
      setFormData(prev => ({
        ...prev,
        endpoint: defaults.endpoint || prev.endpoint,
        endpointPort: defaults.port || prev.endpointPort
      }));
    }
  }, [defaults]);

  const fetchInterfaces = async () => {
    setLoading(true);
    try {
      const api = new MikrotikApi(config);
      const interfacesData = await api.getInterfaces();
      setInterfaces(interfacesData);
      
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
    
    try {
      // Validate required fields
      if (!formData.name || !formData.interface || !formData.allowedAddress) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      // Gerar chaves para o peer
      const keys = await generateKeys();
      const publicKey = keys.publicKey;
      const privateKey = keys.privateKey;

      // Criar o peer no router
      const peerData = {
        interface: formData.interface,
        "public-key": publicKey,
        "allowed-address": formData.allowedAddress,
        "endpoint-address": formData.endpoint || "",
        "endpoint-port": parseInt(formData.endpointPort) || 51820,
        name: formData.name,
        "persistent-keepalive": parseInt(formData.persistentKeepalive) || 25,
        disabled: formData.disabled ? "true" : "false"
      };
      
      logger.info('Creating peer with data:', peerData);
      
      const api = new MikrotikApi(config);
      const createdPeer = await api.createPeer(peerData);
      
      if (!createdPeer) {
        throw new Error('Falha ao criar peer no roteador');
      }
      
      // Criar o peer com a chave privada para gerar o QR Code
      const peerWithPrivateKey = {
        ...createdPeer,
        privateKey: privateKey
      };
      
      // Gerar configuração usando a mesma lógica que é usada na tela QR Code e Peers
      const configContent = generateSampleConfig(peerWithPrivateKey, defaults, interfaces);
      
      // Gerar QR code
      await handleGenerateQRCode(configContent);
      
      toast.success('Peer criado e configuração gerada com sucesso');
    } catch (error) {
      console.error('Failed to generate config:', error);
      toast.error('Falha ao gerar configuração');
    } finally {
      setGenerating(false);
    }
  };

  if (!isConnected) {
    return <NotConnected onConnect={testConnection} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gerar Configuração</h1>
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
                          <SelectItem key={iface.name} value={iface.name}>
                            {iface.name}
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
                    <Label htmlFor="persistentKeepalive">
                      Persistent Keepalive
                    </Label>
                    <Input
                      id="persistentKeepalive"
                      placeholder="25"
                      value={formData.persistentKeepalive}
                      onChange={(e) => handleChange('persistentKeepalive', e.target.value)}
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
              {qrCodeUrl ? (
                <div className="space-y-6">
                  <Tabs defaultValue="qrcode">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                      <TabsTrigger value="file">Arquivo</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="qrcode" className="pt-4">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-3 rounded-lg">
                          <img 
                            src={qrCodeUrl} 
                            alt="WireGuard QR Code" 
                            className="w-48 h-48"
                          />
                        </div>
                        
                        <Button
                          onClick={() => handleDownloadQrCode(qrCodeUrl, { name: formData.name } as any)}
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
                          <pre>{configText}</pre>
                        </div>
                        
                        <Button
                          onClick={() => handleDownloadConfig(configText, { name: formData.name } as any)}
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
