import { api } from '@/lib/api';
import type { DashboardMetrics } from '@/types/dashboard';

export const fetchDashboardMetrics = async (params?: {
  from?: string;
  to?: string;
}) => {
  const { data } = await api.get<DashboardMetrics>('/dashboard/metrics', {
    params,
  });
  return data;
};
