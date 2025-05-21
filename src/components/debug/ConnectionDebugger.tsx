
import React, { useState } from 'react';
import { useMikrotik } from '@/contexts/mikrotik';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import logger from '@/services/loggerService';
import MikrotikApi from '@/services/mikrotik/api';

const ConnectionDebugger = () => {
  const { config } = useMikrotik();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [useProxy, setUseProxy] = useState<boolean>(true);
  
  const runCorsTest = async () => {
    setLoading(true);
    try {
      const protocol = config.useHttps ? 'https' : 'http';
      const url = `${protocol}://${config.address}${config.port ? `:${config.port}` : ''}/rest/system/resource`;
      
      // Create a Mikrotik API instance for testing
      const api = new MikrotikApi(config);
      
      // Set proxy mode based on user choice
      api.setUseProxy(useProxy);
      
      // Log the test we're about to run
      logger.debug('Running connection test', { url, useProxy });
      
      const response = await api.request('/system/resource', 'GET');
      
      setTestResults({
        success: true,
        useProxy,
        data: response
      });
      
      toast.success(useProxy ? 'Teste via proxy bem-sucedido' : 'Teste direto bem-sucedido');
    } catch (error) {
      console.error('Connection test failed:', error);
      
      setTestResults({
        success: false,
        useProxy,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : String(error),
        browserInfo: {
          userAgent: navigator.userAgent,
          secureContext: window.isSecureContext,
          protocol: window.location.protocol
        }
      });
      
      toast.error(useProxy ? 'Teste via proxy falhou' : 'Teste direto falhou');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="mt-4 bg-wireguard-muted/50">
      <CardHeader>
        <CardTitle>Diagnóstico de Conexão</CardTitle>
        <CardDescription>
          Ferramentas para diagnosticar problemas de CORS e conectividade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Informações de Diagnóstico</AlertTitle>
            <AlertDescription>
              Esta página ajuda a diagnosticar problemas de CORS e conectividade com o roteador Mikrotik.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Configuração Atual</h3>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Endereço:</span>
                  <span className="font-mono">{config.address || 'Não configurado'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Porta:</span>
                  <span className="font-mono">{config.port || 'Padrão'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Protocolo:</span>
                  <span className="font-mono">{config.useHttps ? 'HTTPS' : 'HTTP'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">URL completa:</span>
                  <span className="font-mono">{`${config.useHttps ? 'https' : 'http'}://${config.address}${config.port ? `:${config.port}` : ''}`}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Informações do Navegador</h3>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contexto Seguro:</span>
                  <span className="font-mono">{window.isSecureContext ? 'Sim' : 'Não'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Protocolo:</span>
                  <span className="font-mono">{window.location.protocol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Origem:</span>
                  <span className="font-mono">{window.location.origin}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="proxy-mode"
                checked={useProxy}
                onCheckedChange={setUseProxy}
              />
              <label htmlFor="proxy-mode" className="cursor-pointer">
                Usar proxy para requisições (recomendado)
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Teste de Conexão</h3>
              <Button 
                onClick={runCorsTest} 
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Executar Teste de Conexão
                  </>
                )}
              </Button>
            </div>
            
            {testResults && (
              <div className="mt-4 bg-muted/50 p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">Resultado ({testResults.useProxy ? 'via Proxy' : 'Direto'}):</h4>
                  {testResults.success ? (
                    <span className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      Sucesso
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <X className="h-4 w-4 mr-1" />
                      Falha
                    </span>
                  )}
                </div>
                
                {testResults.success ? (
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Método:</span>
                      <span className="font-mono">{testResults.useProxy ? 'Via proxy Supabase' : 'Requisição direta'}</span>
                    </div>
                    <details>
                      <summary className="cursor-pointer text-sm font-medium">Ver dados da resposta</summary>
                      <pre className="bg-black/90 text-white p-4 rounded text-xs mt-2 overflow-auto max-h-[200px]">
                        {JSON.stringify(testResults.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Método:</span>
                      <span className="font-mono">{testResults.useProxy ? 'Via proxy Supabase' : 'Requisição direta'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Erro:</span>
                      <span className="font-mono text-red-600">{testResults.error?.name || 'Erro desconhecido'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Mensagem:</span>
                      <span className="font-mono text-red-600 break-all">{testResults.error?.message || String(testResults.error)}</span>
                    </div>
                    
                    <details>
                      <summary className="cursor-pointer text-sm font-medium">Ver detalhes do erro</summary>
                      <pre className="bg-black/90 text-white p-4 rounded text-xs mt-2 overflow-auto max-h-[200px]">
                        {testResults.error?.stack || JSON.stringify(testResults.error, null, 2)}
                      </pre>
                    </details>
                    
                    <Alert className="mt-4 bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Possível solução</AlertTitle>
                      <AlertDescription>
                        {testResults.useProxy 
                          ? "Erro ao usar o proxy. Verifique se o usuário tem permissão para acessar as funções do Supabase."
                          : "Tente usar o modo proxy para contornar problemas de CORS e conteúdo misto."}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionDebugger;
