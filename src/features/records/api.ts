import { api } from '@/lib/api';

export type MedicalRecord = {
  id: number;
  patientId?: number;
  doctorId?: number;
  appointmentId?: number;
  date: string;
  patientName: string;
  patientEmail?: string;
  doctorName: string;
  diagnosis?: string;
  symptoms?: string;
  prescription?: string;
  vitals?: string;
};

type ApiRecord = {
  id: number;
  date: string;
  symptoms?: string;
  vitals?: string;
  diagnosis?: string;
  prescription?: string;
  patient?: {
    id: number;
    user: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
  };
  doctor?: {
    id: number;
    user: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
  };
  appointment?: {
    id: number;
  };
};

type PaginatedResponse<T> = {
  count: number;
  results: T[];
};

const formatName = (user?: { first_name?: string; last_name?: string; email?: string }) => {
  if (!user) return '';
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return fullName || user.email || '';
};

const mapRecord = (item: ApiRecord): MedicalRecord => ({
  id: item.id,
  patientId: item.patient?.id,
  doctorId: item.doctor?.id,
  appointmentId: item.appointment?.id,
  date: item.date,
  patientName: formatName(item.patient?.user),
  patientEmail: item.patient?.user?.email,
  doctorName: formatName(item.doctor?.user),
  diagnosis: item.diagnosis ?? '',
  symptoms: item.symptoms ?? '',
  prescription: item.prescription ?? '',
  vitals: item.vitals ?? '',
});

export type MedicalRecordPayload = {
  doctorId: number;
  patientId: number;
  appointmentId?: number;
  date: string;
  symptoms?: string;
  vitals?: string;
  diagnosis?: string;
  prescription?: string;
};

export type MedicalRecordFilters = {
  patientId?: string;
  doctorId?: string;
  from?: string;
  to?: string;
};

export const fetchMedicalRecords = async (filters: MedicalRecordFilters = {}) => {
  const params: Record<string, unknown> = { page_size: 20 };
  if (filters.patientId) {
    params.patient = filters.patientId;
  }
  if (filters.doctorId) {
    params.doctor = filters.doctorId;
  }
  if (filters.from) {
    params.date_from = filters.from;
  }
  if (filters.to) {
    params.date_to = filters.to;
  }

  const { data } = await api.get<PaginatedResponse<ApiRecord>>('/records', {
    params,
  });
  return {
    items: (data.results ?? []).map(mapRecord),
    total: data.count ?? data.results?.length ?? 0,
  };
};

export const fetchAppointmentRecord = async (
  appointmentId: number,
): Promise<MedicalRecord | null> => {
  const { data } = await api.get<ApiRecord[]>(`/records/appointment/${appointmentId}`);
  const first = (data ?? [])[0];
  return first ? mapRecord(first) : null;
};

export const createMedicalRecord = async (payload: MedicalRecordPayload) => {
  await api.post('/records', {
    doctor_id: payload.doctorId,
    patient_id: payload.patientId,
    appointment_id: payload.appointmentId || null,
    date: payload.date,
    symptoms: payload.symptoms ?? '',
    vitals: payload.vitals ?? '',
    diagnosis: payload.diagnosis ?? '',
    prescription: payload.prescription ?? '',
  });
};

export const updateMedicalRecord = async (id: number, payload: MedicalRecordPayload) => {
  await api.put(`/records/${id}`, {
    doctor_id: payload.doctorId,
    patient_id: payload.patientId,
    appointment_id: payload.appointmentId || null,
    date: payload.date,
    symptoms: payload.symptoms ?? '',
    vitals: payload.vitals ?? '',
    diagnosis: payload.diagnosis ?? '',
    prescription: payload.prescription ?? '',
  });
};
