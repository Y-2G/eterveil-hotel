# 草システム (Grass System)

スマホでも動作する、パフォーマンス最適化された植生システムです。

## 特徴

- **InstancedMesh** による効率的な描画
- **チャンク分割** でプレイヤー周辺のみ描画
- **距離に応じた密度調整** で描画負荷を軽減
- **透過ブレンド回避** (`alphaTest` + `discard`) でオーバードローを削減
- **影なし** で描画コストを削減

## 使用例

### 基本的な使い方

```tsx
import { useRef } from "react";
import * as THREE from "three";
import { GrassSystem } from "./grass";

function Scene() {
  const playerRef = useRef<THREE.Object3D>(null);
  const terrainRef = useRef<THREE.Mesh>(null);

  return (
    <>
      {/* プレイヤー */}
      <mesh ref={playerRef} position={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* 地形 */}
      <mesh ref={terrainRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="brown" />
      </mesh>

      {/* 草システム */}
      <GrassSystem
        playerRef={playerRef}
        terrainMesh={terrainRef.current}
        performancePreset="medium"
      />
    </>
  );
}
```

### パフォーマンスプリセット

```tsx
// 低スペックデバイス向け
<GrassSystem
  playerRef={playerRef}
  terrainMesh={terrainMesh}
  performancePreset="low"
/>

// 標準（デフォルト）
<GrassSystem
  playerRef={playerRef}
  terrainMesh={terrainMesh}
  performancePreset="medium"
/>

// 高スペックデバイス向け
<GrassSystem
  playerRef={playerRef}
  terrainMesh={terrainMesh}
  performancePreset="high"
/>
```

### カスタム設定

```tsx
import { GrassSystem, type GrassSystemConfig } from "./grass";
import * as THREE from "three";

const customConfig: Partial<GrassSystemConfig> = {
  renderRadius: 20, // 描画半径（m）
  chunkSize: 8, // チャンクサイズ（m）
  baseScale: 0.6, // 草の基本スケール
  scaleVariation: 0.4, // スケールのバリエーション
  baseColor: new THREE.Color(0x3d6b1e), // 草の色
  colorVariation: 0.2, // 色のバリエーション
  swayStrength: 0.15, // 揺れの強さ
  swaySpeed: 1.2, // 揺れの速度
  debug: true, // デバッグ表示
};

<GrassSystem
  playerRef={playerRef}
  terrainMesh={terrainMesh}
  config={customConfig}
/>;
```

### デバッグモード

```tsx
<GrassSystem
  playerRef={playerRef}
  terrainMesh={terrainMesh}
  config={{ debug: true }}
/>
```

デバッグモードを有効にすると：

- チャンク境界が色分けされて表示される（緑: 近距離、黄: 中距離、オレンジ: 遠距離）
- コンソールに総インスタンス数とチャンク数が出力される

## 密度設定

距離帯ごとのインスタンス数（デフォルト値）:

| プリセット | 0-15m | 15-25m | 25-30m |
| ---------- | ----- | ------ | ------ |
| low        | 500   | 250    | 100    |
| medium     | 1000  | 500    | 200    |
| high       | 1500  | 800    | 300    |

カスタマイズ例:

```tsx
import { GrassSystem, type DensityTier } from "./grass";

const customDensity: DensityTier[] = [
  { maxDistance: 10, clumpsPerChunk: 800 },
  { maxDistance: 20, clumpsPerChunk: 400 },
  { maxDistance: 30, clumpsPerChunk: 150 },
];

<GrassSystem
  playerRef={playerRef}
  terrainMesh={terrainMesh}
  config={{ densityTiers: customDensity }}
/>;
```

## パフォーマンス注意点

### 重くなる原因と対策

1. **インスタンス数が多すぎる**

   - `performancePreset` を `"low"` に変更
   - `densityTiers` の clumpsPerChunk を減らす
   - `renderRadius` を小さくする（20m 程度）

2. **チャンク生成が頻繁**

   - `chunkSize` を大きくする（15m など）
   - プレイヤーの移動速度が速すぎないか確認

3. **地形の Raycast が重い**

   - 地形メッシュのポリゴン数を減らす
   - 将来的には `createHeightMapSampler` に置き換え

4. **シェーダーが重い**
   - `swayStrength` を 0 にして揺れを無効化
   - ノイズ計算を簡略化（シェーダー改修）

### 推奨設定（モバイル）

```tsx
// iPhoneなどモバイル向けの保守的な設定
<GrassSystem
  playerRef={playerRef}
  terrainMesh={terrainMesh}
  performancePreset="low"
  config={{
    renderRadius: 20,
    chunkSize: 10,
    swayStrength: 0.05, // 軽い揺れ
  }}
/>
```

### デバッグ Tips

- Chrome DevTools の「Rendering」→「FPS meter」で確認
- Three.js の stats.js を追加してドローコール数を監視
- `debug: true` でチャンク状態を確認

## ファイル構成

```
grass/
├── index.ts          # エクスポートまとめ
├── grassTypes.ts     # 型定義・設定定数
├── grassUtils.ts     # ユーティリティ関数
├── heightSampler.ts  # 地形高さ取得
├── grassShader.ts    # シェーダー・ジオメトリ
├── GrassChunk.tsx    # チャンクコンポーネント
├── GrassSystem.tsx   # メインコンポーネント
└── README.md         # このファイル
```

## 調整ポイント早見表

| 調整項目               | ファイル         | 変数/関数                           |
| ---------------------- | ---------------- | ----------------------------------- |
| 密度（インスタンス数） | `grassTypes.ts`  | `DENSITY_PRESETS`                   |
| 描画範囲               | `grassTypes.ts`  | `DEFAULT_GRASS_CONFIG.renderRadius` |
| チャンクサイズ         | `grassTypes.ts`  | `DEFAULT_GRASS_CONFIG.chunkSize`    |
| 草の色                 | `grassTypes.ts`  | `DEFAULT_GRASS_CONFIG.baseColor`    |
| 草のサイズ             | `grassTypes.ts`  | `DEFAULT_GRASS_CONFIG.baseScale`    |
| 揺れの強さ             | `grassTypes.ts`  | `DEFAULT_GRASS_CONFIG.swayStrength` |
| 草カードの形状         | `grassShader.ts` | `createGrassCardGeometry()`         |
| シェーダーの揺れ       | `GrassChunk.tsx` | vertexShader 内の noise 計算        |

## 将来の改善案

1. **LOD（Level of Detail）**

   - 遠距離は 1 枚カード、近距離は 2-3 枚クロス

2. **ハイトマップ方式**

   - Raycast の代わりにテクスチャから高さ取得

3. **テクスチャアトラス**

   - 複数種類の草テクスチャを使用

4. **風ゾーン**

   - 特定エリアで風の影響を変える

5. **踏み倒し演出**
   - プレイヤー周辺の草が倒れる演出
