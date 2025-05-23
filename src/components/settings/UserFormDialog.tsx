
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SystemUser } from '@/types/auth';

// Schema for form validation
const userFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').or(z.string().length(0)).optional(),
  isAdmin: z.boolean().default(false)
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: SystemUser | null;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({ 
  open, 
  onOpenChange, 
  currentUser, 
  onSubmit 
}) => {
  const isEditing = !!currentUser;
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(
      isEditing 
        ? userFormSchema.partial({ password: true }) // Make password optional when editing
        : userFormSchema // Require password for new users
    ),
    defaultValues: {
      email: currentUser?.email || '',
      password: '',
      isAdmin: currentUser?.isAdmin || false
    }
  });

  // Update form values when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      form.reset({
        email: currentUser.email,
        password: '', // Don't show password when editing
        isAdmin: currentUser.isAdmin
      });
    } else {
      form.reset({
        email: '',
        password: '',
        isAdmin: false
      });
    }
  }, [currentUser, form]);
  
  const handleSubmit = async (values: UserFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
  );
};

export default UserFormDialog;
