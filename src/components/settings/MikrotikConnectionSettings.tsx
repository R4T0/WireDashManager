
import React, { useState, useEffect } from 'react';
import { useMikrotik } from '@/contexts/mikrotik';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Plug } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import logger from '@/services/loggerService';

const MikrotikConnectionSettings = () => {
  const { config, updateConfig, saveConfig, testConnection, isConnected } = useMikrotik();
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [useProxy, setUseProxy] = useState<boolean>(true);

  // Store proxy preference in localStorage
  useEffect(() => {
    const storedPreference = localStorage.getItem('mikrotikUseProxy');
    if (storedPreference !== null) {
      setUseProxy(storedPreference === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mikrotikUseProxy', useProxy.toString());
  }, [useProxy]);

  const handleSave = async () => {
    setSaving(true);
    logger.info('Saving Mikrotik connection settings', { address: config.address, port: config.port });
    try {
      await saveConfig();
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    logger.info('Testing Mikrotik connection', { 
      address: config.address, 
      port: config.port,
      useProxy
    });
    try {
      // Fix: We need to ensure testConnection accepts the useProxy parameter
      await testConnection(useProxy);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader>
        <CardTitle>Conexão API do Roteador</CardTitle>
        <CardDescription>
          Configure os parâmetros de conexão para a API do roteador Mikrotik
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {isConnected && (
            <Alert className="bg-green-100 border-green-400 text-green-800">
              <AlertDescription>
                Conexão verificada e funcionando
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="address" className="form-label">
                Endereço do Roteador
              </label>
              <Input
                id="address"
                placeholder="192.168.88.1"
                className="form-input"
                value={config.address}
                onChange={(e) => updateConfig({ address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="port" className="form-label">
                Porta API
              </label>
              <Input
                id="port"
                placeholder="8728"
                className="form-input"
                value={config.port}
                onChange={(e) => updateConfig({ port: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="username" className="form-label">
                Usuário
              </label>
              <Input
                id="username"
                placeholder="admin"
                className="form-input"
                value={config.username}
                onChange={(e) => updateConfig({ username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                className="form-input"
                value={config.password}
                onChange={(e) => updateConfig({ password: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.useHttps}
              onCheckedChange={(checked) => updateConfig({ useHttps: checked })}
              id="useHttps"
            />
            <label htmlFor="useHttps" className="form-label m-0">
              Usar HTTPS para conexões API
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={useProxy}
              onCheckedChange={setUseProxy}
              id="useProxy"
            />
            <label htmlFor="useProxy" className="form-label m-0">
              Usar proxy backend para contornar problemas de CORS (recomendado)
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <Button 
              variant="outline" 
              onClick={handleTest} 
              disabled={testing}
              className="secondary-button"
            >
              <Plug className="mr-2 h-4 w-4" />
              {testing ? 'Testando...' : 'Testar Conexão'}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="primary-button"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Configurações de Conexão'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MikrotikConnectionSettings;
