
import React from 'react';
import { Button } from '@/components/ui/button';

interface NotConnectedProps {
  onConnect: () => Promise<boolean>;
}

const NotConnected: React.FC<NotConnectedProps> = ({ onConnect }) => {
  return (
    <div className="text-center py-10">
      <h2 className="text-xl font-semibold mb-4">Não conectado ao roteador</h2>
      <p className="text-wireguard-muted-foreground mb-6">
        Por favor, configure a conexão com o roteador Mikrotik primeiro.
      </p>
      <Button onClick={onConnect}>Conectar</Button>
    </div>
  );
};

export default NotConnected;
