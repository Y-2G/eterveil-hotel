/**
 * 草システムのユーティリティ関数
 * - シード付き乱数生成
 * - チャンク座標計算
 * - 距離に基づく密度決定
 */

import * as THREE from "three";
import {
  ChunkCoord,
  ChunkData,
  DensityTier,
  GrassInstanceData,
  GrassSystemConfig,
} from "./grassTypes";

/**
 * シード付き擬似乱数生成器（Mulberry32アルゴリズム）
 * チャンク座標をシードとして使用し、再現可能な草配置を実現
 *
 * @param seed - 乱数シード
 * @returns 0〜1の乱数を返す関数
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * チャンク座標からユニークなシード値を生成
 * 同じチャンク座標は常に同じシードを返す
 *
 * @param coord - チャンク座標
 * @returns シード値
 */
export function getChunkSeed(coord: ChunkCoord): number {
  // 座標を正の値に変換してビット演算で結合
  const x = (coord.x + 10000) & 0xffff;
  const z = (coord.z + 10000) & 0xffff;
  return (x << 16) | z;
}

/**
 * ワールド座標からチャンク座標を計算
 *
 * @param worldX - ワールドX座標
 * @param worldZ - ワールドZ座標
 * @param chunkSize - チャンクサイズ（m）
 * @returns チャンク座標
 */
export function worldToChunkCoord(
  worldX: number,
  worldZ: number,
  chunkSize: number
): ChunkCoord {
  return {
    x: Math.floor(worldX / chunkSize),
    z: Math.floor(worldZ / chunkSize),
  };
}

/**
 * チャンク座標からワールド座標（チャンク中心）を計算
 *
 * @param coord - チャンク座標
 * @param chunkSize - チャンクサイズ（m）
 * @returns チャンク中心のワールド座標
 */
export function chunkToWorldCoord(
  coord: ChunkCoord,
  chunkSize: number
): THREE.Vector3 {
  return new THREE.Vector3(
    coord.x * chunkSize + chunkSize / 2,
    0, // Y座標は地形から取得するため仮の値
    coord.z * chunkSize + chunkSize / 2
  );
}

/**
 * 距離に基づいて密度帯のインデックスを取得
 *
 * @param distance - プレイヤーからの距離（m）
 * @param densityTiers - 密度帯設定
 * @returns 密度帯のインデックス、範囲外なら-1
 */
export function getDensityTierIndex(
  distance: number,
  densityTiers: DensityTier[]
): number {
  for (let i = 0; i < densityTiers.length; i++) {
    if (distance <= densityTiers[i].maxDistance) {
      return i;
    }
  }
  return -1; // 描画範囲外
}

/**
 * 距離に基づいてチャンクあたりのインスタンス数を取得
 *
 * @param distance - プレイヤーからの距離（m）
 * @param densityTiers - 密度帯設定
 * @returns インスタンス数、範囲外なら0
 */
export function getInstanceCountForDistance(
  distance: number,
  densityTiers: DensityTier[]
): number {
  const tierIndex = getDensityTierIndex(distance, densityTiers);
  if (tierIndex === -1) return 0;
  return densityTiers[tierIndex].clumpsPerChunk;
}

/**
 * プレイヤー周囲の描画対象チャンク座標リストを取得
 * 円形の描画範囲内にあるチャンクのみを返す
 *
 * @param playerX - プレイヤーのワールドX座標
 * @param playerZ - プレイヤーのワールドZ座標
 * @param renderRadius - 描画半径（m）
 * @param chunkSize - チャンクサイズ（m）
 * @returns 描画対象のチャンク座標リスト
 */
export function getVisibleChunkCoords(
  playerX: number,
  playerZ: number,
  renderRadius: number,
  chunkSize: number
): ChunkCoord[] {
  const playerChunk = worldToChunkCoord(playerX, playerZ, chunkSize);
  const chunkRadius = Math.ceil(renderRadius / chunkSize);
  const coords: ChunkCoord[] = [];

  for (let dx = -chunkRadius; dx <= chunkRadius; dx++) {
    for (let dz = -chunkRadius; dz <= chunkRadius; dz++) {
      const coord: ChunkCoord = {
        x: playerChunk.x + dx,
        z: playerChunk.z + dz,
      };
      // チャンク中心からプレイヤーまでの距離を計算
      const chunkCenter = chunkToWorldCoord(coord, chunkSize);
      const distance = Math.sqrt(
        Math.pow(chunkCenter.x - playerX, 2) +
          Math.pow(chunkCenter.z - playerZ, 2)
      );
      // 描画範囲内のみ追加（チャンクの対角線分のマージンを考慮）
      const margin = (chunkSize * Math.sqrt(2)) / 2;
      if (distance <= renderRadius + margin) {
        coords.push(coord);
      }
    }
  }

  return coords;
}

