
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Server, CheckCircle, AlertCircle } from 'lucide-react';
import { EnvironmentService } from '@/services/environmentService';

const DatabaseConnectionInfo = () => {
  const envInfo = EnvironmentService.getEnvironmentInfo();
  const isLocal = EnvironmentService.isUsingLocalDatabase();
  const connectionString = EnvironmentService.getDatabaseConnectionString();

  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Informações da Conexão do Banco
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <span className="font-medium">Modo de Operação:</span>
            <div className="flex items-center gap-2">
              {isLocal ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Server className="h-4 w-4 text-blue-600" />
              )}
              <span className="font-mono text-sm">{envInfo.mode}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <span className="font-medium">Banco de Dados:</span>
            <span className="font-mono text-sm">{connectionString}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <span className="font-medium">Ambiente:</span>
            <span className="font-mono text-sm">{envInfo.nodeEnv}</span>
          </div>

          {isLocal && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Usando PostgreSQL Local</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Todas as operações do banco estão sendo direcionadas para o PostgreSQL local.
              </p>
            </div>
          )}

          {!isLocal && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 text-blue-800">
                <Server className="h-4 w-4" />
                <span className="font-medium">Usando Supabase Remoto</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Todas as operações do banco estão sendo direcionadas para o Supabase remoto.
              </p>
            </div>
          )}
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">
            Ver variáveis de ambiente (debug)
          </summary>
          <pre className="bg-black/90 text-white p-4 rounded text-xs mt-2 overflow-auto">
            {JSON.stringify(envInfo, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

export default DatabaseConnectionInfo;
