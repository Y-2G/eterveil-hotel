export type ModelConfig = {
  positionX: number;
  positionY: number;
  positionZ: number;
  scaleValue: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
};

export type SkyConfig = {
  // 太陽の高度（0-90度: 0=地平線、90=天頂）
  elevation: number;
  // 太陽の方位角（0-360度: 0=北、90=東、180=南、270=西）
  azimuth: number;
  // 大気の濁り具合（1-20: 値が大きいほど霞んだ空）
  turbidity: number;
  // レイリー散乱係数（0-4: 青空の強さ）
  rayleigh: number;
  // ミー散乱係数（0-0.1: 大気中の粒子による散乱）
  mieCoefficient: number;
  // ミー散乱の方向性（0-1: 太陽周辺の輝き）
  mieDirectionalG: number;
};

export type OceanConfig = {
  positionX: number;
  positionY: number;
  positionZ: number;
};

export type FogConfig = {
  enabled: boolean;
  color: string;
  near: number;
  far: number;
};

export type BlueOrbConfig = {
  // デバッグ用: 常に表示
  alwaysVisible: boolean;
  positionX: number;
  positionY: number;
  positionZ: number;
  scale: number;
  // コアの色
  coreColor: string;
  // 発光色
  emissiveColor: string;
  // 発光強度
  emissiveIntensity: number;
  // グロー色
  glowColor: string;
  // グローの不透明度
  glowOpacity: number;
  // ライトの強度
  lightIntensity: number;
  // ライトの距離
  lightDistance: number;
  // 浮遊の振幅
  floatAmplitude: number;
  // 浮遊の速度
  floatSpeed: number;
  // 回転速度
  rotationSpeed: number;
};

export type GrassConfig = {
  // 有効/無効
  enabled: boolean;
  // 草の総数
  count: number;
  // 配置範囲（正方形の一辺）
  spread: number;
  // 草の高さ
  height: number;
  // 草の幅
  width: number;
  // 基本色（hex）
  baseColor: string;
  // 揺れの強さ
  swayStrength: number;
  // 揺れの速度
  swaySpeed: number;
  // 配置位置
  positionX: number;
  positionY: number;
  positionZ: number;
};

export type CameraConfig = {
  positionX: number;
  positionY: number;
  positionZ: number;
  fov: number;
  // 注視点
  targetX: number;
  targetY: number;
  targetZ: number;
};

export type HotelLightConfig = {
  // 有効/無効
  enabled: boolean;
  // 位置
  positionX: number;
  positionY: number;
  positionZ: number;
  // 色
  color: string;
  // 強度
  intensity: number;
  // パワー（ワット）
  power: number;
  // 距離
  distance: number;
  // 減衰
  decay: number;
};

export type HotelLightsConfig = {
  showHelpers: boolean;
  helperSize: number;
  light1: HotelLightConfig;
  light2: HotelLightConfig;
  light3: HotelLightConfig;
  light4: HotelLightConfig;
};

export type NeonSignConfig = {
  enabled: boolean;
  showHelpers: boolean;
  helperSize: number;
  // 縦書きサイン
  verticalSign: {
    enabled: boolean;
    text: string;
    positionX: number;
    positionY: number;
    positionZ: number;
    rotationY: number;
    fontSize: number;
    color: string;
    emissiveIntensity: number;
    letterSpacing: number;
  };
  // 横書きサイン
  horizontalSign: {
    enabled: boolean;
    text: string;
    positionX: number;
    positionY: number;
    positionZ: number;
    rotationY: number;
    fontSize: number;
    color: string;
    emissiveIntensity: number;
  };
  // グロー効果
  glowIntensity: number;
  // 点滅効果
  flickerEnabled: boolean;
  flickerSpeed: number;
  flickerIntensity: number;
};

export type BloomConfig = {
  // 有効/無効
  enabled: boolean;
  // Bloomの強度
  intensity: number;
  // 明るさの閾値（この値以上の明るさにBloomを適用）
  luminanceThreshold: number;
  // 閾値の滑らかさ
  luminanceSmoothing: number;
  // Bloomの半径（ぼかしの広がり）
  radius: number;
};

export type GroundFogConfig = {
  // 有効/無効
  enabled: boolean;
  // 霧の色
  color: string;
  // 霧の濃度 (0-1)
  density: number;
  // 霧の高さ
  height: number;
  // ノイズのスケール
  noiseScale: number;
  // ノイズのシード
  noiseSeed: number;
  // ノイズの移動速度
  noiseSpeed: number;
  // 不透明度
  opacity: number;
  // 配置位置
  positionX: number;
  positionY: number;
  positionZ: number;
  // サイズ
  size: number;
  // セグメント数
  segments: number;
  // カメラに追従するか
  followCamera: boolean;
  // カメラからのオフセット（Y軸）
  cameraOffsetY: number;
};

export type DissolveConfig = {
  startDistance: number;
  endDistance: number;
  worldMaxPoints: number;
  worldPointSize: number;
  hotelMaxPoints: number;
  hotelPointSize: number;
  skyPointSize: number;
  oceanPointSize: number;
  scatterStart: number;
  modelStart: number;
  modelEnd: number;
  skyStart: number;
  skyEnd: number;
  oceanStart: number;
  oceanEnd: number;
  fogStart: number;
  fogEnd: number;
};

export type DebugConfig = {
  hotel: ModelConfig;
  world: ModelConfig;
  sky: SkyConfig;
  ocean: OceanConfig;
  fog: FogConfig;
  blueOrb: BlueOrbConfig;
  grass: GrassConfig;
  camera: CameraConfig;
  dissolve: DissolveConfig;
  groundFog: GroundFogConfig;
  hotelLights: HotelLightsConfig;
  neonSign: NeonSignConfig;
  bloom: BloomConfig;
};
