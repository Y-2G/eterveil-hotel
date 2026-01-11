/**
 * 地形高さサンプラー
 * 草を地形上に配置するための高さ取得機能を提供
 *
 * 設計ポイント:
 * - 抽象化されたインターフェースで、将来的にheightmap方式に差し替え可能
 * - Raycastは再生成時のみ実行（毎フレーム実行しない）
 * - キャッシュ機能でパフォーマンス向上
 */

import * as THREE from "three";

/** 高さ取得関数の型 */
export type HeightSampler = (x: number, z: number) => number;

/** キャッシュのキーを生成（小数点以下1桁で丸める） */
function getCacheKey(x: number, z: number): string {
  return `${Math.round(x * 10) / 10},${Math.round(z * 10) / 10}`;
}

/**
 * Raycast方式の高さサンプラーを作成
 *
 * 注意:
 * - 毎フレーム大量に呼び出すとパフォーマンスに影響
 * - チャンク再生成時のみ使用すること
 * - 結果はキャッシュされる
 *
 * @param terrain - 地形メッシュ（Mesh または Group）
 * @param rayOriginY - レイの発射位置（高さ）- 地形より高い位置を指定
 * @param defaultHeight - 地形にヒットしなかった場合のデフォルト高さ
 * @returns 高さ取得関数
 */
export function createRaycastHeightSampler(
  terrain: THREE.Mesh | THREE.Group | null,
  rayOriginY: number = 1000,
  defaultHeight: number = 0
): HeightSampler {
  // キャッシュ用Map
  const cache = new Map<string, number>();

  // Raycaster（再利用）
  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3();
  const rayDirection = new THREE.Vector3(0, -1, 0); // 真下向き

  // 地形がない場合はデフォルト高さを返す
  if (!terrain) {
    return () => defaultHeight;
  }

  // Raycast対象オブジェクトを収集
  const raycastTargets: THREE.Object3D[] = [];
  if (terrain instanceof THREE.Mesh) {
    raycastTargets.push(terrain);
  } else if (terrain instanceof THREE.Group) {
    terrain.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        raycastTargets.push(child);
      }
    });
  }

  // Raycast対象がない場合
  if (raycastTargets.length === 0) {
    console.warn("[HeightSampler] No meshes found in terrain");
    return () => defaultHeight;
  }

  return (x: number, z: number): number => {
    // キャッシュをチェック
    const key = getCacheKey(x, z);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Raycast実行
    rayOrigin.set(x, rayOriginY, z);
    raycaster.set(rayOrigin, rayDirection);

    const intersects = raycaster.intersectObjects(raycastTargets, true);

    let height: number;
    if (intersects.length > 0) {
      height = intersects[0].point.y;
    } else {
      height = defaultHeight;
    }

    // キャッシュに保存
    cache.set(key, height);

    return height;
  };
}

/**
 * フラット（平面）の高さサンプラーを作成
 * テストや地形がない場合に使用
 *
 * @param height - 固定の高さ
 * @returns 高さ取得関数
 */
export function createFlatHeightSampler(height: number = 0): HeightSampler {
  return () => height;
}

/**
 * ハイトマップ方式の高さサンプラーを作成（将来用）
 *
 * TODO: 将来的にテクスチャベースのハイトマップに対応
 *
 * @param heightMapData - ハイトマップデータ（Float32Array）
 * @param width - ハイトマップの幅（ピクセル）
 * @param depth - ハイトマップの深さ（ピクセル）
 * @param worldWidth - ワールド座標での幅
 * @param worldDepth - ワールド座標での深さ
 * @param heightScale - 高さのスケール
 * @param offsetX - ワールド座標のオフセットX
 * @param offsetZ - ワールド座標のオフセットZ
 * @returns 高さ取得関数
 */
