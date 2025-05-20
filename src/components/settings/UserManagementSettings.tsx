
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const UserManagementSettings = () => {
  return (
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
  );
};

export default UserManagementSettings;
