export type KpiMetric = {
  label: string;
  value: number;
  trend?: number;
};

export type SpecialtyMetric = {
  specialty: string;
  count: number;
};

export type MonthlyMetric = {
  month: string;
  count: number;
};

export type DashboardMetrics = {
  kpis: KpiMetric[];
  appointmentsBySpecialty: SpecialtyMetric[];
  newPatientsByMonth: MonthlyMetric[];
  todayAppointments: TodayAppointment[];
};

export type TodayAppointment = {
  id: number;
  patient: string;
  doctor: string;
  time: string;
  status: string;
};
