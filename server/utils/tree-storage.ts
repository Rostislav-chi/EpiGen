const treesByClient: Map<string, Map<string, DecisionTree>> = new Map()

type SearchQuery = {
  description?: string
  tags?: string[]
}

function getClientTrees(clientId: string): Map<string, DecisionTree> {
  if (!treesByClient.has(clientId)) {
    treesByClient.set(clientId, new Map())
  }
  return treesByClient.get(clientId)!
}

export function saveTree(tree: DecisionTree, clientId: string): void {
  const clientTrees = getClientTrees(clientId)
  clientTrees.set(tree.id, tree)
}

export function getTree(
  id: string,
  clientId: string,
): DecisionTree | undefined {
  const clientTrees = getClientTrees(clientId)
  return clientTrees.get(id)
}

export function getAllTrees(clientId: string): DecisionTree[] {
  const clientTrees = getClientTrees(clientId)
  return Array.from(clientTrees.values())
}

export function getLatestTree(clientId: string): DecisionTree | null {
  const clientTrees = getClientTrees(clientId)
  const trees = Array.from(clientTrees.values())
  if (trees.length === 0) {
    return null
  }
  return trees.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]
}

export function updateTree(
  id: string,
  updates: Partial<DecisionTree>,
  clientId: string,
): DecisionTree | null {
  const clientTrees = getClientTrees(clientId)
  const tree = clientTrees.get(id)
  if (!tree) {
    return null
  }

  const updatedTree: DecisionTree = {
    ...tree,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  clientTrees.set(id, updatedTree)
  return updatedTree
}

export function searchTrees(
  query: SearchQuery,
  clientId: string,
): DecisionTree[] {
  const allTrees = getAllTrees(clientId)

  if (!query.description && !query.tags) {
    return allTrees
  }

  return allTrees.filter(tree => {
    const rootNode = tree.nodes.find(n => n.id === tree.rootNodeId)
    if (!rootNode) return false

    let matches = true

    if (query.description) {
      const descLower = query.description.toLowerCase()
      const matchesDescription =
        rootNode.title.toLowerCase().includes(descLower) ||
        rootNode.description.toLowerCase().includes(descLower) ||
        tree.nodes.some(
          (n: DecisionNode) =>
            n.title.toLowerCase().includes(descLower) ||
            n.description.toLowerCase().includes(descLower),
        )
      matches = matches && matchesDescription
    }

    if (query.tags && query.tags.length > 0) {
      const matchesTags = tree.nodes.some((n: DecisionNode) =>
        query.tags!.some(tag => n.tags.includes(tag)),
      )
      matches = matches && matchesTags
    }

    return matches
  })
}

export function searchNodes(
  query: SearchQuery,
  clientId: string,
): DecisionTree['nodes'] {
  const allTrees = getAllTrees(clientId)
  const allNodes: DecisionTree['nodes'] = []

  allTrees.forEach(tree => {
    allNodes.push(...tree.nodes)
  })

  if (!query.description && !query.tags) {
    return allNodes
  }

  return allNodes.filter((node: DecisionNode) => {
    let matches = true

    if (query.description) {
      const descLower = query.description.toLowerCase()
      const matchesDescription =
        node.title.toLowerCase().includes(descLower) ||
        node.description.toLowerCase().includes(descLower)
      matches = matches && matchesDescription
    }

    if (query.tags && query.tags.length > 0) {
      const matchesTags = query.tags.some(tag => node.tags.includes(tag))
      matches = matches && matchesTags
    }

    return matches
  })
}
