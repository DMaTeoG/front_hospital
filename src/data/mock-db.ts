import { format, parseISO } from 'date-fns';
import type { User } from '@/types/users';
import type { Appointment, AppointmentStatus } from '@/types/appointments';
import type { ScheduleEvent } from '@/types/schedule';

export type MockUser = User & {
  password: string;
  specialtyId?: number;
  specialty?: string;
};

type MockPatient = MockUser & {
  document: string;
};

type MockSchedule = {
  id: number;
  name: string;
  status: string;
  owner: string;
};

type DashboardSnapshot = {
  appointments: Appointment[];
};

const specialties = [
  { id: 1, name: 'Cardiología' },
  { id: 2, name: 'Dermatología' },
  { id: 3, name: 'Neurología' },
  { id: 4, name: 'Pediatría' },
  { id: 5, name: 'Traumatología' },
  { id: 6, name: 'Oncología' },
];

const doctors: MockUser[] = [
  {
    id: 101,
    name: 'Dr. Ana Ruiz',
    email: 'ana.ruiz@hospital.com',
    password: 'doctor123',
    role: 'DOCTOR',
    active: true,
    specialtyId: 1,
    specialty: 'Cardiología',
  },
  {
    id: 102,
    name: 'Dr. Mateo Serrano',
    email: 'mateo.serrano@hospital.com',
    password: 'doctor123',
    role: 'DOCTOR',
    active: true,
    specialtyId: 2,
    specialty: 'Dermatología',
  },
  {
    id: 103,
    name: 'Dra. Laura Pérez',
    email: 'laura.perez@hospital.com',
    password: 'doctor123',
    role: 'DOCTOR',
    active: true,
    specialtyId: 3,
    specialty: 'Neurología',
  },
  {
    id: 104,
    name: 'Dr. Bruno Cáceres',
    email: 'bruno.caceres@hospital.com',
    password: 'doctor123',
    role: 'DOCTOR',
    active: true,
    specialtyId: 4,
    specialty: 'Pediatría',
  },
  {
    id: 105,
    name: 'Dra. Ivanna Cortés',
    email: 'ivanna.cortes@hospital.com',
    password: 'doctor123',
    role: 'DOCTOR',
    active: true,
    specialtyId: 5,
    specialty: 'Traumatología',
  },
  {
    id: 106,
    name: 'Dr. Fernando Pardo',
    email: 'fernando.pardo@hospital.com',
    password: 'doctor123',
    role: 'DOCTOR',
    active: true,
    specialtyId: 6,
    specialty: 'Oncología',
  },
];

const patients: MockPatient[] = [
  {
    id: 201,
    name: 'Carlos Mendez',
    email: 'carlos.mendez@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 10203040',
  },
  {
    id: 202,
    name: 'Mariana López',
    email: 'mariana.lopez@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 11223344',
  },
  {
    id: 203,
    name: 'Pedro Sánchez',
    email: 'pedro.sanchez@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 22334455',
  },
  {
    id: 204,
    name: 'Lucía Romero',
    email: 'lucia.romero@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 33445566',
  },
  {
    id: 205,
    name: 'Andrés Núñez',
    email: 'andres.nunez@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 44556677',
  },
  {
    id: 206,
    name: 'Sofía Herrera',
    email: 'sofia.herrera@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 55667788',
  },
  {
    id: 207,
    name: 'Miguel Torres',
    email: 'miguel.torres@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 66778899',
  },
  {
    id: 208,
    name: 'Camila Díaz',
    email: 'camila.diaz@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 77889900',
  },
  {
    id: 209,
    name: 'Julio Estévez',
    email: 'julio.estevez@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 88990011',
  },
  {
    id: 210,
    name: 'Valentina Ríos',
    email: 'valentina.rios@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 99001122',
  },
  {
    id: 211,
    name: 'Esteban Vega',
    email: 'esteban.vega@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 10111213',
  },
  {
    id: 212,
    name: 'Daniela Pizarro',
    email: 'daniela.pizarro@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 12131415',
  },
  {
    id: 213,
    name: 'Gonzalo Rivera',
    email: 'gonzalo.rivera@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 13141516',
  },
  {
    id: 214,
    name: 'Renata Flores',
    email: 'renata.flores@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 14151617',
  },
  {
    id: 215,
    name: 'Sebastián Prado',
    email: 'sebastian.prado@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 15161718',
  },
  {
    id: 216,
    name: 'Adriana Quispe',
    email: 'adriana.quispe@patients.com',
    password: 'patient123',
    role: 'PATIENT',
    active: true,
    document: 'DNI 16171819',
  },
];

