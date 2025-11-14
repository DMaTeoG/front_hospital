import { api } from '@/lib/api';
import type { Role } from '@/types/users';

export type Entity = {
  id: number;
  name: string;
  email?: string;
  status?: string;
  specialty?: string;
  role?: Role;
  isActive?: boolean;
};

export type EntityCollection = {
  items: Entity[];
  meta: {
    page: number;
    total: number;
  };
};

type ApiUser = {
  id: number;
  email: string;
  role: Role;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
};

type ApiPatient = {
  id: number;
  user: ApiUser;
  document?: string;
  active: boolean;
};

type ApiDoctor = {
  id: number;
  user: ApiUser;
  specialty_detail?: {
    id: number;
    name: string;
  };
  active: boolean;
};

type ApiSchedule = {
  id: number;
  doctor_detail?: ApiDoctor;
  active: boolean;
  day_of_week: number;
  start_time: string;
  end_time: string;
  interval_minutes: number;
};

type ApiSpecialty = {
  id: number;
  name: string;
  active: boolean;
};

type PaginatedResponse<T> = {
  count: number;
  results: T[];
};

const formatName = (user?: ApiUser | null) => {
  if (!user) return '';
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return fullName || user.email;
};

const weekdayLabel = (day: number) => {
  const labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return labels[day] ?? 'Día';
};

const toEntity = (
  resource: 'patients' | 'doctors' | 'schedules' | 'users',
  item: unknown,
): Entity => {
  switch (resource) {
    case 'patients': {
      const patient = item as ApiPatient;
      return {
        id: patient.id,
        name: formatName(patient.user),
        email: patient.user?.email,
        status: patient.active ? 'Activo' : 'Inactivo',
        isActive: patient.active,
      };
    }
    case 'doctors': {
      const doctor = item as ApiDoctor;
      return {
        id: doctor.id,
        name: formatName(doctor.user),
        email: doctor.user?.email,
        status: doctor.active ? 'Activo' : 'Inactivo',
        specialty: doctor.specialty_detail?.name,
        isActive: doctor.active,
      };
    }
    case 'schedules': {
      const schedule = item as ApiSchedule;
      return {
        id: schedule.id,
        name: formatName(schedule.doctor_detail?.user),
        email: schedule.doctor_detail?.user?.email,
        status: schedule.active ? 'Activo' : 'Inactivo',
        isActive: schedule.active,
        specialty: schedule.doctor_detail?.specialty_detail?.name
          ? `${schedule.doctor_detail?.specialty_detail?.name} · ${weekdayLabel(schedule.day_of_week)} ${schedule.start_time} - ${schedule.end_time}`
          : `${weekdayLabel(schedule.day_of_week)} ${schedule.start_time} - ${schedule.end_time}`,
      };
    }
    case 'users':
    default: {
      const user = item as ApiUser;
      return {
        id: user.id,
        name: formatName(user),
        email: user.email,
        status: user.is_active ? 'Activo' : 'Inactivo',
        role: user.role,
        isActive: user.is_active,
      };
    }
  }
};

export const fetchEntities = async (
  resource: 'patients' | 'doctors' | 'schedules' | 'users',
) => {
  const { data } = await api.get<PaginatedResponse<unknown>>(`/${resource}`, {
    params: { page_size: 10 },
  });

  return {
    items: (data.results ?? []).map((item) => toEntity(resource, item)),
    meta: {
      page: 1,
      total: data.count ?? data.results?.length ?? 0,
    },
  };
};

export type SpecialtyOption = {
  id: number;
  name: string;
};

export const fetchSpecialties = async (): Promise<SpecialtyOption[]> => {
  const { data } = await api.get<PaginatedResponse<ApiSpecialty>>('/specialties', {
    params: { active: true, page_size: 100 },
  });
  return (data.results ?? []).map((item) => ({ id: item.id, name: item.name }));
};

export type PatientOption = {
  id: number;
  name: string;
  email?: string;
};

export type DoctorOption = {
  id: number;
  name: string;
  specialtyId?: number;
  specialtyName?: string;
};

const mapPatientOption = (patient: ApiPatient): PatientOption => ({
  id: patient.id,
  name: formatName(patient.user),
  email: patient.user?.email,
});

