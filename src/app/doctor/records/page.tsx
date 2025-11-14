'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Protected from '@/components/auth/Protected';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { fetchDoctorsList, fetchPatientsList } from '@/features/entities/api';
import { fetchMedicalRecords, type MedicalRecord } from '@/features/records/api';
import { RecordDetailPanel } from '@/features/records/components/record-detail-panel';

export default function MedicalRecordsPage() {
  return (
    <Protected roles={['ADMIN', 'DOCTOR']}>
      <AppShell>
        <MedicalRecords />
      </AppShell>
    </Protected>
  );
}

const filterSchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

const MedicalRecords = () => {
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      from: '',
      to: '',
    },
  });
  const [filters, setFilters] = useState<FilterValues>(form.getValues());

  const { data, isLoading } = useQuery({
    queryKey: ['medical-records', filters],
    queryFn: () => fetchMedicalRecords(filters),
  });

  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const { data: patients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: fetchPatientsList,
    staleTime: 5 * 60 * 1000,
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors-list'],
    queryFn: fetchDoctorsList,
    staleTime: 5 * 60 * 1000,
  });

  const handleApply = (values: FilterValues) => {
    setFilters(values);
  };

  const handleReset = () => {
    form.reset({
      patientId: '',
      doctorId: '',
      from: '',
      to: '',
    });
    setFilters({
      patientId: '',
      doctorId: '',
      from: '',
      to: '',
    });
  };

  return (
    <>
      <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filtrar historias clinicas</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            onSubmit={form.handleSubmit(handleApply)}
          >
            <div className="space-y-1">
              <Label>Paciente</Label>
              <Select {...form.register('patientId')}>
                <option value="">Todos</option>
                {patients?.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Medico</Label>
              <Select {...form.register('doctorId')}>
                <option value="">Todos</option>
                {doctors?.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Desde</Label>
              <Input type="date" {...form.register('from')} />
            </div>
            <div className="space-y-1">
              <Label>Hasta</Label>
              <Input type="date" {...form.register('to')} />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-4">
              <div className="flex flex-wrap gap-2">
                <Button type="submit">Aplicar</Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Limpiar
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historias registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>ID</TH>
                  <TH>Paciente</TH>
                  <TH>Medico</TH>
                  <TH>Fecha</TH>
                  <TH>Diagnostico</TH>
                  <TH>Acciones</TH>
                </TR>
              </THead>
              <TBody>
                {isLoading && (
                  <TR>
                    <TD colSpan={6} className="text-center text-sm text-muted-foreground">
                      Cargando...
                    </TD>
                  </TR>
                )}
                {!isLoading &&
                  data?.items?.map((record) => (
                    <TR key={record.id}>
                      <TD>{record.id}</TD>
                      <TD>
                        <div className="font-medium">{record.patientName}</div>
                        <div className="text-xs text-muted-foreground">{record.patientEmail}</div>
                      </TD>
                      <TD>{record.doctorName}</TD>
                      <TD>{record.date}</TD>
                      <TD className="text-sm text-muted-foreground">
                        {record.diagnosis || 'Sin diagnostico'}
                      </TD>
                      <TD>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                          Historia clinica
                        </Button>
                      </TD>
                    </TR>
                  ))}
                {!isLoading && !data?.items?.length && (
                  <TR>
                    <TD colSpan={6} className="text-center text-sm text-muted-foreground">
                      No hay historias registradas
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </section>
      {selectedRecord && (
        <RecordDetailPanel
          record={selectedRecord}
          onClose={() => {
            setSelectedRecord(null);
          }}
        />
      )}
    </>
  );
};