/**
 * チャンク座標からチャンクデータを生成
 *
 * @param coord - チャンク座標
 * @param playerPosition - プレイヤーの位置
 * @param config - 草システム設定
 * @returns チャンクデータ
 */
export function createChunkData(
  coord: ChunkCoord,
  playerPosition: THREE.Vector3,
  config: GrassSystemConfig
): ChunkData {
  const worldPosition = chunkToWorldCoord(coord, config.chunkSize);
  const distanceToPlayer = Math.sqrt(
    Math.pow(worldPosition.x - playerPosition.x, 2) +
      Math.pow(worldPosition.z - playerPosition.z, 2)
  );
  const densityTierIndex = getDensityTierIndex(
    distanceToPlayer,
    config.densityTiers
  );
  const instanceCount =
    densityTierIndex >= 0
      ? config.densityTiers[densityTierIndex].clumpsPerChunk
      : 0;

  return {
    coord,
    worldPosition,
    distanceToPlayer,
    densityTierIndex,
    instanceCount,
  };
}

/**
 * チャンク内の草インスタンスデータを生成
 * シード付き乱数で再現可能な配置を実現
 *
 * @param chunkData - チャンクデータ
 * @param config - 草システム設定
 * @param getHeight - 高さ取得関数
 * @returns 草インスタンスデータの配列
 */
export function generateGrassInstances(
  chunkData: ChunkData,
  config: GrassSystemConfig,
  getHeight: (x: number, z: number) => number
): GrassInstanceData[] {
  if (chunkData.instanceCount === 0) return [];

  const seed = getChunkSeed(chunkData.coord);
  const random = createSeededRandom(seed);
  const instances: GrassInstanceData[] = [];
  const halfChunk = config.chunkSize / 2;

  for (let i = 0; i < chunkData.instanceCount; i++) {
    // チャンク内のランダム位置
    const localX = (random() - 0.5) * config.chunkSize;
    const localZ = (random() - 0.5) * config.chunkSize;
    const worldX = chunkData.worldPosition.x - halfChunk + localX + halfChunk;
    const worldZ = chunkData.worldPosition.z - halfChunk + localZ + halfChunk;

    // 地形の高さを取得
    const y = getHeight(worldX, worldZ);

    // ランダムな回転、スケール、色オフセット
    const rotation = random() * Math.PI * 2;
    const scaleVariation = 1 + (random() - 0.5) * 2 * config.scaleVariation;
    const scale = config.baseScale * scaleVariation;
    const colorOffset = (random() - 0.5) * 2 * config.colorVariation;

    instances.push({
      position: new THREE.Vector3(worldX, y, worldZ),
      rotation,
      scale,
      colorOffset,
    });
  }

  return instances;
}

/**
 * チャンク座標をユニークなキーに変換（Map用）
 *
 * @param coord - チャンク座標
 * @returns ユニークなキー文字列
 */
export function chunkCoordToKey(coord: ChunkCoord): string {
  return `${coord.x},${coord.z}`;
}

/**
 * キーからチャンク座標に変換
 *
 * @param key - キー文字列
 * @returns チャンク座標
 */
export function keyToChunkCoord(key: string): ChunkCoord {
  const [x, z] = key.split(",").map(Number);
  return { x, z };
}

/**
 * 2つのチャンク座標リストの差分を計算
 * 追加すべきチャンクと削除すべきチャンクを返す
 *
 * @param oldCoords - 以前のチャンク座標リスト
 * @param newCoords - 新しいチャンク座標リスト
 * @returns { added: 追加チャンク, removed: 削除チャンク }
 */
export function diffChunkCoords(
  oldCoords: ChunkCoord[],
  newCoords: ChunkCoord[]
): { added: ChunkCoord[]; removed: ChunkCoord[] } {
  const oldSet = new Set(oldCoords.map(chunkCoordToKey));
  const newSet = new Set(newCoords.map(chunkCoordToKey));

  const added = newCoords.filter((c) => !oldSet.has(chunkCoordToKey(c)));
  const removed = oldCoords.filter((c) => !newSet.has(chunkCoordToKey(c)));

  return { added, removed };
}

/**
 * プレイヤーが別のチャンクに移動したかどうかを判定
 *
 * @param prevPosition - 以前のプレイヤー位置
 * @param currentPosition - 現在のプレイヤー位置
 * @param chunkSize - チャンクサイズ
 * @returns 移動したならtrue
 */
export function hasPlayerChangedChunk(
  prevPosition: THREE.Vector3,
  currentPosition: THREE.Vector3,
  chunkSize: number
): boolean {
  const prevChunk = worldToChunkCoord(
    prevPosition.x,
    prevPosition.z,
    chunkSize
  );
  const currentChunk = worldToChunkCoord(
    currentPosition.x,
    currentPosition.z,
    chunkSize
  );
  return prevChunk.x !== currentChunk.x || prevChunk.z !== currentChunk.z;
}
