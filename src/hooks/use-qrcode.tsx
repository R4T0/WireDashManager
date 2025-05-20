
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WireguardPeer } from '@/services/mikrotikService';
import { toast } from '@/components/ui/sonner';
import { generateQRCode, saveQRCodeAsImage } from '@/services/qrCodeService';

interface UseQRCodeProps {
  isConnected: boolean;
  testConnection: () => Promise<boolean>;
  config: any;
}

interface QRCodeDefaults {
  endpoint: string;
  port: string;
  dns: string;
}

export const useQRCode = ({ isConnected, testConnection, config }: UseQRCodeProps) => {
  const [peers, setPeers] = useState<WireguardPeer[]>([]);
  const [filteredPeers, setFilteredPeers] = useState<WireguardPeer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<WireguardPeer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [configText, setConfigText] = useState('');
  const [defaults, setDefaults] = useState<QRCodeDefaults>({
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
      const api = new (await import('@/services/mikrotikService')).default(config);
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

  return {
    peers,
    filteredPeers,
    selectedPeer,
    searchQuery,
    qrCodeUrl,
    loading,
    configText,
    setSearchQuery,
    handlePeerSelect,
    handleDownloadQrCode,
    handleDownloadConfig,
  };
};
