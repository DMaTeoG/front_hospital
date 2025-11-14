import type { Role } from '@/types/users';

type Route = {
  label: string;
  path: string;
  roles: Role[];
};

export const routes: Route[] = [
  { label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'DOCTOR', 'PATIENT'] },
  { label: 'Citas', path: '/admin/appointments', roles: ['ADMIN'] },
  { label: 'Pacientes', path: '/admin/patients', roles: ['ADMIN'] },
  { label: 'Médicos', path: '/admin/doctors', roles: ['ADMIN'] },
{ label: 'Horarios', path: '/admin/schedules', roles: ['ADMIN', 'DOCTOR'] },
  { label: 'Usuarios', path: '/admin/users', roles: ['ADMIN'] },
  { label: 'Agenda', path: '/doctor/schedule', roles: ['ADMIN', 'DOCTOR'] },
  { label: 'Citas del doctor', path: '/doctor/appointments', roles: ['DOCTOR'] },
  { label: 'Historias clínicas', path: '/doctor/records', roles: ['ADMIN', 'DOCTOR'] },
  { label: 'Mis citas', path: '/patient/appointments', roles: ['PATIENT'] },
];

export const allowedRoutesForRole = (role: Role | undefined | null) => {
  if (!role) return [];
  return routes.filter((route) => route.roles.includes(role));
};

export const isRoleAllowed = (role: Role | null, required?: Role[]) => {
  if (!required?.length) return true;
  if (!role) return false;
  return required.includes(role);
};
