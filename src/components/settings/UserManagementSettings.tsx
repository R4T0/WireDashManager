
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Pencil, Trash2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Esquema para validação do formulário
const userFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  isAdmin: z.boolean().default(false)
});

type UserFormValues = z.infer<typeof userFormSchema>;

type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  created_at: string;
}

const UserManagementSettings = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      isAdmin: false
    }
  });
  
  // Buscar usuários
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Buscar usuários do banco de dados
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUsers(usersData || []);
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
    form.reset({
      email: '',
      password: '',
      isAdmin: false
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (currentUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('users')
          .update({ 
            email: values.email,
            isAdmin: values.isAdmin
          })
          .eq('id', currentUser.id);
        
        if (error) throw error;
        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso',
        });
      } else {
        // Criar novo usuário
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          // Adicionar à tabela de usuários com flag de admin
          await supabase.from('users').insert({
            id: data.user.id,
            email: values.email,
            isAdmin: values.isAdmin,
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
        {loading ? (
          <div className="flex justify-center py-8">
            <p>Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-wireguard-muted-foreground">
            Nenhum usuário cadastrado. Clique em "Adicionar Usuário" para criar o primeiro.
          </div>
        ) : (
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
                    <Button variant="ghost" size="icon" onClick={() => {
                      setCurrentUser(user);
                      form.reset({
                        email: user.email,
                        password: '',
                        isAdmin: user.isAdmin
                      });
                      setDialogOpen(true);
                    }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
              <DialogDescription>
                {currentUser ? 'Atualize os dados do usuário' : 'Preencha os dados para criar um novo usuário'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {!currentUser && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Usuário Administrador</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" className="mt-4">
                    {currentUser ? 'Atualizar' : 'Criar'} Usuário
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagementSettings;
