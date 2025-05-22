
import React, { useState, useEffect } from 'react';
import { useMikrotik } from '@/contexts/mikrotik';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, Users, Activity, CheckCircle, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import MikrotikApi from '@/services/mikrotikService';
import { toast } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Dashboard = () => {
  const { isConfigured, isConnected, testConnection, config } = useMikrotik();
  const [stats, setStats] = useState({
    interfaces: 0,
    peers: 0,
    activeConnections: 0,
  });

  const { data: systemData, isLoading: systemLoading } = useQuery({
    queryKey: ['system-info'],
    queryFn: async () => {
      if (!isConnected || !config) return null;
      try {
        // This is a placeholder for actual system info fetching
        // In a real implementation, you would call an API endpoint that returns system information
        return {
          version: 'RouterOS 7.x',
          uptime: '10 days, 5 hours',
          model: 'MikroTik RouterBoard',
          cpu: '15%',
          memory: '30%'
        };
      } catch (error) {
        console.error('Error fetching system info:', error);
        return null;
      }
    },
    enabled: isConnected && isConfigured,
  });

  // Fetch interfaces and peers data
  const { data: interfacesData, isLoading: interfacesLoading } = useQuery({
    queryKey: ['interfaces'],
    queryFn: async () => {
      if (!isConnected || !config) return [];
      try {
        const api = new MikrotikApi(config);
        return await api.getInterfaces();
      } catch (error) {
        console.error('Error fetching interfaces:', error);
        toast.error('Falha ao carregar interfaces');
        return [];
      }
    },
    enabled: isConnected && isConfigured,
  });

  const { data: peersData, isLoading: peersLoading } = useQuery({
    queryKey: ['peers'],
    queryFn: async () => {
      if (!isConnected || !config) return [];
      try {
        const api = new MikrotikApi(config);
        return await api.getPeers();
      } catch (error) {
        console.error('Error fetching peers:', error);
        toast.error('Falha ao carregar peers');
        return [];
      }
    },
    enabled: isConnected && isConfigured,
  });

  useEffect(() => {
    if (isConnected) {
      // Update stats with real data
      const activeInterfaces = interfacesData?.filter(iface => 
        iface.running === true || iface.running === 'true').length || 0;
      
      const activePeers = peersData?.filter(peer => 
        peer.disabled === false || peer.disabled === 'false').length || 0;
      
      setStats({
        interfaces: interfacesData?.length || 0,
        peers: peersData?.length || 0,
        activeConnections: activePeers,
      });
    }
  }, [isConnected, interfacesData, peersData]);

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
            {config && (
              <div className="mt-2 text-xs text-wireguard-muted-foreground">
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

  const renderLatestInterfaces = () => {
    if (!interfacesData || interfacesData.length === 0) {
      return (
        <div className="text-sm text-wireguard-muted-foreground">
          Nenhuma interface encontrada.
        </div>
      );
    }

    // Show up to 3 most recent interfaces
    const latestInterfaces = interfacesData.slice(0, 3);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Nome</TableHead>
            <TableHead className="font-medium">Porta</TableHead>
            <TableHead className="font-medium">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {latestInterfaces.map((iface) => {
            const isDisabled = typeof iface.disabled === 'string' 
              ? iface.disabled === "true" 
              : Boolean(iface.disabled);
            
            const isRunning = typeof iface.running === 'string'
              ? iface.running === "true"
              : Boolean(iface.running);
            
            let statusText = "Desconhecido";
            let statusClass = "bg-gray-900/30 text-gray-400";
            
            if (isDisabled) {
              statusText = "Desativado";
              statusClass = "bg-red-900/30 text-red-400";
            } else if (isRunning) {
              statusText = "Rodando";
              statusClass = "bg-green-900/30 text-green-400";
            } else {
              statusText = "Parado";
              statusClass = "bg-yellow-900/30 text-yellow-400";
            }
            
            return (
              <TableRow key={iface.id}>
                <TableCell className="font-medium">{iface.name}</TableCell>
                <TableCell>{iface.listenPort || iface['listen-port'] || '-'}</TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs ${statusClass}`}>
                    {statusText}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const renderLatestPeers = () => {
    if (!peersData || peersData.length === 0) {
      return (
        <div className="text-sm text-wireguard-muted-foreground">
          Nenhum peer encontrado.
        </div>
      );
    }

    // Show up to 5 most recent peers
    const latestPeers = peersData.slice(0, 5);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Nome</TableHead>
            <TableHead className="font-medium">Interface</TableHead>
            <TableHead className="font-medium">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {latestPeers.map((peer) => {
            const isDisabled = typeof peer.disabled === 'string' 
              ? peer.disabled === "true" 
              : Boolean(peer.disabled);
            
            let statusText = isDisabled ? "Desativado" : "Ativo";
            let statusClass = isDisabled 
              ? "bg-red-900/30 text-red-400" 
              : "bg-green-900/30 text-green-400";
            
            return (
              <TableRow key={peer.id}>
                <TableCell className="font-medium">{peer.name}</TableCell>
                <TableCell>{peer.interface}</TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs ${statusClass}`}>
                    {statusText}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
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
            {interfacesLoading && <div className="text-xs text-wireguard-muted-foreground mt-1">Carregando...</div>}
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
            {peersLoading && <div className="text-xs text-wireguard-muted-foreground mt-1">Carregando...</div>}
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
            {peersLoading && <div className="text-xs text-wireguard-muted-foreground mt-1">Carregando...</div>}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">WireGuard Manager</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle>Interfaces Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {interfacesLoading ? (
                <div className="text-sm text-wireguard-muted-foreground">Carregando interfaces...</div>
              ) : (
                renderLatestInterfaces()
              )}
            </CardContent>
          </Card>

          <Card className="bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle>Peers Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {peersLoading ? (
                <div className="text-sm text-wireguard-muted-foreground">Carregando peers...</div>
              ) : (
                renderLatestPeers()
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {systemLoading ? (
                  <div className="text-wireguard-muted-foreground">Carregando informações do sistema...</div>
                ) : systemData ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-wireguard-muted-foreground">Versão:</span>
                      <span>{systemData.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wireguard-muted-foreground">Uptime:</span>
                      <span>{systemData.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wireguard-muted-foreground">Modelo:</span>
                      <span>{systemData.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wireguard-muted-foreground">CPU:</span>
                      <span>{systemData.cpu}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wireguard-muted-foreground">Memória:</span>
                      <span>{systemData.memory}</span>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {isConnected && (
          <Card className="mt-6 bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Sobre Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="mb-2">
                  Atualmente, as configurações são armazenadas no Supabase (PostgreSQL). Esta aplicação já está usando PostgreSQL para armazenar:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-wireguard-muted-foreground">
                  <li>Configurações de conexão do Mikrotik</li>
                  <li>Configurações padrão do WireGuard</li>
                </ul>
                <p className="mt-4 text-wireguard-muted-foreground">
                  Não é necessário migrar para PostgreSQL pois a aplicação já está utilizando este banco de dados para armazenamento através do Supabase.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