const adminUser: MockUser = {
  id: 1,
  name: 'Administrador',
  email: 'admin@hospital.com',
  password: 'admin123',
  role: 'ADMIN',
  active: true,
};

const schedules: MockSchedule[] = [
  { id: 1, name: 'Bloque Cardiología AM', status: 'Activo', owner: 'Dr. Ana Ruiz' },
  { id: 2, name: 'Tardes Dermatología', status: 'Activo', owner: 'Dr. Mateo Serrano' },
  { id: 3, name: 'Consulta Neurología', status: 'Inactivo', owner: 'Dra. Laura Pérez' },
  { id: 4, name: 'Guardia Pediatría', status: 'Activo', owner: 'Dr. Bruno Cáceres' },
  { id: 5, name: 'Turnos Traumatología', status: 'Activo', owner: 'Dra. Ivanna Cortés' },
  { id: 6, name: 'Oncología integral', status: 'Activo', owner: 'Dr. Fernando Pardo' },
];

const mockUsers: MockUser[] = [adminUser, ...doctors, ...patients];

const sampleDates = [
  '2025-01-05',
  '2025-01-06',
  '2025-01-07',
  '2025-01-08',
  '2025-01-09',
  '2025-01-10',
  '2025-01-11',
  '2025-01-12',
  '2025-01-13',
  '2025-01-14',
  '2025-01-15',
  '2025-01-16',
  '2025-01-17',
  '2025-01-18',
  '2025-01-19',
  '2025-01-20',
];

const hours = [
  { start: '08:00', end: '08:30' },
  { start: '08:30', end: '09:00' },
  { start: '09:00', end: '09:30' },
  { start: '09:30', end: '10:00' },
  { start: '10:00', end: '10:30' },
  { start: '10:30', end: '11:00' },
  { start: '11:00', end: '11:30' },
  { start: '11:30', end: '12:00' },
  { start: '12:00', end: '12:30' },
  { start: '12:30', end: '13:00' },
];

let appointmentCounter = 1;

const generateAppointments = () => {
  const records: Appointment[] = [];
  for (let i = 0; i < 40; i++) {
    const doctor = doctors[i % doctors.length];
    const patient = patients[i % patients.length];
    const date = sampleDates[i % sampleDates.length];
    const slot = hours[i % hours.length];
    const statuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    const status = statuses[i % statuses.length];
    records.push({
      id: appointmentCounter++,
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
      },
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
      },
      date,
      startTime: slot.start,
      endTime: slot.end,
      status,
      specialtyId: doctor.specialtyId,
    });
  }
  return records;
};

let appointments: Appointment[] = generateAppointments();

const sessions = new Map<string, number>();

export const mockDb = {
  users: mockUsers,
  patients,
  doctors,
  schedules,
  specialties,
  appointments,
  sessions,
};

export const paginate = <T,>(items: T[], page: number, pageSize: number) => {
  const start = (page - 1) * pageSize;
  const sliced = items.slice(start, start + pageSize);
  return {
    items: sliced,
    meta: {
      page,
      pageSize,
      total: items.length,
    },
  };
};