export function createHeightMapSampler(
  heightMapData: Float32Array,
  width: number,
  depth: number,
  worldWidth: number,
  worldDepth: number,
  heightScale: number = 1,
  offsetX: number = 0,
  offsetZ: number = 0
): HeightSampler {
  return (x: number, z: number): number => {
    // ワールド座標をハイトマップ座標に変換
    const localX = x - offsetX;
    const localZ = z - offsetZ;

    // 正規化座標（0〜1）
    const u = localX / worldWidth + 0.5;
    const v = localZ / worldDepth + 0.5;

    // 範囲外チェック
    if (u < 0 || u > 1 || v < 0 || v > 1) {
      return 0;
    }

    // ピクセル座標
    const px = Math.floor(u * (width - 1));
    const pz = Math.floor(v * (depth - 1));

    // バイリニア補間用の4点を取得
    const px0 = Math.min(px, width - 1);
    const px1 = Math.min(px + 1, width - 1);
    const pz0 = Math.min(pz, depth - 1);
    const pz1 = Math.min(pz + 1, depth - 1);

    const h00 = heightMapData[pz0 * width + px0];
    const h10 = heightMapData[pz0 * width + px1];
    const h01 = heightMapData[pz1 * width + px0];
    const h11 = heightMapData[pz1 * width + px1];

    // バイリニア補間
    const fx = u * (width - 1) - px;
    const fz = v * (depth - 1) - pz;

    const h0 = h00 * (1 - fx) + h10 * fx;
    const h1 = h01 * (1 - fx) + h11 * fx;
    const height = h0 * (1 - fz) + h1 * fz;

    return height * heightScale;
  };
}

/**
 * 複合高さサンプラー（複数の地形を合成）
 * 例: メイン地形 + 水面など
 *
 * @param samplers - 高さサンプラーの配列
 * @param mode - 合成モード（"max" | "min" | "average"）
 * @returns 高さ取得関数
 */
export function createCompositeHeightSampler(
  samplers: HeightSampler[],
  mode: "max" | "min" | "average" = "max"
): HeightSampler {
  if (samplers.length === 0) {
    return () => 0;
  }
  if (samplers.length === 1) {
    return samplers[0];
  }

  return (x: number, z: number): number => {
    const heights = samplers.map((s) => s(x, z));

    switch (mode) {
      case "max":
        return Math.max(...heights);
      case "min":
        return Math.min(...heights);
      case "average":
        return heights.reduce((a, b) => a + b, 0) / heights.length;
    }
  };
}

/**
 * キャッシュをクリアする機能を持つサンプラーを作成
 * メモリ管理やチャンク破棄時に使用
 *
 * @param terrain - 地形メッシュ
 * @param options - オプション
 * @returns サンプラーとキャッシュクリア関数
 */
export function createCacheableHeightSampler(
  terrain: THREE.Mesh | THREE.Group | null,
  options: {
    rayOriginY?: number;
    defaultHeight?: number;
    maxCacheSize?: number;
  } = {}
): {
  sample: HeightSampler;
  clearCache: () => void;
  getCacheSize: () => number;
} {
  const {
    rayOriginY = 1000,
    defaultHeight = 0,
    maxCacheSize = 10000,
  } = options;

  const cache = new Map<string, number>();
  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3();
  const rayDirection = new THREE.Vector3(0, -1, 0);

  // Raycast対象
  const raycastTargets: THREE.Object3D[] = [];
  if (terrain instanceof THREE.Mesh) {
    raycastTargets.push(terrain);
  } else if (terrain instanceof THREE.Group) {
    terrain.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        raycastTargets.push(child);
      }
    });
  }

  const sample: HeightSampler = (x: number, z: number): number => {
    if (raycastTargets.length === 0) {
      return defaultHeight;
    }

    const key = getCacheKey(x, z);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // キャッシュサイズ制限
    if (cache.size >= maxCacheSize) {
      // 古いエントリを削除（簡易的なLRU）
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    rayOrigin.set(x, rayOriginY, z);
    raycaster.set(rayOrigin, rayDirection);

    const intersects = raycaster.intersectObjects(raycastTargets, true);
    const height =
      intersects.length > 0 ? intersects[0].point.y : defaultHeight;

    cache.set(key, height);
    return height;
  };

  return {
    sample,
    clearCache: () => cache.clear(),
    getCacheSize: () => cache.size,
  };
}
