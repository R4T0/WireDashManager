
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/components/ui/use-toast';
import { SystemUser } from '@/types/auth';
import UserFormDialog from './UserFormDialog';
import UsersTable from './UsersTable';

const UserManagementSettings = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando lista de usuários...');
      
      const response = await supabase
        .from('system_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Handle response based on type
      let result: any;
      if (typeof response.then === 'function') {
        result = await response;
      } else {
        result = response;
      }
      
      if (result.error) {
        console.error('Erro ao buscar usuários:', result.error);
        throw result.error;
      }
      
      console.log(`Encontrado(s) ${result.data?.length || 0} usuário(s)`);
      
      // Map database users to our SystemUser type
      const mappedUsers: SystemUser[] = result.data ? result.data.map((user: any) => ({
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin,
        created_at: user.created_at
      })) : [];
      
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

  // Create/Update user
  const handleSubmit = async (values: { email: string; password: string; isAdmin: boolean }) => {
    try {
      if (currentUser) {
        console.log('Atualizando usuário existente:', currentUser.email);
        
        // Update existing user
        const updateData: any = { 
          email: values.email,
          is_admin: values.isAdmin
        };
        
        // Only update password if provided
        if (values.password) {
          updateData.password_hash = values.password;
        }
        
        const updateResponse = await supabase
          .from('system_users')
          .update(updateData)
          .eq('id', currentUser.id)
          .select();
        
        // Handle response
        let result: any;
        if (typeof updateResponse.then === 'function') {
          result = await updateResponse;
        } else {
          result = updateResponse;
        }
        
        if (result.error) throw result.error;
        
        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso',
        });
      } else {
        console.log('Criando novo usuário:', values.email);
        
        // Check if user already exists
        const existingResponse = await supabase
          .from('system_users')
          .select('id')
          .eq('email', values.email);

        // Handle response
        let existingResult: any;
        if (typeof existingResponse.then === 'function') {
          existingResult = await existingResponse;
        } else {
          existingResult = existingResponse;
        }

        if (existingResult.data && existingResult.data.length > 0) {
          throw new Error('Este email já está em uso');
        }
        
        // Create new user
        const insertResponse = await supabase
          .from('system_users')
          .insert({
            email: values.email,
            password_hash: values.password,
            is_admin: values.isAdmin
          })
          .select();
        
        // Handle response
        let result: any;
        if (typeof insertResponse.then === 'function') {
          result = await insertResponse;
        } else {
          result = insertResponse;
        }
        
        if (result.error) throw result.error;
        
        toast({
          title: 'Sucesso',
          description: 'Usuário criado com sucesso',
        });
      }
      
      setDialogOpen(false);
      fetchUsers(); // Reload list after changes
    } catch (error: any) {
      console.error('Erro ao processar usuário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar a operação',
        variant: 'destructive'
      });
    }
  };

  // Delete user
  const handleDelete = async (user: SystemUser) => {
    try {
      console.log('Removendo usuário:', user.email);
      
      const deleteResponse = await supabase
        .from('system_users')
        .delete()
        .eq('id', user.id);
      
      // Handle response
      let result: any;
      if (typeof deleteResponse.then === 'function') {
        result = await deleteResponse;
      } else {
        result = deleteResponse;
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: 'Sucesso',
        description: 'Usuário removido com sucesso',
      });
      
      fetchUsers(); // Reload list after deletion
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover usuário',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = (user: SystemUser) => {
    console.log('Editando usuário:', user.email);
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
