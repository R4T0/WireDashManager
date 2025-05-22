
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QuickStartGuide: React.FC = () => {
  return (
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
  );
};

export default QuickStartGuide;
