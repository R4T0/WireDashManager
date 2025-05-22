
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
  const [error, setError] = useState<string | null>(null);
  
  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando usuários...');
      // Fetch users from database with more detailed error handling
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }
      
      console.log('Usuários encontrados:', usersData);
      
      // Map database users to our User type
      const mappedUsers = usersData ? usersData.map(mapDatabaseUserToUser) : [];
      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      setError('Não foi possível carregar os usuários');
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
        const { error } = await supabase
          .from('users')
          .update({ 
            email: values.email,
            isadmin: values.isAdmin
          })
          .eq('id', currentUser.id);
        
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso',
        });
      } else {
        // Create new user directly in the auth system
        const { data, error } = await supabase.auth.admin.createUser({
          email: values.email,
          password: values.password,
          email_confirm: true
        });
        
        if (error) {
          // Tentar cadastro normal se o admin create não funcionar
          const signUpResult = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
          });
          
          if (signUpResult.error) throw signUpResult.error;
          
          if (signUpResult.data.user) {
            // Add user to users table
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: signUpResult.data.user.id,
                email: values.email,
                isadmin: values.isAdmin,
              });
            
            if (insertError) throw insertError;
          }
        } else if (data.user) {
          // Admin create worked, now add to users table
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: values.email,
              isadmin: values.isAdmin,
            });
          
          if (insertError) throw insertError;
        }
        
        toast({
          title: 'Sucesso',
          description: 'Usuário criado com sucesso',
        });
      }
      
      setDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao processar usuário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar a operação',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (user: User) => {
    try {
      // Primeiro remover o usuário da tabela users
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Depois tentar remover do sistema de autenticação
      try {
        await supabase.auth.admin.deleteUser(user.id);
      } catch (authError) {
        console.error('Erro ao remover usuário da autenticação:', authError);
        // Continue mesmo se falhar na auth
      }
      
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
        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUsers}
              className="ml-2"
            >
              Tentar novamente
            </Button>
          </div>
        )}
        
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