const mapDoctorOption = (doctor: ApiDoctor): DoctorOption => ({
  id: doctor.id,
  name: formatName(doctor.user),
  specialtyId: doctor.specialty_detail?.id,
  specialtyName: doctor.specialty_detail?.name,
});

export const fetchPatientsList = async (): Promise<PatientOption[]> => {
  const { data } = await api.get<PaginatedResponse<ApiPatient>>('/patients', {
    params: { page_size: 100 },
  });
  return (data.results ?? []).map(mapPatientOption);
};

export const fetchDoctorsList = async (): Promise<DoctorOption[]> => {
  const { data } = await api.get<PaginatedResponse<ApiDoctor>>('/doctors', {
    params: { page_size: 100 },
  });
  return (data.results ?? []).map(mapDoctorOption);
};

export const toggleUserActive = async (id: number, action: 'activate' | 'deactivate') => {
  await api.post(`/users/${id}/${action}`);
};

export const toggleDoctorActive = async (id: number, action: 'activate' | 'deactivate') => {
  await api.post(`/doctors/${id}/${action}`);
};

export const fetchCurrentPatient = async (): Promise<PatientOption | null> => {
  const patients = await fetchPatientsList();
  return patients[0] ?? null;
};

export const fetchCurrentDoctor = async (): Promise<DoctorOption | null> => {
  const { data } = await api.get<PaginatedResponse<ApiDoctor>>('/doctors', {
    params: { page_size: 1 },
  });
  const first = data.results?.[0];
  return first ? mapDoctorOption(first) : null;
};

export type CreatePatientPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  document: string;
  birthDate?: string;
};

export const createPatient = async (payload: CreatePatientPayload) => {
  await api.post('/patients', {
    user: {
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      role: 'PATIENT',
      password: payload.password,
    },
    document: payload.document,
    birth_date: payload.birthDate || null,
    active: true,
  });
};

export type CreateDoctorPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  specialtyId: string;
  licenseNumber: string;
  bio?: string;
};

export const createDoctor = async (payload: CreateDoctorPayload) => {
  await api.post('/doctors', {
    user: {
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      role: 'DOCTOR',
      password: payload.password,
    },
    specialty: Number(payload.specialtyId),
    license_number: payload.licenseNumber,
    bio: payload.bio ?? '',
    active: true,
  });
};

export type CreateSchedulePayload = {
  doctorId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
};

export const createSchedule = async (payload: CreateSchedulePayload) => {
  await api.post('/schedules', {
    doctor: payload.doctorId ? Number(payload.doctorId) : undefined,
    day_of_week: payload.dayOfWeek,
    start_time: payload.startTime,
    end_time: payload.endTime,
    interval_minutes: payload.intervalMinutes,
    active: true,
  });
};

export type ScheduleDetail = {
  id: number;
  doctorId: number;
  doctorName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
};

const mapScheduleDetail = (item: ApiSchedule): ScheduleDetail => ({
  id: item.id,
  doctorId: item.doctor_detail?.id ?? 0,
  doctorName: formatName(item.doctor_detail?.user),
  dayOfWeek: item.day_of_week,
  startTime: item.start_time,
  endTime: item.end_time,
  intervalMinutes: item.interval_minutes,
});

export const fetchSchedulesDetailed = async (params?: { doctorId?: string }) => {
  const query: Record<string, string | number> = { page_size: 100 };
  if (params?.doctorId) {
    query.doctor = params.doctorId;
  }
  const { data } = await api.get<PaginatedResponse<ApiSchedule>>('/schedules', {
    params: query,
  });

  return (data.results ?? []).map(mapScheduleDetail);
};

export const updateSchedule = async (
  id: number,
  payload: Omit<CreateSchedulePayload, 'doctorId'> & { doctorId?: string },
) => {
  await api.put(`/schedules/${id}`, {
    doctor: payload.doctorId ? Number(payload.doctorId) : undefined,
    day_of_week: payload.dayOfWeek,
    start_time: payload.startTime,
    end_time: payload.endTime,
    interval_minutes: payload.intervalMinutes,
  });
};
