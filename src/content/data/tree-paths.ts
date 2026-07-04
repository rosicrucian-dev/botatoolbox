// Tree of Life connecting paths (11–32) — which sephiroth each major
// arcana card's path runs between.

import { z } from 'zod'

import treePathsData from '@content/data/tree-paths.json'
import { TreePathSchema } from './schemas'

export type TreePath = z.infer<typeof TreePathSchema>

export const paths: ReadonlyArray<TreePath> = z
  .array(TreePathSchema)
  .parse(treePathsData)
