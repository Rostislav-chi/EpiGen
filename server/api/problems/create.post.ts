import { AIAgentService } from '~~/server/services/ai-agent'
import { saveTree, getAllTrees } from '~~/server/utils/tree-storage'
import { getClientId } from '~~/server/utils/client-id'

export default defineEventHandler(
  async (event): Promise<CreateProblemResponse> => {
    const body = await readBody<CreateProblemRequest>(event)
    const clientId = getClientId(event)

    if (!body.description || body.description.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Problem description is required',
      })
    }

    const aiAgent = new AIAgentService()
    const existingTrees = getAllTrees(clientId)

    const similarTree = await aiAgent.searchSimilarProblem(
      body.description,
      existingTrees,
    )

    if (similarTree) {
      return {
        existingTreeId: similarTree.id,
      }
    }

    const newTree = await aiAgent.createProblemTree({
      description: body.description.trim(),
      goal: body.goal?.trim(),
      tags: body.tags || [],
    })

    saveTree(newTree, clientId)

    return {
      newTree,
    }
  },
)
