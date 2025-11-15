import { searchTrees, searchNodes } from '~~/server/utils/tree-storage'

export default defineEventHandler(async (event): Promise<SearchResponse> => {
  const { description, tags, limit = 50 } = await readBody<SearchRequest>(event)

  const query = { description, tags }
  const trees = searchTrees(query)
  const nodes = searchNodes(query)

  return {
    trees: trees.slice(0, limit),
    nodes: nodes.slice(0, limit),
  }
})
