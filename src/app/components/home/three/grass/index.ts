/**
 * 草システム - モジュールエクスポート
 *
 * 使用例:
 * ```tsx
 * import { GrassSystem, type GrassSystemConfig } from './grass';
 *
 * <GrassSystem
 *   playerRef={playerRef}
 *   terrainMesh={terrainMesh}
 *   performancePreset="medium"
 * />
 * ```
 */

// メインコンポーネント
export {
  GrassSystem,
  SimpleGrassSystem,
  useGrassSystemDebug,
} from "./GrassSystem";

// チャンクコンポーネント（カスタマイズ用）
export { GrassChunk, ChunkBoundary, logChunkInfo } from "./GrassChunk";

// 型定義
export type {
  PerformancePreset,
  DensityTier,
  GrassSystemConfig,
  ChunkCoord,
  ChunkData,
  GrassInstanceData,
  GrassSystemProps,
  GrassChunkProps,
  ChunkBoundaryProps,
} from "./grassTypes";

// 設定定数
export { DEFAULT_GRASS_CONFIG, DENSITY_PRESETS } from "./grassTypes";

// ユーティリティ関数
export {
  createSeededRandom,
  getChunkSeed,
  worldToChunkCoord,
  chunkToWorldCoord,
  getDensityTierIndex,
  getInstanceCountForDistance,
  getVisibleChunkCoords,
  createChunkData,
  generateGrassInstances,
  chunkCoordToKey,
  keyToChunkCoord,
  diffChunkCoords,
  hasPlayerChangedChunk,
} from "./grassUtils";

// 高さサンプラー
export type { HeightSampler } from "./heightSampler";
export {
  createRaycastHeightSampler,
  createFlatHeightSampler,
  createHeightMapSampler,
  createCompositeHeightSampler,
  createCacheableHeightSampler,
} from "./heightSampler";

// シェーダー（カスタマイズ用）
export type { GrassShaderUniforms } from "./grassShader";
export {
  createGrassUniforms,
  grassVertexShader,
  grassFragmentShader,
  createGrassMaterial,
  createGrassCardGeometry,
  createGrassCardGeometry3,
  updateGrassShaderUniforms,
} from "./grassShader";
