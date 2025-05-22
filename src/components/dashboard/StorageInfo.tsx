
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const StorageInfo: React.FC = () => {
  return (
    <Card className="mt-4 md:mt-6 bg-wireguard-muted/50">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-base md:text-lg flex items-center">
          <Info className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
          Sobre Armazenamento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="text-xs md:text-sm">
          <p className="mb-2">
            Atualmente, as configurações são armazenadas no Supabase (PostgreSQL). Esta aplicação já está usando PostgreSQL para armazenar:
          </p>
          <ul className="list-disc pl-4 md:pl-5 space-y-1 text-wireguard-muted-foreground">
            <li>Configurações de conexão do Mikrotik</li>
            <li>Configurações padrão do WireGuard</li>
          </ul>
          <p className="mt-3 md:mt-4 text-wireguard-muted-foreground">
            Não é necessário migrar para PostgreSQL pois a aplicação já está utilizando este banco de dados para armazenamento através do Supabase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageInfo;
