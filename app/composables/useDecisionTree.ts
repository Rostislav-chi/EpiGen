export const useDecisionTree = () => {
  const createProblem = (request: CreateProblemRequest) =>
    $fetch('/api/problems/create', {
      method: 'POST',
      body: request,
    })

  const findAlternativeSolution = (request: AlternativeSolutionRequest) =>
    $fetch('/api/solutions/alternative', {
      method: 'POST',
      body: request,
    })

  const search = (request: SearchRequest) =>
    $fetch('/api/search', {
      method: 'POST',
      body: request,
    })

  const getTree = (id: string) => $fetch(`/api/trees/${id}`)

  const getLatestTree = () => $fetch<DecisionTree | null>('/api/trees')

  return {
    createProblem,
    findAlternativeSolution,
    search,
    getTree,
    getLatestTree,
  }
}
