
import React, { useState, useEffect } from 'react';
import { useMikrotik } from '@/contexts/mikrotik';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, Users, Activity, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { isConfigured, isConnected, testConnection } = useMikrotik();
  const [stats, setStats] = useState({
    interfaces: 0,
    peers: 0,
    activeConnections: 0,
  });

  useEffect(() => {
    if (isConnected) {
      // Fetch stats from API
      // For demo, we'll use placeholder data
      setStats({
        interfaces: 2,
        peers: 5,
        activeConnections: 3,
      });
    }
  }, [isConnected]);

  // Connection check on component mount
  useEffect(() => {
    if (isConfigured && !isConnected) {
      testConnection();
    }
  }, [isConfigured, isConnected, testConnection]);

  const statusCard = () => {
    if (!isConfigured) {
      return (
        <Card className="bg-wireguard-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5 text-yellow-500" />
              Status da Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-wireguard-muted-foreground">
              O roteador Mikrotik não está configurado. Por favor, vá para a página de configurações para configurar a conexão.
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!isConnected) {
      return (
        <Card className="bg-wireguard-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5 text-red-500" />
              Status da Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-wireguard-muted-foreground">
              Não foi possível conectar ao roteador Mikrotik. Por favor, verifique as configurações.
            </div>
            <button 
              onClick={() => testConnection()}
              className="mt-3 px-3 py-1 bg-wireguard-primary text-xs rounded-md text-wireguard-foreground"
            >
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-wireguard-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-wireguard-foreground">
            Conectado ao roteador Mikrotik com sucesso.
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statusCard()}

        <Card className="bg-wireguard-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Network className="mr-2 h-5 w-5 text-wireguard-primary" />
              Interfaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.interfaces}</div>
          </CardContent>
        </Card>

        <Card className="bg-wireguard-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="mr-2 h-5 w-5 text-wireguard-primary" />
              Peers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.peers}</div>
          </CardContent>
        </Card>

        <Card className="bg-wireguard-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Activity className="mr-2 h-5 w-5 text-wireguard-primary" />
              Conexões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeConnections}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">WireGuard Manager</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle>Início Rápido</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-wireguard-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  Configure a conexão com o roteador Mikrotik na página de Configurações.
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  Visualize e gerencie interfaces WireGuard na página Interfaces.
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  Adicione e gerencie peers na página Peers.
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  Gere arquivos de configuração para novos clients na página Generate Config.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-wireguard-muted-foreground">Versão:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wireguard-muted-foreground">Status:</span>
                  <span className="text-green-500">Operacional</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wireguard-muted-foreground">Último Backup:</span>
                  <span>Nunca</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wireguard-muted-foreground">Modo:</span>
                  <span>Produção</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
