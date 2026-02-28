export const traceKeys = {
  all: ['traces'] as const,
  lists: () => [...traceKeys.all, 'list'] as const,
  list: (status?: 'ACTIVE' | 'COMPILED') => [...traceKeys.lists(), status] as const,
  details: () => [...traceKeys.all, 'detail'] as const,
  detail: (id: string) => [...traceKeys.details(), id] as const,
}
