import type { User } from './users';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED';

export type Appointment = {
  id: number;
  patientProfileId?: number;
  patient?: Pick<User, 'id' | 'name' | 'email'> & { document?: string };
  doctorProfileId?: number;
  doctor?: Pick<User, 'id' | 'name' | 'email'> & { specialty?: string };
  date: string;
  startTime: string;
  endTime?: string;
  status: AppointmentStatus;
  reason?: string;
  specialtyId?: number;
};

export type AppointmentFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  state?: AppointmentStatus | 'ALL';
  doctorId?: string;
  specialtyId?: string;
  from?: string;
  to?: string;
  mine?: boolean;
};

export type PaginatedAppointments = {
  items: Appointment[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
};
