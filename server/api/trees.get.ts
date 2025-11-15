import { getAllTrees } from '~~/server/utils/tree-storage'

export default defineEventHandler((): DecisionTree[] => getAllTrees())
