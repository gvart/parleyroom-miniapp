import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/endpoints'

export function useFolderTree() {
  return useQuery({
    queryKey: ['material-folders', 'tree'],
    queryFn: () => api.materialFolders(true),
  })
}
