import { api } from '@/lib/api';
import type {
  Appointment,
  AppointmentFilters,
  AppointmentStatus,
  PaginatedAppointments,
} from '@/types/appointments';
import type { ScheduleEvent } from '@/types/schedule';
import type { Role } from '@/types/users';

type ApiUser = {
  id: number;
  email: string;
  role: Role;
  first_name?: string;
  last_name?: string;
};

type ApiPatient = {
  id: number;
  user: ApiUser;
  document?: string;
};

type ApiDoctor = {
  id: number;
  user: ApiUser;
  specialty_detail?: {
    id: number;
    name: string;
  };
};

type ApiAppointment = {
  id: number;
  patient?: ApiPatient;
  doctor?: ApiDoctor;
  specialty?: {
    id: number;
    name: string;
  };
  date: string;
  start_time: string;
  end_time?: string;
  status: string;
  reason?: string;
};

type PaginatedResponse<T> = {
  count: number;
  results: T[];
};

export type AvailabilitySlot = {
  start_time: string;
  end_time: string;
};

const formatName = (user?: ApiUser) => {
  if (!user) return '';
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return fullName || user.email;
};

const mapAppointment = (item: ApiAppointment): Appointment => ({
  id: item.id,
  patientProfileId: item.patient?.id,
  date: item.date,
  startTime: item.start_time,
  endTime: item.end_time ?? undefined,
  status: item.status as AppointmentStatus,
  reason: item.reason ?? undefined,
  specialtyId: item.specialty?.id,
  doctorProfileId: item.doctor?.id,
  patient: item.patient
    ? {
        id: item.patient.user?.id ?? item.patient.id,
        name: formatName(item.patient.user),
        email: item.patient.user?.email ?? '',
        document: item.patient.document,
      }
    : undefined,
  doctor: item.doctor
    ? {
        id: item.doctor.user?.id ?? item.doctor.id,
        name: formatName(item.doctor.user),
        email: item.doctor.user?.email ?? '',
        specialty: item.doctor.specialty_detail?.name,
      }
    : undefined,
});

export const fetchAppointments = async (
  filters: AppointmentFilters,
): Promise<PaginatedAppointments> => {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const params: Record<string, unknown> = {
    page,
    page_size: pageSize,
  };

  if (filters?.state && filters.state !== 'ALL') {
    params.status = filters.state;
  }
  if (filters.doctorId) {
    params.doctor = filters.doctorId;
  }
  if (filters.specialtyId) {
    params.specialty = filters.specialtyId;
  }
  if (filters.from) {
    params.date_from = filters.from;
  }
  if (filters.to) {
    params.date_to = filters.to;
  }

  const { data } = await api.get<PaginatedResponse<ApiAppointment>>('/appointments', {
    params,
  });

  return {
    items: (data.results ?? []).map(mapAppointment),
    meta: {
      page,
      pageSize,
      total: data.count ?? data.results?.length ?? 0,
    },
  };
};

export const confirmAppointment = async (id: number) => {
  await api.post(`/appointments/${id}/confirm`);
};

export const cancelAppointment = async (id: number) => {
  await api.post(`/appointments/${id}/cancel`);
};

export const fetchPatientAppointments = (filters: AppointmentFilters) =>
  fetchAppointments({ ...filters, mine: true });

export type AvailabilityResponse = {
  events: ScheduleEvent[];
};

export const fetchDoctorAvailability = async (params: {
  doctorId?: string;
  date?: string;
}) => {
  const queryParams: Record<string, string> = {};
  if (params.date) {
    queryParams.date = params.date;
  }
  if (params.doctorId) {
    queryParams.doctor_id = params.doctorId;
  }

  const { data } = await api.get<AvailabilityResponse>(
    '/appointments/availability',
    {
      params: queryParams,
    },
  );
  return data;
};

export const fetchDoctorAvailabilitySlots = async (params: {
  doctorId: string;
  date: string;
}) => {
  const { data } = await api.get<AvailabilitySlot[]>(
    '/appointments/availability',
    {
      params: {
        doctor_id: params.doctorId,
        date: params.date,
      },
    },
  );
  return data;
};

export const rescheduleAppointment = async (payload: {
  id: string | number;
  start: string;
  end: string;
}) => {
  await api.put(`/appointments/${payload.id}`, {
    start_time: payload.start,
    end_time: payload.end,
  });
};

export const createAppointment = async (payload: {
  patientId: number;
  doctorId: number;
  specialtyId: number;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}) => {
  await api.post('/appointments', {
    patient_id: payload.patientId,
    doctor_id: payload.doctorId,
    specialty_id: payload.specialtyId,
    date: payload.date,
    start_time: payload.startTime,
    end_time: payload.endTime,
    reason: payload.reason ?? '',
  });
};
