import { getTree } from '~~/server/utils/tree-storage'
import { getClientId } from '~~/server/utils/client-id'

export default defineEventHandler(async (event): Promise<DecisionTree> => {
  const id = getRouterParam(event, 'id')
  const clientId = getClientId(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tree ID is required',
    })
  }

  const tree = getTree(id, clientId)

  if (!tree) {
    throw createError({
      statusCode: 404,
      statusMessage: `Tree ${id} not found`,
    })
  }

  return tree
})