const normalize = (input: string) =>
  input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const filterAppointments = (params: {
  q?: string;
  state?: string;
  doctorId?: string;
  specialtyId?: string;
  mine?: boolean;
  patientId?: number;
}) => {
  const { q, state, doctorId, specialtyId, mine, patientId } = params;
  let data = mockDb.appointments;

  if (q) {
    const needle = normalize(q);
    data = data.filter(
      (item) =>
        normalize(item.patient?.name ?? '').includes(needle) ||
        normalize(item.doctor?.name ?? '').includes(needle),
    );
  }

  if (state && state !== 'ALL') {
    data = data.filter((item) => item.status === state);
  }

  if (doctorId) {
    data = data.filter((item) => `${item.doctor?.id}` === doctorId);
  }

  if (specialtyId) {
    data = data.filter((item) => `${item.specialtyId}` === specialtyId);
  }

  if (mine && patientId) {
    data = data.filter((item) => item.patient?.id === patientId);
  }

  return data;
};

export const toScheduleEvents = (doctorId?: number, date?: string): ScheduleEvent[] => {
  let data = mockDb.appointments;
  if (doctorId) {
    data = data.filter((item) => item.doctor?.id === doctorId);
  }
  if (date) {
    data = data.filter((item) => item.date === date);
  }
  return data.map((item) => {
    const startIso = parseISO(`${item.date}T${item.startTime}:00`);
    const endIso = parseISO(`${item.date}T${item.endTime ?? item.startTime}:00`);
    return {
      id: item.id,
      title: `${item.patient?.name ?? 'Paciente'} (${item.status})`,
      start: startIso.toISOString(),
      end: endIso.toISOString(),
      doctorId: item.doctor?.id,
      patientName: item.patient?.name,
      status: item.status,
    };
  });
};

export const updateAppointment = (id: number, updates: Partial<Appointment>) => {
  mockDb.appointments = mockDb.appointments.map((appt) =>
    appt.id === id ? { ...appt, ...updates } : appt,
  );
  appointments = mockDb.appointments;
  return mockDb.appointments.find((appt) => appt.id === id) ?? null;
};

export const getDashboardSnapshot = (): DashboardSnapshot => ({
  appointments: mockDb.appointments,
});

export const calculateMetrics = () => {
  const snapshot = getDashboardSnapshot();
  const totalAppointments = snapshot.appointments.length;
  const confirmed = snapshot.appointments.filter((a) => a.status === 'CONFIRMED').length;
  const cancelled = snapshot.appointments.filter((a) => a.status === 'CANCELLED').length;
  const pending = snapshot.appointments.filter((a) => a.status === 'PENDING').length;

  const appointmentsBySpecialty = mockDb.appointments.reduce<Record<string, number>>(
    (acc, appt) => {
      const key = appt.doctor?.specialty ?? 'Otra';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const monthlyPatients = mockDb.appointments.reduce<Record<string, number>>((acc, appt) => {
    const month = format(parseISO(appt.date), 'yyyy-MM');
    acc[month] = (acc[month] ?? 0) + 1;
    return acc;
  }, {});

  return {
    kpis: [
      { label: 'Total citas', value: totalAppointments, trend: 5 },
      { label: 'Confirmadas', value: confirmed, trend: 3 },
      { label: 'Pendientes', value: pending, trend: -2 },
      { label: 'Canceladas', value: cancelled, trend: -1 },
    ],
    appointmentsBySpecialty: Object.entries(appointmentsBySpecialty).map(([specialty, count]) => ({
      specialty,
      count,
    })),
    newPatientsByMonth: Object.entries(monthlyPatients).map(([month, count]) => ({
      month,
      count,
    })),
  };
};

export const findUserByEmail = (email: string) =>
  mockDb.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const getUserFromToken = (token?: string | null): User | null => {
  if (!token) return null;
  const userId = mockDb.sessions.get(token);
  if (!userId) return null;
  return mockDb.users.find((user) => user.id === userId) ?? null;
};

export const createSession = (userId: number) => {
  const token = `mock-token-${userId}-${Date.now()}`;
  mockDb.sessions.set(token, userId);
  return token;
};

export const removeSession = (token: string) => {
  mockDb.sessions.delete(token);
};
