
import React from 'react';
import { useMikrotik } from '@/contexts/MikrotikContext';
import { useQRCode } from '@/hooks/use-qrcode';
import PeerSearch from '@/components/qrcode/PeerSearch';
import QRCodeDisplay from '@/components/qrcode/QRCodeDisplay';
import NotConnected from '@/components/peers/NotConnected';
import LogViewer from '@/components/debug/LogViewer';
import logger from '@/services/loggerService';

const QRCodePage = () => {
  const { config, isConnected, testConnection } = useMikrotik();
  
  logger.info('QRCodePage rendered', { isConnected });
  
  const {
    filteredPeers,
    selectedPeer,
    searchQuery,
    qrCodeUrl,
    loading,
    setSearchQuery,
    handlePeerSelect,
    handleDownloadQrCode,
    handleDownloadConfig,
  } = useQRCode({ isConnected, testConnection, config });

  if (!isConnected) {
    logger.warn('Not connected to router, showing NotConnected component');
    return <NotConnected onConnect={testConnection} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">QR Code</h1>
      <p className="text-wireguard-muted-foreground mb-6">
        Visualize e baixe QR codes para configurações de peers existentes
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PeerSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredPeers={filteredPeers}
          selectedPeer={selectedPeer}
          handlePeerSelect={handlePeerSelect}
          loading={loading}
        />
        
        <QRCodeDisplay
          qrCodeUrl={qrCodeUrl}
          selectedPeer={selectedPeer}
          loading={loading}
          handleDownloadQrCode={handleDownloadQrCode}
          handleDownloadConfig={handleDownloadConfig}
        />
      </div>
      
      <LogViewer />
    </div>
  );
};

export default QRCodePage;
