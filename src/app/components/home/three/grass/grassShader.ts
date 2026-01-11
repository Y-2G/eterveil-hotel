/**
 * 草シェーダー
 * 軽量な揺れアニメーションを頂点シェーダーで実現
 *
 * 設計ポイント:
 * - 透過ブレンドを避け、alphaTest寄せで実装
 * - 揺れは時間 + 位置ノイズで軽量に
 * - インスタンス属性で色バリエーションを実現
 */

import * as THREE from "three";

/**
 * 草シェーダーのユニフォーム
 */
export interface GrassShaderUniforms {
  /** 時間（アニメーション用） */
  uTime: { value: number };
  /** 揺れの強さ */
  uSwayStrength: { value: number };
  /** 揺れの速度 */
  uSwaySpeed: { value: number };
  /** 基本色 */
  uBaseColor: { value: THREE.Color };
  /** 草テクスチャ（オプション） */
  uGrassTexture: { value: THREE.Texture | null };
  /** テクスチャを使用するか */
  uUseTexture: { value: boolean };
  /** インデックスシグネチャ（THREE.ShaderMaterial互換） */
  [key: string]: { value: unknown };
}

/**
 * デフォルトのユニフォームを作成
 */
export function createGrassUniforms(
  baseColor: THREE.Color = new THREE.Color(0x4a7c23),
  texture: THREE.Texture | null = null
): GrassShaderUniforms {
  return {
    uTime: { value: 0 },
    uSwayStrength: { value: 0.1 },
    uSwaySpeed: { value: 1.0 },
    uBaseColor: { value: baseColor },
    uGrassTexture: { value: texture },
    uUseTexture: { value: texture !== null },
  };
}

/**
 * 草の頂点シェーダー
 *
 * 特徴:
 * - インスタンス化対応（instanceMatrix使用）
 * - 上部の頂点のみ揺れ（根元は固定）
 * - 軽量なノイズベースの揺れ
 * - 色バリエーション対応（instanceColor使用）
 */
export const grassVertexShader = /* glsl */ `
  // ユニフォーム
  uniform float uTime;
  uniform float uSwayStrength;
  uniform float uSwaySpeed;

  // バリイング（フラグメントシェーダーへ渡す）
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vHeightRatio;

  // 簡易ノイズ関数（軽量）
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // スムースノイズ
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vUv = uv;

    // インスタンスカラー（instanceColorが有効な場合のみ）
    #ifdef USE_INSTANCING_COLOR
      vColor = instanceColor;
    #else
      vColor = vec3(1.0);
    #endif

    // 草の高さ比率（0 = 根元、1 = 頂点）
    // UV.yを使用（草カードは縦方向にUVが設定されている前提）
    vHeightRatio = uv.y;

    // ワールド位置を取得（揺れのノイズシードに使用）
    vec4 worldPos = instanceMatrix * vec4(position, 1.0);

    // 揺れの計算（上部のみ、根元は固定）
    float swayFactor = vHeightRatio * vHeightRatio; // 二乗で上部ほど大きく揺れる
    
    // 位置ベースのノイズ（同じ位置の草は同期して揺れる）
    float noiseX = noise(worldPos.xz * 0.1 + uTime * uSwaySpeed * 0.3);
    float noiseZ = noise(worldPos.xz * 0.1 + uTime * uSwaySpeed * 0.3 + 100.0);
    
    // 揺れを適用
    vec3 swayOffset = vec3(
      (noiseX - 0.5) * uSwayStrength * swayFactor,
      0.0,
      (noiseZ - 0.5) * uSwayStrength * swayFactor
    );

    // 最終位置を計算
    vec3 finalPosition = position + swayOffset;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(finalPosition, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * 草のフラグメントシェーダー
 *
 * 特徴:
 * - alphaTest寄せ（transparent: false）
 * - 色バリエーション対応
 * - 簡易的なアンビエントオクルージョン（根元が暗く）
 */
export const grassFragmentShader = /* glsl */ `
  // ユニフォーム
  uniform vec3 uBaseColor;
  uniform sampler2D uGrassTexture;
  uniform bool uUseTexture;

  // バリイング
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vHeightRatio;

  void main() {
    vec4 texColor;
    
    if (uUseTexture) {
      texColor = texture2D(uGrassTexture, vUv);
    } else {
      // テクスチャがない場合は単純な草の形を生成
      // 草カードの形状をUVで表現
      float centerDist = abs(vUv.x - 0.5) * 2.0;
      float grassShape = 1.0 - smoothstep(0.0, 0.8, centerDist + (1.0 - vUv.y) * 0.5);
      texColor = vec4(1.0, 1.0, 1.0, grassShape);
    }

    // alphaTestで透明部分をディスカード
    if (texColor.a < 0.6) {
      discard;
    }

    // 基本色 × インスタンスカラー
    vec3 finalColor = uBaseColor * vColor;

    // 簡易AO: 根元を暗く
    float ao = mix(0.5, 1.0, vHeightRatio);
    finalColor *= ao;

    // 頂点部分を少し明るく（光が当たる感じ）
    finalColor += vec3(0.05) * vHeightRatio;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/**
 * 草マテリアルを作成
 *
 * @param baseColor - 基本色
 * @param texture - 草テクスチャ（オプション）
 * @returns ShaderMaterial
 */
export function createGrassMaterial(
  baseColor: THREE.Color = new THREE.Color(0x4a7c23),
  texture: THREE.Texture | null = null
): THREE.ShaderMaterial {
  const uniforms = createGrassUniforms(baseColor, texture);

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: grassVertexShader,
    fragmentShader: grassFragmentShader,
    side: THREE.DoubleSide,
    transparent: false,
    depthWrite: true,
    // alphaTestはシェーダー内でdiscardで処理
  });
}

