import api from './api'
import type { ResourcesResponse } from '@/types'

export interface ResourceRequest {
  categories?:       string[]
  weakestCategory?:  string
  specificTopic?:    string
  prepDepth?:        'QUICK' | 'THOROUGH' | 'COMPREHENSIVE'
}

export const resourcesApi = {
  getAll: (depth?: string, topic?: string) =>
    api.get<ResourcesResponse>('/resources', {
      params: { depth, topic },
    }),

  getByCategory: (category: string, depth?: string) =>
    api.get<ResourcesResponse>(`/resources/category/${category}`, {
      params: { depth },
    }),

  generate: (req: ResourceRequest) =>
    api.post<ResourcesResponse>('/resources/generate', req),

  clearCache: () =>
    api.delete('/resources/cache'),
}