
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Shield } from 'lucide-react';
import { SystemUser } from '@/types/auth';

interface UsersTableProps {
  users: SystemUser[];
  loading: boolean;
  onEdit: (user: SystemUser) => void;
  onDelete: (user: SystemUser) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p>Carregando usuários...</p>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-wireguard-muted-foreground">
        Nenhum usuário cadastrado. Clique em "Adicionar Usuário" para criar o primeiro.
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead>Data de Criação</TableHead>
          <TableHead className="w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              {user.isAdmin ? (
                <Badge variant="default" className="bg-blue-500">
                  <Shield className="w-3 h-3 mr-1" /> Admin
                </Badge>
              ) : (
                <Badge variant="outline">Usuário</Badge>
              )}
            </TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(user)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
