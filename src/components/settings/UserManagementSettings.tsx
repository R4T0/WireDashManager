
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
  
  // Função para buscar usuários de forma segura
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando lista de usuários...');
      
      // Consulta direta sem depender de políticas RLS complexas
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }
      
      console.log(`Encontrado(s) ${usersData?.length || 0} usuário(s)`);
      
      // Mapear dados de usuário para o tipo User
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

  // Função para criar/atualizar usuário
  const handleSubmit = async (values: { email: string; password: string; isAdmin: boolean }) => {
    try {
      if (currentUser) {
        console.log('Atualizando usuário existente:', currentUser.email);
        
        // Atualizar usuário existente
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
        console.log('Criando novo usuário:', values.email);
        
        // Primeiro, registrar usuário no sistema de autenticação
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          console.log('Usuário criado na autenticação, adicionando à tabela users');
          
          // Adicionar usuário à tabela users
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: values.email,
              isadmin: values.isAdmin,
            });
          
          if (insertError) {
            console.error('Erro ao inserir usuário na tabela users:', insertError);
            throw insertError;
          }
          
          toast({
            title: 'Sucesso',
            description: 'Usuário criado com sucesso',
          });
        }
      }
      
      setDialogOpen(false);
      fetchUsers(); // Recarregar lista após mudanças
    } catch (error: any) {
      console.error('Erro ao processar usuário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar a operação',
        variant: 'destructive'
      });
    }
  };

  // Função para excluir usuário
  const handleDelete = async (user: User) => {
    try {
      console.log('Removendo usuário:', user.email);
      
      // Remover da tabela users primeiro
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Tentar remover da autenticação (pode falhar sem service_role)
      try {
        console.log('Tentando remover usuário da autenticação');
        await supabase.auth.admin.deleteUser(user.id);
      } catch (authError) {
        console.log('Aviso: Não foi possível remover usuário da autenticação. Isso é normal sem chave service_role.');
      }
      
      toast({
        title: 'Sucesso',
        description: 'Usuário removido com sucesso',
      });
      
      fetchUsers(); // Recarregar lista após exclusão
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover usuário',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = (user: User) => {
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
