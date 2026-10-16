import { cubeSceneData } from '@/lib/cubeScene'
import { CubeExpandClient } from './CubeExpandClient'

// Server shell: builds the cube scene slice at build time and hands it
// to the client player, so the datasets stay out of the bundle.
export default function CubeOfSpaceExpandPage() {
  return <CubeExpandClient scene={cubeSceneData()} />
}
