import api from './api'
import type { AnalyticsDashboard } from '@/types'
 
export const analyticsApi = {
  getDashboard: () => api.get<AnalyticsDashboard>('/analytics/dashboard'),
}