/**
 * 草カードのジオメトリを作成（2枚クロス）
 *
 * @param width - カードの幅
 * @param height - カードの高さ
 * @returns BufferGeometry
 */
export function createGrassCardGeometry(
  width: number = 0.15,
  height: number = 0.6
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  // 2枚のクロスする板ポリ
  // 1枚目: Z軸に平行
  // 2枚目: X軸に平行（90度回転）
  const halfWidth = width / 2;

  // 頂点位置（2枚のカード = 8頂点）
  const positions = new Float32Array([
    // カード1（Z軸平行）
    -halfWidth,
    0,
    0, // 左下
    halfWidth,
    0,
    0, // 右下
    halfWidth,
    height,
    0, // 右上
    -halfWidth,
    height,
    0, // 左上

    // カード2（X軸平行）
    0,
    0,
    -halfWidth, // 左下
    0,
    0,
    halfWidth, // 右下
    0,
    height,
    halfWidth, // 右上
    0,
    height,
    -halfWidth, // 左上
  ]);

  // UV座標
  const uvs = new Float32Array([
    // カード1
    0, 0, 1, 0, 1, 1, 0, 1,
    // カード2
    0, 0, 1, 0, 1, 1, 0, 1,
  ]);

  // インデックス（三角形）
  const indices = new Uint16Array([
    // カード1
    0, 1, 2, 0, 2, 3,
    // カード2
    4, 5, 6, 4, 6, 7,
  ]);

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  geometry.computeVertexNormals();

  return geometry;
}

/**
 * 3枚クロスの草カードジオメトリを作成
 * より自然な見た目になるが、ポリゴン数が増える
 *
 * @param width - カードの幅
 * @param height - カードの高さ
 * @returns BufferGeometry
 */
export function createGrassCardGeometry3(
  width: number = 0.15,
  height: number = 0.6
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const halfWidth = width / 2;

  // 3枚のカード（60度ずつ回転）
  const angles = [0, Math.PI / 3, (Math.PI * 2) / 3];
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  angles.forEach((angle, cardIndex) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // 4頂点を追加
    const baseIndex = cardIndex * 4;

    // 左下
    positions.push(-halfWidth * cos, 0, -halfWidth * sin);
    // 右下
    positions.push(halfWidth * cos, 0, halfWidth * sin);
    // 右上
    positions.push(halfWidth * cos, height, halfWidth * sin);
    // 左上
    positions.push(-halfWidth * cos, height, -halfWidth * sin);

    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);

    indices.push(
      baseIndex,
      baseIndex + 1,
      baseIndex + 2,
      baseIndex,
      baseIndex + 2,
      baseIndex + 3
    );
  });

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array(uvs), 2)
  );
  geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

  geometry.computeVertexNormals();

  return geometry;
}

/**
 * シェーダーユニフォームを更新（毎フレーム呼び出し）
 *
 * @param material - 草マテリアル
 * @param time - 経過時間
 * @param swayStrength - 揺れの強さ
 * @param swaySpeed - 揺れの速度
 */
export function updateGrassShaderUniforms(
  material: THREE.ShaderMaterial,
  time: number,
  swayStrength?: number,
  swaySpeed?: number
): void {
  material.uniforms.uTime.value = time;

  if (swayStrength !== undefined) {
    material.uniforms.uSwayStrength.value = swayStrength;
  }
  if (swaySpeed !== undefined) {
    material.uniforms.uSwaySpeed.value = swaySpeed;
  }
}
