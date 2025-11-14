export type ScheduleEvent = {
  id: string | number;
  title: string;
  start: string;
  end: string;
  doctorId?: number;
  patientName?: string;
  status?: string;
};
