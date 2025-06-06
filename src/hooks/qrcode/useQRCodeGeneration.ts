
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { generateQRCode, saveQRCodeAsImage } from '@/services/qrCodeService';
import logger from '@/services/loggerService';
import { WireguardPeer, WireguardInterface } from '@/services/mikrotik/types';

export interface QRCodeDefaults {
  endpoint: string;
  port: string;
  dns: string;
  allowedIpRange: string;
}

export const useQRCodeGeneration = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [configText, setConfigText] = useState('');
  
  const generateSampleConfig = (peer: WireguardPeer, defaults: QRCodeDefaults, interfaces: WireguardInterface[] = []) => {
    logger.info(`Generating config for peer: ${peer.name}`, {
      peer,
      defaults,
      interfaces
    });
    
    // Find the matching interface to get its public key
    const interfaceName = peer.interface;
    logger.debug(`Looking for interface with name: ${interfaceName}`);
    
    const interfaceObj = interfaces.find(iface => iface.name === interfaceName);
    
    if (!interfaceObj) {
      logger.warn(`Interface "${interfaceName}" not found for peer "${peer.name}"`);
      logger.debug(`Available interfaces: ${JSON.stringify(interfaces.map(i => i.name))}`);
    }
    
    // Get the interface's public key for the [Peer] section in the client config
    const serverPublicKey = interfaceObj?.publicKey || interfaceObj?.['public-key'] || '<PUBLIC-KEY-INTERFACE>';
    logger.debug(`Server public key: ${serverPublicKey}`);
    
    // For the client's [Interface] section, we use the peer's public key
    // This is the correct key to use in the WireGuard configuration
    const peerPublicKey = peer.publicKey || peer['public-key'] || '<PUBLIC-KEY-PEER>';
    
    // Get values from peer or use defaults
    const endpoint = peer.endpoint || peer['endpoint-address'] || defaults.endpoint;
    const endpointPort = peer.endpointPort || peer['endpoint-port'] || defaults.port;
    const allowedAddress = peer.allowedAddress || peer['allowed-address'] || '10.0.0.2/32';
    const persistentKeepalive = peer.persistentKeepalive || peer['persistent-keepalive'] || "25";
    
    // Generate a configuration following the WireGuard standard format
    // Make sure there are no trailing spaces at the end of each line and at the end of the file
    return `[Interface]
PrivateKey = ${peerPublicKey}
Address = ${allowedAddress}
DNS = ${defaults.dns}

[Peer]
PublicKey = ${serverPublicKey}
AllowedIPs = 0.0.0.0/0
Endpoint = ${endpoint}:${endpointPort}
PersistentKeepalive = ${persistentKeepalive}`.trim();
  };

  const handleGenerateQRCode = async (config: string) => {
    try {
      logger.info("Generating QR code for config");
      const qrCode = await generateQRCode(config);
      logger.debug("QR code generated successfully");
      setQrCodeUrl(qrCode);
      setConfigText(config);
    } catch (error) {
      logger.error('Failed to generate QR code:', error);
      toast.error('Falha ao gerar QR Code');
    }
  };

  const handleDownloadQrCode = (qrCodeUrl: string | null, selectedPeer: WireguardPeer | null) => {
    if (!qrCodeUrl || !selectedPeer) return;
    logger.info(`Downloading QR Code for ${selectedPeer.name}`);
    saveQRCodeAsImage(qrCodeUrl, `${selectedPeer.name}-qrcode.png`);
    toast.success('QR Code baixado com sucesso');
  };

  const handleDownloadConfig = (configText: string, selectedPeer: WireguardPeer | null) => {
    if (!configText || !selectedPeer) return;
    
    logger.info(`Downloading config file for ${selectedPeer.name}`);
    
    // Create a blob with the config content - ensure no trailing spaces
    const blob = new Blob([configText.trim()], { type: 'text/plain' });
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
    qrCodeUrl,
    configText,
    setConfigText,
    generateSampleConfig,
    handleGenerateQRCode,
    handleDownloadQrCode,
    handleDownloadConfig,
  };
};
