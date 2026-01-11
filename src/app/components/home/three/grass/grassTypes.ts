/**
 * 草システムの型定義
 * モバイルファースト設計のため、パフォーマンス設定を段階的に調整可能
 */

import * as THREE from "three";
import { MutableRefObject } from "react";

/** パフォーマンスプリセット（端末性能に応じて選択） */
export type PerformancePreset = "low" | "medium" | "high";

/** 距離帯ごとのインスタンス密度設定 */
export interface DensityTier {
  /** 最大距離（m） */
  maxDistance: number;
  /** チャンクあたりのclump数 */
  clumpsPerChunk: number;
}

/** 草システム全体の設定 */
export interface GrassSystemConfig {
  /** 草の描画半径（m） - デフォルト30m */
  renderRadius: number;
  /** チャンクサイズ（m） - デフォルト10m */
  chunkSize: number;
  /** 距離帯ごとの密度設定 */
  densityTiers: DensityTier[];
  /** 草カードの基本スケール */
  baseScale: number;
  /** スケールのランダム幅（0.0〜1.0） */
  scaleVariation: number;
  /** 草の基本色 */
  baseColor: THREE.Color;
  /** 色のバリエーション幅（HSL明度差） */
  colorVariation: number;
  /** 揺れの強さ（0.0〜1.0） */
  swayStrength: number;
  /** 揺れの速度 */
  swaySpeed: number;
  /** デバッグ表示を有効にするか */
  debug: boolean;
}

/** チャンクの座標（グリッド座標系） */
export interface ChunkCoord {
  x: number;
  z: number;
}

/** チャンクデータ */
export interface ChunkData {
  /** チャンクのグリッド座標 */
  coord: ChunkCoord;
  /** ワールド座標でのチャンク中心位置 */
  worldPosition: THREE.Vector3;
  /** プレイヤーからの距離（m） */
  distanceToPlayer: number;
  /** このチャンクの密度帯インデックス */
  densityTierIndex: number;
  /** このチャンクのインスタンス数 */
  instanceCount: number;
}

/** 草インスタンスの個別データ */
export interface GrassInstanceData {
  /** ワールド座標での位置 */
  position: THREE.Vector3;
  /** 回転（Y軸） */
  rotation: number;
  /** スケール */
  scale: number;
  /** 色の明度オフセット */
  colorOffset: number;
}

/** GrassSystemコンポーネントのProps */
export interface GrassSystemProps {
  /** プレイヤーの参照（position取得用） */
  playerRef: MutableRefObject<THREE.Object3D | null>;
  /** 地形メッシュ（高さ取得用） - nullの場合はフラットな地面を想定 */
  terrainMesh?: THREE.Mesh | THREE.Group | null;
  /** 草システムの設定（省略時はデフォルト値） */
  config?: Partial<GrassSystemConfig>;
  /** パフォーマンスプリセット（configより優先） */
  performancePreset?: PerformancePreset;
}

/** GrassChunkコンポーネントのProps */
export interface GrassChunkProps {
  /** チャンクデータ */
  chunkData: ChunkData;
  /** 草インスタンスの配列 */
  instances: GrassInstanceData[];
  /** 草システムの設定 */
  config: GrassSystemConfig;
}

/** デバッグ用チャンク境界表示のProps */
export interface ChunkBoundaryProps {
  /** チャンクデータ */
  chunkData: ChunkData;
  /** チャンクサイズ */
  chunkSize: number;
}

/** パフォーマンスプリセットごとのデフォルト密度設定 */
export const DENSITY_PRESETS: Record<PerformancePreset, DensityTier[]> = {
  low: [
    { maxDistance: 10, clumpsPerChunk: 50 },
    { maxDistance: 15, clumpsPerChunk: 25 },
    { maxDistance: 20, clumpsPerChunk: 10 },
  ],
  medium: [
    { maxDistance: 10, clumpsPerChunk: 100 },
    { maxDistance: 15, clumpsPerChunk: 50 },
    { maxDistance: 20, clumpsPerChunk: 25 },
  ],
  high: [
    { maxDistance: 15, clumpsPerChunk: 200 },
    { maxDistance: 25, clumpsPerChunk: 100 },
    { maxDistance: 30, clumpsPerChunk: 50 },
  ],
};

/** デフォルトの草システム設定 */
export const DEFAULT_GRASS_CONFIG: GrassSystemConfig = {
  renderRadius: 15, // 描画半径を縮小
  chunkSize: 10,
  densityTiers: DENSITY_PRESETS.low, // デフォルトをlowに変更
  baseScale: 0.5,
  scaleVariation: 0.3,
  baseColor: new THREE.Color(0x4a7c23), // 草の緑
  colorVariation: 0.15,
  swayStrength: 0.1,
  swaySpeed: 1.0,
  debug: false,
};
