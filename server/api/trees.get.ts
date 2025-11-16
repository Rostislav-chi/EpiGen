import { getLatestTree } from '~~/server/utils/tree-storage'
import { getClientId } from '~~/server/utils/client-id'

export default defineEventHandler((event): DecisionTree | null => {
  const clientId = getClientId(event)
  return getLatestTree(clientId)
})
