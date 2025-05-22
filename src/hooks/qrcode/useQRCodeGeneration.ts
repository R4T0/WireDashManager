
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { generateQRCode, saveQRCodeAsImage } from '@/services/qrCodeService';
import logger from '@/services/loggerService';
import { WireguardPeer, WireguardInterface } from '@/services/mikrotik/types';

export interface QRCodeDefaults {
  endpoint: string;
  port: string;
  dns: string;
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
    const interfaceObj = interfaces.find(iface => iface.name === peer.interface);
    
    if (!interfaceObj) {
      logger.warn(`Interface "${peer.interface}" not found for peer "${peer.name}"`);
    }
    
    // Get the interface's public key for the [Peer] section
    const serverPublicKey = interfaceObj?.publicKey || '<PUBLIC-KEY-INTERFACE>';
    logger.debug(`Server public key: ${serverPublicKey}`);
    
    // Use peer's public key for the [Interface] section
    const publicKeyPeer = peer.publicKey || '<PUBLICK-KEY-PEER>';
    
    return `[Interface]
Address = ${peer.allowedAddress}
DNS = ${defaults.dns}
PublicKey = ${publicKeyPeer}

[Peer]
AllowedIPs = 0.0.0.0/0
Endpoint = ${peer.endpoint || defaults.endpoint}:${peer.endpointPort || defaults.port}
PublicKey = ${serverPublicKey}
`;
  };

  const handleGenerateQRCode = async (config: string) => {
    try {
      logger.info("Generating QR code for config");
      const qrCode = await generateQRCode(config);
      logger.debug("QR code generated successfully");
      setQrCodeUrl(qrCode);
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
    qrCodeUrl,
    configText,
    setConfigText,
    generateSampleConfig,
    handleGenerateQRCode,
    handleDownloadQrCode,
    handleDownloadConfig,
  };
};
