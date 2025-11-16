import { AIAgentService } from '~~/server/services/ai-agent'
import { getTree, updateTree } from '~~/server/utils/tree-storage'
import { getClientId } from '~~/server/utils/client-id'

export default defineEventHandler(
  async (event): Promise<AlternativeSolutionResponse> => {
    const body = await readBody<AlternativeSolutionRequest>(event)
    const clientId = getClientId(event)

    if (!body.fromNodeId || !body.toNodeId || !body.treeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'fromNodeId, toNodeId and treeId are required',
      })
    }

    const existingTree = getTree(body.treeId, clientId)

    if (!existingTree) {
      throw createError({
        statusCode: 404,
        statusMessage: `Tree ${body.treeId} not found`,
      })
    }

    const aiAgent = new AIAgentService()
    const { newNode, newEdge, secondEdges } =
      await aiAgent.findAlternativeSolution(body, existingTree)

    const updatedTree = updateTree(
      body.treeId,
      {
        nodes: [...existingTree.nodes, newNode],
        edges: [...existingTree.edges, newEdge, ...secondEdges],
      },
      clientId,
    )

    if (!updatedTree) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update tree',
      })
    }

    return {
      tree: updatedTree,
      newNodeId: newNode.id,
      newEdgeId: newEdge.id,
    }
  },
)
