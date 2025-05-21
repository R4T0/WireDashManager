
import React, { useState } from 'react';
import { useMikrotik } from '@/contexts/mikrotik';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import logger from '@/services/loggerService';

const ConnectionDebugger = () => {
  const { config } = useMikrotik();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const runCorsTest = async () => {
    setLoading(true);
    try {
      const protocol = config.useHttps ? 'https' : 'http';
      const url = `${protocol}://${config.address}${config.port ? `:${config.port}` : ''}/rest/system/resource`;
      
      // Log the test we're about to run
      logger.debug('Running CORS test', { url });
      
      // Simple fetch to test CORS
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Authorization': 'Basic ' + btoa(`${config.username}:${config.password}`),
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      setTestResults({
        success: true,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });
      
      toast.success('Teste de CORS bem-sucedido');
    } catch (error) {
      console.error('CORS test failed:', error);
      
      setTestResults({
        success: false,
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
      
      toast.error('Teste de CORS falhou');
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Teste de CORS</h3>
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
                    Executar Teste CORS
                  </>
                )}
              </Button>
            </div>
            
            {testResults && (
              <div className="mt-4 bg-muted/50 p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">Resultado:</h4>
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
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-mono">{testResults.status} {testResults.statusText}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Headers:</span>
                      <span className="font-mono max-w-[400px] truncate">
                        {JSON.stringify(testResults.headers)}
                      </span>
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
                        {testResults.error?.name === 'TypeError' && testResults.error?.message.includes('Failed to fetch')
                          ? 'O roteador pode não estar acessível. Verifique o endereço, porta e firewall.'
                          : testResults.error?.message.includes('CORS')
                          ? 'Erro de CORS. O roteador precisa permitir acesso da origem ' + window.location.origin
                          : testResults.error?.message.includes('Mixed Content')
                          ? 'Erro de conteúdo misto. Você está tentando acessar um endereço HTTP a partir de um contexto HTTPS.'
                          : 'Verifique a conectividade com o roteador e as configurações de CORS.'}
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
