'use client';

import type { ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import Protected from '@/components/auth/Protected';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { fetchEntities, toggleUserActive } from '@/features/entities/api';
import type { Role } from '@/types/users';

type Props = {
  resource: 'patients' | 'doctors' | 'schedules' | 'users';
  title: string;
  description: string;
  renderCreateForm?: (refetch: () => void) => ReactNode;
  roles?: Role[];
  standalone?: boolean;
};

export const EntityPage = ({
  resource,
  title,
  description,
  renderCreateForm,
  roles = ['ADMIN'],
  standalone = true,
}: Props) => {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: [resource],
    queryFn: () => fetchEntities(resource),
  });
  const showRole = resource === 'users';
  const columnCount = showRole ? 6 : 4;
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) =>
      toggleUserActive(id, isActive ? 'deactivate' : 'activate'),
    onSuccess: () => {
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
    onError: () => toast.error('No se pudo actualizar el estado'),
  });

  const content = (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {renderCreateForm?.(refetch)}
      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>ID</TH>
                  <TH>Nombre</TH>
                  <TH>Correo</TH>
                  <TH>Estado</TH>
                  {showRole && (
                    <>
                      <TH>Rol</TH>
                      <TH>Acciones</TH>
                    </>
                  )}
                </TR>
              </THead>
              <TBody>
                {isLoading && (
                  <TR>
                    <TD colSpan={columnCount} className="text-center text-sm text-muted-foreground">
                      Cargando…
                    </TD>
                  </TR>
                )}
                {!isLoading &&
                  data?.items?.map((item) => {
                    const isActive = item.isActive ?? item.status === 'Activo';
                    const isUpdating =
                      toggleMutation.isPending && toggleMutation.variables?.id === item.id;

                    return (
                      <TR key={item.id}>
                        <TD>{item.id}</TD>
                        <TD className="font-medium">{item.name}</TD>
                        <TD className="text-sm text-muted-foreground">{item.email ?? '—'}</TD>
                        <TD className="text-xs uppercase text-muted-foreground">
                          {item.status ?? 'Activo'}
                        </TD>
                        {showRole && (
                          <>
                            <TD className="text-xs uppercase text-muted-foreground">
                              {item.role ?? 'SIN ROL'}
                            </TD>
                            <TD className="text-xs">
                              <Button
                                type="button"
                                size="sm"
                                variant={isActive ? 'outline' : 'primary'}
                                disabled={isUpdating}
                                onClick={() =>
                                  toggleMutation.mutate({
                                    id: item.id,
                                    isActive,
                                  })
                                }
                              >
                                {isUpdating ? 'Actualizando...' : isActive ? 'Desactivar' : 'Activar'}
                              </Button>
                            </TD>
                          </>
                        )}
                      </TR>
                    );
                  })}
                {!isLoading && !data?.items?.length && (
                  <TR>
                    <TD colSpan={columnCount} className="text-center text-sm text-muted-foreground">
                      Sin registros
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );

  if (!standalone) {
    return content;
  }

  return (
    <Protected roles={roles}>
      <AppShell>{content}</AppShell>
    </Protected>
  );
};
