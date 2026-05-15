// src/services/resourcesApi.ts
import api from './api'
import type { ResourcesResponse } from '@/types'

export interface ResourceRequest {
  categories?:       string[]
  weakestCategory?:  string
  specificTopic?:    string
  prepDepth?:        'QUICK' | 'THOROUGH' | 'COMPREHENSIVE'
}

export const resourcesApi = {
  // Page load — GET with defaults (backend auto-fills analytics)
  getAll: (depth?: string, topic?: string) =>
    api.get<ResourcesResponse>('/resources', {
      params: { depth, topic },
    }),

  // Category tab click
  getByCategory: (category: string, depth?: string) =>
    api.get<ResourcesResponse>(`/resources/category/${category}`, {
      params: { depth },
    }),

  // Custom form submit
  generate: (req: ResourceRequest) =>
    api.post<ResourcesResponse>('/resources/generate', req),

  // Force refresh
  clearCache: () =>
    api.delete('/resources/cache'),
}