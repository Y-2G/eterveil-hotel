/**
 * GrassChunk - 単一チャンクの草を描画するコンポーネント
 *
 * 設計ポイント:
 * - InstancedMeshで効率的に描画
 * - 影はオフ（castShadow/receiveShadow = false）
 * - マテリアルは親コンポーネントから共有（メモリ節約）
 */

import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  GrassChunkProps,
  ChunkBoundaryProps,
  GrassInstanceData,
} from "./grassTypes";
import {
  createGrassCardGeometry,
  updateGrassShaderUniforms,
} from "./grassShader";

/**
 * 草チャンクコンポーネント
 * 1チャンク = 1つのInstancedMesh
 */
export function GrassChunk({
  chunkData,
  instances,
  config,
}: GrassChunkProps): React.ReactElement | null {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // ジオメトリをメモ化（チャンク間で共有可能だが、ここでは個別に作成）
  const geometry = useMemo(() => {
    return createGrassCardGeometry(0.15, config.baseScale);
  }, [config.baseScale]);

  // マテリアルを作成（本来は親から渡すべきだが、簡易実装）
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSwayStrength: { value: config.swayStrength },
        uSwaySpeed: { value: config.swaySpeed },
        uBaseColor: { value: config.baseColor },
        uGrassTexture: { value: null },
        uUseTexture: { value: false },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uSwayStrength;
        uniform float uSwaySpeed;

        varying vec2 vUv;
        varying vec3 vColor;
        varying float vHeightRatio;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

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
          
          #ifdef USE_INSTANCING_COLOR
            vColor = instanceColor;
          #else
            vColor = vec3(1.0);
          #endif

          vHeightRatio = uv.y;
          vec4 worldPos = instanceMatrix * vec4(position, 1.0);
          float swayFactor = vHeightRatio * vHeightRatio;
          float noiseX = noise(worldPos.xz * 0.1 + uTime * uSwaySpeed * 0.3);
          float noiseZ = noise(worldPos.xz * 0.1 + uTime * uSwaySpeed * 0.3 + 100.0);
          
          vec3 swayOffset = vec3(
            (noiseX - 0.5) * uSwayStrength * swayFactor,
            0.0,
            (noiseZ - 0.5) * uSwayStrength * swayFactor
          );

          vec3 finalPosition = position + swayOffset;
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(finalPosition, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uBaseColor;

        varying vec2 vUv;
        varying vec3 vColor;
        varying float vHeightRatio;

        void main() {
          float centerDist = abs(vUv.x - 0.5) * 2.0;
          float grassShape = 1.0 - smoothstep(0.0, 0.8, centerDist + (1.0 - vUv.y) * 0.5);
          
          if (grassShape < 0.6) {
            discard;
          }

          vec3 finalColor = uBaseColor * vColor;
          float ao = mix(0.5, 1.0, vHeightRatio);
          finalColor *= ao;
          finalColor += vec3(0.05) * vHeightRatio;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: false,
      depthWrite: true,
    });
  }, [config.baseColor, config.swayStrength, config.swaySpeed]);

  // インスタンス行列を設定
  useEffect(() => {
    if (!meshRef.current || instances.length === 0) return;

    const mesh = meshRef.current;
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();

    // instanceColorを有効化
    if (!mesh.instanceColor) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(instances.length * 3),
        3
      );
    }

    instances.forEach((instance: GrassInstanceData, i: number) => {
      // 回転（Y軸）
      quaternion.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        instance.rotation
      );

      // スケール
      scale.set(instance.scale, instance.scale, instance.scale);

      // 行列を設定
      matrix.compose(instance.position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);

      // 色バリエーション（明度オフセット）
      const hsl = { h: 0, s: 0, l: 0 };
      config.baseColor.getHSL(hsl);
      color.setHSL(
        hsl.h,
        hsl.s,
        Math.max(0, Math.min(1, hsl.l + instance.colorOffset))
      );
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [instances, config.baseColor]);

  // 揺れアニメーションの更新
  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    if (mat.uniforms) {
      updateGrassShaderUniforms(mat, state.clock.elapsedTime);
    }
  });

  // インスタンスがない場合は描画しない
  if (instances.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, instances.length]}
      frustumCulled={true}
      castShadow={false}
      receiveShadow={false}
    />
  );
}

/**
 * デバッグ用チャンク境界表示
 */
export function ChunkBoundary({
  chunkData,
  chunkSize,
}: ChunkBoundaryProps): React.ReactElement {
  // 距離帯に応じて色を変える
  const color = useMemo(() => {
    switch (chunkData.densityTierIndex) {
      case 0:
        return "#00ff00"; // 近距離：緑
      case 1:
        return "#ffff00"; // 中距離：黄
      case 2:
        return "#ff8800"; // 遠距離：オレンジ
      default:
        return "#ff0000"; // 範囲外：赤
    }
  }, [chunkData.densityTierIndex]);

  return (
    <mesh
      position={[
        chunkData.worldPosition.x,
        chunkData.worldPosition.y + 0.1, // 少し浮かせる
        chunkData.worldPosition.z,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[chunkSize * 0.95, chunkSize * 0.95]} />
      <meshBasicMaterial
        color={color}
        wireframe={true}
        transparent={true}
        opacity={0.5}
      />
    </mesh>
  );
}

/**
 * チャンク情報のデバッグ表示（コンソール出力用）
 */
export function logChunkInfo(
  chunkKey: string,
  instanceCount: number,
  distanceToPlayer: number
): void {
  console.log(
    `[GrassChunk] ${chunkKey}: ${instanceCount} instances, distance: ${distanceToPlayer.toFixed(
      1
    )}m`
  );
}
