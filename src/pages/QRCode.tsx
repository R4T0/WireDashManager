import React, { useState, useEffect } from 'react';
import { useMikrotik } from '@/contexts/MikrotikContext';
import MikrotikApi, { WireguardPeer } from '@/services/mikrotikService';
import { generateQRCode, saveQRCodeAsImage } from '@/services/qrCodeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { DownloadCloud, QrCode, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const QRCodePage = () => {
  const { config, isConnected, testConnection } = useMikrotik();
  const [peers, setPeers] = useState<WireguardPeer[]>([]);
  const [filteredPeers, setFilteredPeers] = useState<WireguardPeer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<WireguardPeer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [configText, setConfigText] = useState('');
  const [defaults, setDefaults] = useState({
    endpoint: 'vpn.example.com',
    port: '51820',
    dns: '1.1.1.1'
  });

  useEffect(() => {
    // Load wireguard defaults
    loadDefaultsFromSupabase();
    
    if (isConnected) {
      fetchPeers();
    } else {
      testConnection();
    }
  }, [isConnected]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPeers(peers);
    } else {
      const filtered = peers.filter(peer =>
        peer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPeers(filtered);
    }
  }, [searchQuery, peers]);

  const loadDefaultsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('wireguard_defaults')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        console.error('Error loading defaults:', error);
        return;
      }

      if (data) {
        setDefaults({
          endpoint: data.endpoint || 'vpn.example.com',
          port: data.port || '51820',
          dns: data.dns || '1.1.1.1'
        });
      }
    } catch (error) {
      console.error('Failed to load defaults from Supabase:', error);
    }
  };

  const fetchPeers = async () => {
    setLoading(true);
    try {
      const api = new MikrotikApi(config);
      const peersData = await api.getPeers();
      setPeers(peersData);
      setFilteredPeers(peersData);
    } catch (error) {
      console.error('Failed to fetch peers:', error);
      toast.error('Falha ao carregar peers do roteador');
    } finally {
      setLoading(false);
    }
  };

  const handlePeerSelect = (peerId: string) => {
    const peer = peers.find(p => p.id === peerId);
    if (peer) {
      setSelectedPeer(peer);
      // In a real app, we would fetch the configuration for this peer
      // For this demo, we'll generate a sample config
      const sampleConfig = generateSampleConfig(peer);
      setConfigText(sampleConfig);
      handleGenerateQRCode(sampleConfig);
    }
  };

  const generateSampleConfig = (peer: WireguardPeer) => {
    return `[Interface]
PrivateKey = <private_key_would_be_here>
Address = ${peer.allowedAddress}
DNS = ${defaults.dns}

[Peer]
PublicKey = <server_public_key_would_be_here>
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = ${peer.endpoint || defaults.endpoint}:${peer.endpointPort || defaults.port}
`;
  };

  const handleGenerateQRCode = async (config: string) => {
    try {
      const qrCode = await generateQRCode(config);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Falha ao gerar QR Code');
    }
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeUrl || !selectedPeer) return;
    saveQRCodeAsImage(qrCodeUrl, `${selectedPeer.name}-qrcode.png`);
    toast.success('QR Code baixado com sucesso');
  };

  const handleDownloadConfig = () => {
    if (!configText || !selectedPeer) return;
    
    // Create a blob with the config content
    const blob = new Blob([configText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPeer.name}.conf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast.success('Arquivo de configuração baixado');
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
      <h1 className="text-2xl font-bold mb-2">QR Code</h1>
      <p className="text-wireguard-muted-foreground mb-6">
        Visualize e baixe QR codes para configurações de peers existentes
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-wireguard-muted/50">
          <CardHeader>
            <CardTitle>Search Peer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Enter peer name...</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-wireguard-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Enter peer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="peer-select">Select Peer</Label>
                <Select
                  value={selectedPeer?.id || ''}
                  onValueChange={handlePeerSelect}
                  disabled={loading || filteredPeers.length === 0}
                >
                  <SelectTrigger id="peer-select">
                    <SelectValue placeholder="Select a peer" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPeers.map((peer) => (
                      <SelectItem key={peer.id} value={peer.id}>
                        {peer.name} ({peer.interface})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPeer && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium text-wireguard-muted-foreground">Peer Information</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-wireguard-muted-foreground">Name:</div>
                    <div className="text-right">{selectedPeer.name}</div>
                    
                    <div className="text-wireguard-muted-foreground">Interface:</div>
                    <div className="text-right">{selectedPeer.interface}</div>
                    
                    <div className="text-wireguard-muted-foreground">Created:</div>
                    <div className="text-right">May 20, 2025</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
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
      </div>
    </div>
  );
};

export default QRCodePage;
