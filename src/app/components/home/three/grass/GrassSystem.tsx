/**
 * GrassSystem - 草システムのメインコンポーネント
 *
 * 機能:
 * - プレイヤー位置に基づくチャンク管理
 * - 距離に応じた密度調整
 * - チャンクの動的生成/破棄
 *
 * 使用方法:
 * ```tsx
 * <GrassSystem
 *   playerRef={playerRef}
 *   terrainMesh={terrainMesh}
 *   performancePreset="medium"
 * />
 * ```
 */

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  GrassSystemProps,
  GrassSystemConfig,
  ChunkData,
  GrassInstanceData,
  DEFAULT_GRASS_CONFIG,
  DENSITY_PRESETS,
  ChunkCoord,
} from "./grassTypes";
import {
  getVisibleChunkCoords,
  createChunkData,
  generateGrassInstances,
  chunkCoordToKey,
  hasPlayerChangedChunk,
} from "./grassUtils";
import {
  createRaycastHeightSampler,
  createFlatHeightSampler,
  HeightSampler,
} from "./heightSampler";
import { GrassChunk, ChunkBoundary } from "./GrassChunk";

/** チャンクとそのインスタンスデータ */
interface ChunkEntry {
  data: ChunkData;
  instances: GrassInstanceData[];
}

/**
 * 草システムのメインコンポーネント
 */
export function GrassSystem({
  playerRef,
  terrainMesh,
  config: configOverride,
  performancePreset = "medium",
}: GrassSystemProps): React.ReactElement | null {
  // 設定をマージ
  const config: GrassSystemConfig = useMemo(() => {
    const baseConfig = { ...DEFAULT_GRASS_CONFIG };

    // パフォーマンスプリセットを適用
    if (performancePreset) {
      baseConfig.densityTiers = DENSITY_PRESETS[performancePreset];
    }

    // ユーザー指定の設定を上書き
    if (configOverride) {
      return { ...baseConfig, ...configOverride };
    }

    return baseConfig;
  }, [performancePreset, configOverride]);

  // チャンク管理
  const [chunks, setChunks] = useState<Map<string, ChunkEntry>>(new Map());

  // 前回のプレイヤー位置（チャンク変更検出用）
  const prevPlayerPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const isInitializedRef = useRef(false);

  // 高さサンプラーを作成
  const heightSamplerRef = useRef<HeightSampler | null>(null);

  // 総インスタンス数（デバッグ用）
  const totalInstanceCountRef = useRef(0);

  // 地形メッシュが変更されたら高さサンプラーを更新
  useEffect(() => {
    if (terrainMesh) {
      heightSamplerRef.current = createRaycastHeightSampler(terrainMesh);
    } else {
      heightSamplerRef.current = createFlatHeightSampler(0);
    }
  }, [terrainMesh]);

  /**
   * チャンクを更新する関数
   * プレイヤーが別のチャンクに移動した時のみ呼び出す
   */
  const updateChunks = useCallback(
    (playerPosition: THREE.Vector3) => {
      const heightSampler =
        heightSamplerRef.current || createFlatHeightSampler(0);

      // 可視チャンク座標を取得
      const visibleCoords = getVisibleChunkCoords(
        playerPosition.x,
        playerPosition.z,
        config.renderRadius,
        config.chunkSize
      );

      // 新しいチャンクマップを作成
      const newChunks = new Map<string, ChunkEntry>();
      let totalInstances = 0;

      visibleCoords.forEach((coord: ChunkCoord) => {
        const key = chunkCoordToKey(coord);

        // 既存のチャンクを再利用（距離が変わっても密度帯が変わらなければ）
        const existing = chunks.get(key);
        const chunkData = createChunkData(coord, playerPosition, config);

        if (
          existing &&
          existing.data.densityTierIndex === chunkData.densityTierIndex
        ) {
          // 再利用
          newChunks.set(key, {
            data: chunkData,
            instances: existing.instances,
          });
          totalInstances += existing.instances.length;
        } else {
          // 新規生成
          const instances = generateGrassInstances(
            chunkData,
            config,
            heightSampler
          );
          newChunks.set(key, { data: chunkData, instances });
          totalInstances += instances.length;
        }
      });

      // 状態を更新
      setChunks(newChunks);
      totalInstanceCountRef.current = totalInstances;

      // デバッグ出力
      if (config.debug) {
        console.log(
          `[GrassSystem] Chunks: ${newChunks.size}, Total instances: ${totalInstances}`
        );
      }
    },
    [chunks, config]
  );

  // 初回レンダリング時にチャンクを生成
  useEffect(() => {
    if (!playerRef.current || isInitializedRef.current) return;

    const playerPos = playerRef.current.position.clone();
    prevPlayerPosRef.current.copy(playerPos);
    updateChunks(playerPos);
    isInitializedRef.current = true;
  }, [playerRef, updateChunks]);

  // フレームごとにプレイヤー位置をチェック
  useFrame(() => {
    if (!playerRef.current) return;

    const currentPos = playerRef.current.position;

    // プレイヤーが別のチャンクに移動したかチェック
    if (
      hasPlayerChangedChunk(
        prevPlayerPosRef.current,
        currentPos,
        config.chunkSize
      )
    ) {
      prevPlayerPosRef.current.copy(currentPos);
      updateChunks(currentPos);
    }
  });

  // チャンクが空の場合は何も描画しない
  if (chunks.size === 0) return null;

  return (
    <group name="grass-system">
      {Array.from(chunks.entries()).map(([key, entry]) => (
        <React.Fragment key={key}>
          <GrassChunk
            chunkData={entry.data}
            instances={entry.instances}
            config={config}
          />
          {/* デバッグ用チャンク境界表示 */}
          {config.debug && (
            <ChunkBoundary
              chunkData={entry.data}
              chunkSize={config.chunkSize}
            />
          )}
        </React.Fragment>
      ))}
    </group>
  );
}

/**
 * 草システムの簡易ラッパー（デフォルト設定で使用）
 */
export function SimpleGrassSystem({
  playerRef,
  terrainMesh,
}: {
  playerRef: React.MutableRefObject<THREE.Object3D | null>;
  terrainMesh?: THREE.Mesh | THREE.Group | null;
}): React.ReactElement {
  return (
    <GrassSystem
      playerRef={playerRef}
      terrainMesh={terrainMesh}
      performancePreset="medium"
    />
  );
}

/**
 * デバッグ情報表示用フック
 */
export function useGrassSystemDebug(): {
  getTotalInstanceCount: () => number;
  getChunkCount: () => number;
} {
  const instanceCountRef = useRef(0);
  const chunkCountRef = useRef(0);

  return {
    getTotalInstanceCount: () => instanceCountRef.current,
    getChunkCount: () => chunkCountRef.current,
  };
}
