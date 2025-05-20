
import React, { useState } from 'react';
import { useMikrotik } from '@/contexts/MikrotikContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';

const Settings = () => {
  const { config, updateConfig, saveConfig, testConnection } = useMikrotik();
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      saveConfig();
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await testConnection();
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <p className="text-wireguard-muted-foreground mb-6">
        Configure as configurações do sistema e valores padrão
      </p>
      
      <Tabs defaultValue="mikrotik">
        <TabsList className="mb-6">
          <TabsTrigger value="mikrotik">Conexão Mikrotik</TabsTrigger>
          <TabsTrigger value="defaults">Configuração Padrão</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mikrotik">
          <Card className="bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle>Conexão API do Roteador</CardTitle>
              <CardDescription>
                Configure os parâmetros de conexão para a API do roteador Mikrotik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
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
                
                <div className="flex justify-end space-x-3 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleTest} 
                    disabled={testing}
                    className="secondary-button"
                  >
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
        </TabsContent>
        
        <TabsContent value="defaults">
          <Card className="bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle>Configuração Padrão</CardTitle>
              <CardDescription>
                Configure os valores padrão para novos peers e interfaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="form-label">
                      Endpoint Padrão
                    </label>
                    <Input
                      placeholder="vpn.example.com"
                      className="form-input"
                      defaultValue=""
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">
                      Porta Padrão
                    </label>
                    <Input
                      placeholder="51820"
                      className="form-input"
                      defaultValue="51820"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="form-label">
                      Range de IPs Permitidos
                    </label>
                    <Input
                      placeholder="10.0.0.0/24"
                      className="form-input"
                      defaultValue="10.0.0.0/24"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label">
                      DNS do Cliente
                    </label>
                    <Input
                      placeholder="1.1.1.1"
                      className="form-input"
                      defaultValue="1.1.1.1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button className="primary-button">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações Padrão
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card className="bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie usuários e permissões do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-wireguard-muted-foreground">
                Funcionalidade em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
