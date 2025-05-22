
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/components/ui/use-toast';
import { User, mapDatabaseUserToUser } from '@/types/user';
import UserFormDialog from './UserFormDialog';
import UsersTable from './UsersTable';

const UserManagementSettings = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from database
      // @ts-ignore - We've created the users table in the database, but TypeScript doesn't know about it yet
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map database users to our User type
      const mappedUsers = usersData ? usersData.map(mapDatabaseUserToUser) : [];
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddUserDialog = () => {
    setCurrentUser(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: { email: string; password: string; isAdmin: boolean }) => {
    try {
      if (currentUser) {
        // Update existing user
        // @ts-ignore - We've created the users table in the database, but TypeScript doesn't know about it yet
        const { error } = await supabase
          .from('users')
          .update({ 
            email: values.email,
            isadmin: values.isAdmin // Note: using isadmin (lowercase) for the database
          })
          .eq('id', currentUser.id);
        
        if (error) throw error;
        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso',
        });
      } else {
        // Create new user
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          // Add to users table with admin flag
          // @ts-ignore - We've created the users table in the database, but TypeScript doesn't know about it yet
          await supabase.from('users').insert({
            id: data.user.id,
            email: values.email,
            isadmin: values.isAdmin, // Note: using isadmin (lowercase) for the database
          });
          
          toast({
            title: 'Sucesso',
            description: 'Usuário criado com sucesso',
          });
        }
      }
      
      setDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Erro:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar a operação',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (user: User) => {
    try {
      // @ts-ignore - We've created the users table in the database, but TypeScript doesn't know about it yet
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Usuário removido com sucesso',
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover usuário',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setDialogOpen(true);
  };

  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Gerencie usuários e permissões do sistema
          </CardDescription>
        </div>
        <Button onClick={openAddUserDialog}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </CardHeader>
      <CardContent>
        <UsersTable 
          users={users} 
          loading={loading} 
          onEdit={handleEditUser}
          onDelete={handleDelete}
        />

        <UserFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          currentUser={currentUser}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagementSettings;
