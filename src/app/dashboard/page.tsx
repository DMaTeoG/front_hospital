'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatISO, subDays } from 'date-fns';

import Protected from '@/components/auth/Protected';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/store/auth';
import { fetchDashboardMetrics } from '@/features/dashboard/api';
import type { DashboardMetrics } from '@/types/dashboard';
import { cn } from '@/lib/cn';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#0ea5e9', '#22d3ee', '#a855f7', '#10b981'];

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'default',
};

const statusLabel: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
};

type DateRange = {
  from: string;
  to: string;
};

const defaultRange: DateRange = {
  from: formatISO(subDays(new Date(), 30), { representation: 'date' }),
  to: formatISO(new Date(), { representation: 'date' }),
};

export default function DashboardPage() {
  return (
    <Protected roles={['ADMIN', 'DOCTOR', 'PATIENT']}>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </Protected>
  );
}

const DashboardContent = () => {
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [draftRange, setDraftRange] = useState<DateRange>(defaultRange);
  const role = useAuth((state) => state.user?.role ?? 'ADMIN');

  const { data, isLoading, isFetching } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics', range.from, range.to],
    queryFn: () => fetchDashboardMetrics(range),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  useEffect(() => {
    setDraftRange(range);
  }, [range]);

  const isApplyDisabled =
    isFetching ||
    !draftRange.from ||
    !draftRange.to ||
    (draftRange.from === range.from && draftRange.to === range.to);

  const handleApply = () => {
    if (isApplyDisabled) return;
    setRange({ ...draftRange });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs uppercase text-muted-foreground">Desde</label>
          <Input
            type="date"
            value={draftRange.from}
            onChange={(e) => setDraftRange((prev) => ({ ...prev, from: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs uppercase text-muted-foreground">Hasta</label>
          <Input
            type="date"
            value={draftRange.to}
            onChange={(e) => setDraftRange((prev) => ({ ...prev, to: e.target.value }))}
          />
        </div>
        <Button onClick={handleApply} disabled={isApplyDisabled}>
          {isFetching ? 'Actualizando...' : 'Aplicar filtros'}
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="mt-3 h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && (
        <>
          {renderTodayCard(data, role)}

          {renderKpis(data)}

          {role === 'ADMIN' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {renderSpecialtyChart(data, 'Citas por especialidad')}
              {renderMonthlyChart(data, 'Pacientes nuevos por mes')}
            </div>
          )}

          {role === 'DOCTOR' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {renderSpecialtyChart(data, 'Distribucion por especialidad')}
              {renderMonthlyChart(data, 'Citas por mes')}
            </div>
          )}

          {role === 'PATIENT' && (
            <div className="grid gap-6 lg:grid-cols-1">
              {renderMonthlyChart(data, 'Mis citas por mes')}
            </div>
          )}
        </>
      )}
    </section>
  );
};

function renderKpis(data: DashboardMetrics) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardHeader className="pb-1">
            <CardDescription>{kpi.label}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold">{kpi.value}</div>
            {typeof kpi.trend === 'number' && (
              <p
                className={cn('text-sm', kpi.trend >= 0 ? 'text-green-600' : 'text-red-600')}
              >
                {kpi.trend >= 0 ? '+' : ''}
                {kpi.trend}% vs periodo anterior
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function renderTodayCard(data: DashboardMetrics, role: string) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{role === 'ADMIN' ? 'Citas de hoy' : 'Mis citas de hoy'}</CardTitle>
        <CardDescription>
          {data.todayAppointments.length
            ? `Total: ${data.todayAppointments.length}`
            : 'No hay citas programadas para hoy'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.todayAppointments.length ? (
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>ID</TH>
                  <TH>Paciente</TH>
                  <TH>Doctor</TH>
                  <TH>Hora</TH>
                  <TH>Estado</TH>
                </TR>
              </THead>
              <TBody>
                {data.todayAppointments.map((appointment) => (
                  <TR key={appointment.id}>
                    <TD>{appointment.id}</TD>
                    <TD className="font-medium">{appointment.patient}</TD>
                    <TD className="text-sm text-muted-foreground">{appointment.doctor}</TD>
                    <TD>{appointment.time}</TD>
                    <TD>
                      <Badge variant={statusVariant[appointment.status] ?? 'default'}>
                        {statusLabel[appointment.status] ?? appointment.status}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No se registran citas para el dia de hoy.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function renderSpecialtyChart(data: DashboardMetrics, title: string) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {data.appointmentsBySpecialty.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.appointmentsBySpecialty}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="specialty" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">Sin datos disponibles.</p>
        )}
      </CardContent>
    </Card>
  );
}

function renderMonthlyChart(data: DashboardMetrics, title: string) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {data.newPatientsByMonth.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="count" data={data.newPatientsByMonth} outerRadius={110} label>
                {data.newPatientsByMonth.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">Sin datos disponibles.</p>
        )}
      </CardContent>
    </Card>
  );
}
