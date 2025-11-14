export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export type User = {
  id: number;
  email: string;
  role: Role;
  name: string;
  active: boolean;
};
