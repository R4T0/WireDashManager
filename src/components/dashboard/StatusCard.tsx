
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle } from 'lucide-react';
import { MikrotikConfig } from '@/services/mikrotik/types';

interface StatusCardProps {
  isConfigured: boolean;
  isConnected: boolean;
  testConnection: () => void;
  config: MikrotikConfig | null;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  isConfigured, 
  isConnected, 
  testConnection, 
  config 
}) => {
  if (!isConfigured) {
    return (
      <Card className="bg-wireguard-muted/50">
        <CardHeader className="p-3 md:p-6 pb-1 md:pb-2">
          <CardTitle className="text-base md:text-lg font-medium flex items-center">
            <Activity className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-xs md:text-sm text-wireguard-muted-foreground">
            O roteador Mikrotik não está configurado. Por favor, vá para a página de configurações para configurar a conexão.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="bg-wireguard-muted/50">
        <CardHeader className="p-3 md:p-6 pb-1 md:pb-2">
          <CardTitle className="text-base md:text-lg font-medium flex items-center">
            <Activity className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-red-500" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-xs md:text-sm text-wireguard-muted-foreground">
            Não foi possível conectar ao roteador Mikrotik. Por favor, verifique as configurações.
          </div>
          <button 
            onClick={() => testConnection()}
            className="mt-2 md:mt-3 px-2 md:px-3 py-1 bg-wireguard-primary text-xs rounded-md text-wireguard-foreground"
          >
            Tentar novamente
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader className="p-3 md:p-6 pb-1 md:pb-2">
        <CardTitle className="text-base md:text-lg font-medium flex items-center">
          <CheckCircle className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-green-500" />
          Status da Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0">
        <div className="text-xs md:text-sm text-wireguard-foreground">
          Conectado ao roteador Mikrotik com sucesso.
          {config && (
            <div className="mt-1 md:mt-2 text-xs text-wireguard-muted-foreground">
              <p>Endereço: {config.address}:{config.port}</p>
              <p>Usuário: {config.username}</p>
              <p>Protocolo: {config.useHttps ? 'HTTPS' : 'HTTP'}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
