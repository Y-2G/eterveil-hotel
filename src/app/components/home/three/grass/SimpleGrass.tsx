/**
 * SimpleGrass - 軽量な草システム
 *
 * パフォーマンス最適化:
 * - 単一のInstancedMeshで全草を描画（1ドローコール）
 * - 共有ShaderMaterial
 * - GPU側で揺れアニメーション
 * - 初期化時に一度だけインスタンス生成
 */

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface SimpleGrassProps {
  /** 草の総数 */
  count?: number;
  /** 配置範囲（正方形の一辺） */
  spread?: number;
  /** 草の高さ */
  height?: number;
  /** 草の幅 */
  width?: number;
  /** 基本色 */
  baseColor?: THREE.Color;
  /** 揺れの強さ */
  swayStrength?: number;
  /** 揺れの速度 */
  swaySpeed?: number;
  /** 配置の中心位置 */
  position?: [number, number, number];
  /** 高さオフセット（地面からの高さ）- terrainがない場合に使用 */
  groundY?: number;
  /** 地形メッシュ（頂点位置を取得して草を配置） */
  terrain?: THREE.Object3D | null;
}

// シード付き乱数生成器（Mulberry32 - より長い周期）
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 三角形データ（面積と頂点位置を保持） */
interface TerrainTriangle {
  v0: THREE.Vector3;
  v1: THREE.Vector3;
  v2: THREE.Vector3;
  area: number;
}

/**
 * 地形メッシュから上向きの三角形を抽出
 */
function extractTerrainTriangles(
  terrain: THREE.Object3D,
  minNormalY: number = 0.5
): TerrainTriangle[] {
  const triangles: TerrainTriangle[] = [];
  const worldMatrix = new THREE.Matrix4();
  const normalMatrix = new THREE.Matrix3();

  terrain.traverse((node) => {
    if (node instanceof THREE.Mesh && node.geometry) {
      const geometry = node.geometry;
      const positionAttr = geometry.getAttribute("position");
      const indexAttr = geometry.getIndex();

      if (!positionAttr) return;

      // ワールド変換行列を取得
      node.updateWorldMatrix(true, false);
      worldMatrix.copy(node.matrixWorld);
      normalMatrix.getNormalMatrix(worldMatrix);

      const getVertex = (index: number): THREE.Vector3 => {
        const v = new THREE.Vector3(
          positionAttr.getX(index),
          positionAttr.getY(index),
          positionAttr.getZ(index)
        );
        v.applyMatrix4(worldMatrix);
        return v;
      };

      // インデックスがある場合とない場合で処理を分ける
      const numTriangles = indexAttr
        ? indexAttr.count / 3
        : positionAttr.count / 3;

      for (let i = 0; i < numTriangles; i++) {
        let i0: number, i1: number, i2: number;

        if (indexAttr) {
          i0 = indexAttr.getX(i * 3);
          i1 = indexAttr.getX(i * 3 + 1);
          i2 = indexAttr.getX(i * 3 + 2);
        } else {
          i0 = i * 3;
          i1 = i * 3 + 1;
          i2 = i * 3 + 2;
        }

        const v0 = getVertex(i0);
        const v1 = getVertex(i1);
        const v2 = getVertex(i2);

        // 面の法線を計算
        const edge1 = new THREE.Vector3().subVectors(v1, v0);
        const edge2 = new THREE.Vector3().subVectors(v2, v0);
        const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

        // 上向きの面のみ採用
        if (normal.y < minNormalY) continue;

        // 三角形の面積を計算
        const area = new THREE.Vector3().crossVectors(edge1, edge2).length() / 2;
        
        // 極端に小さい三角形は除外
        if (area < 0.001) continue;

        triangles.push({ v0, v1, v2, area });
      }
    }
  });

  return triangles;
}

/**
 * 三角形内のランダムな点を生成（重心座標を使用）
 */
function randomPointInTriangle(
  v0: THREE.Vector3,
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  random: () => number
): THREE.Vector3 {
  let r1 = random();
  let r2 = random();

  // 重心座標で均一分布を実現
  if (r1 + r2 > 1) {
    r1 = 1 - r1;
    r2 = 1 - r2;
  }

  const r3 = 1 - r1 - r2;

  return new THREE.Vector3(
    v0.x * r1 + v1.x * r2 + v2.x * r3,
    v0.y * r1 + v1.y * r2 + v2.y * r3,
    v0.z * r1 + v1.z * r2 + v2.z * r3
  );
}

/**
 * 軽量草システム
 */
export function SimpleGrass({
  count = 1000,
  spread = 50,
  height = 0.3,
  width = 0.08,
  baseColor = new THREE.Color(0x3d6b1e),
  swayStrength = 0.15,
  swaySpeed = 1.2,
  position = [0, 0, 0],
  groundY = 0,
  terrain = null,
}: SimpleGrassProps): React.ReactElement | null {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // ジオメトリ（草の形状 - シンプルな三角形）
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    // 草のブレード形状（三角形2枚でクロス配置）
    const vertices = new Float32Array([
      // 三角形1（正面）
      -width / 2,
      0,
      0,
      width / 2,
      0,
      0,
      0,
      height,
      0,
      // 三角形2（90度回転）
      0,
      0,
      -width / 2,
      0,
      0,
      width / 2,
      0,
      height,
      0,
    ]);

    const uvs = new Float32Array([0, 0, 1, 0, 0.5, 1, 0, 0, 1, 0, 0.5, 1]);

    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.computeVertexNormals();

    return geo;
  }, [height, width]);

  // シェーダーマテリアル
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSwayStrength: { value: swayStrength },
        uSwaySpeed: { value: swaySpeed },
        uBaseColor: { value: baseColor },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uSwayStrength;
        uniform float uSwaySpeed;

        varying vec2 vUv;
        varying float vHeight;

        // 簡易ノイズ
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          vUv = uv;
          vHeight = uv.y;

          // インスタンスのワールド位置を取得
          vec4 worldPos = instanceMatrix * vec4(position, 1.0);
          
          // 高さに応じた揺れ（根元は動かない、先端が最も揺れる）
          float swayFactor = vHeight * vHeight;
          
          // 位置ベースのオフセットでバラつきを出す
          float phase = hash(worldPos.xz) * 6.28318;
          float windX = sin(uTime * uSwaySpeed + worldPos.x * 0.5 + phase) * uSwayStrength * swayFactor;
          float windZ = cos(uTime * uSwaySpeed * 0.8 + worldPos.z * 0.5 + phase) * uSwayStrength * swayFactor * 0.5;

          vec3 displaced = position;
          displaced.x += windX;
          displaced.z += windZ;

          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(displaced, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uBaseColor;

        varying vec2 vUv;
        varying float vHeight;

        void main() {
          // 高さによるグラデーション（根元は暗く、先端は明るく）
          float ao = mix(0.4, 1.0, vHeight);
          
          // 先端を少し黄緑に
          vec3 tipColor = uBaseColor + vec3(0.1, 0.15, -0.05);
          vec3 color = mix(uBaseColor * 0.7, tipColor, vHeight);
          
          color *= ao;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: false,
    });
  }, [baseColor, swayStrength, swaySpeed]);

  // インスタンス行列を初期化
  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const matrix = new THREE.Matrix4();
    const positionVec = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const random = seededRandom(12345);

    let placedCount = 0;

    if (terrain) {
      // 地形がある場合：三角形の面内にランダム配置
      const triangles = extractTerrainTriangles(terrain, 0.5);
      console.log(`[SimpleGrass] Extracted ${triangles.length} terrain triangles`);

      if (triangles.length === 0) {
        console.log(`[SimpleGrass] No valid triangles found`);
        mesh.count = 0;
        mesh.instanceMatrix.needsUpdate = true;
        return;
      }

      // 範囲内の三角形をフィルタリング
      const centerX = position[0];
      const centerZ = position[2];
      const maxRadius = spread / 2;
      const maxRadiusSq = maxRadius * maxRadius;

      const filteredTriangles = spread > 0
        ? triangles.filter((tri) => {
            // 三角形の重心が範囲内かチェック
            const cx = (tri.v0.x + tri.v1.x + tri.v2.x) / 3;
            const cz = (tri.v0.z + tri.v1.z + tri.v2.z) / 3;
            const dx = cx - centerX;
            const dz = cz - centerZ;
            return dx * dx + dz * dz <= maxRadiusSq;
          })
        : triangles;

      console.log(`[SimpleGrass] ${filteredTriangles.length} triangles in range`);

      if (filteredTriangles.length === 0) {
        console.log(`[SimpleGrass] No triangles in range, using all`);
        filteredTriangles.push(...triangles);
      }

      // 総面積を計算
      const totalArea = filteredTriangles.reduce((sum, tri) => sum + tri.area, 0);

      // 面積に比例して各三角形に草を配分
      for (const tri of filteredTriangles) {
        const grassCount = Math.ceil((tri.area / totalArea) * count);

        for (let i = 0; i < grassCount && placedCount < count; i++) {
          const point = randomPointInTriangle(tri.v0, tri.v1, tri.v2, random);
          positionVec.copy(point);

          quaternion.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            random() * Math.PI * 2
          );

          const s = 0.6 + random() * 0.8;
          scale.set(s, s, s);

          matrix.compose(positionVec, quaternion, scale);
          mesh.setMatrixAt(placedCount, matrix);
          placedCount++;
        }
      }
    } else {
      // 地形がない場合は従来通りフラットに配置
      for (let i = 0; i < count; i++) {
        const angle = random() * Math.PI * 2;
        const radius = Math.sqrt(random()) * (spread / 2);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        positionVec.set(position[0] + x, groundY, position[2] + z);

        quaternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          random() * Math.PI * 2
        );

        const s = 0.6 + random() * 0.8;
        scale.set(s, s, s);

        matrix.compose(positionVec, quaternion, scale);
        mesh.setMatrixAt(i, matrix);
        placedCount++;
      }
    }

    mesh.count = placedCount;
    mesh.instanceMatrix.needsUpdate = true;
    console.log(`[SimpleGrass] Placed ${placedCount} grass instances`);
  }, [count, spread, position, groundY, terrain]);

  // uniformsをリアルタイム更新
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uSwayStrength.value = swayStrength;
      materialRef.current.uniforms.uSwaySpeed.value = swaySpeed;
      materialRef.current.uniforms.uBaseColor.value = baseColor;
    }
  }, [swayStrength, swaySpeed, baseColor]);

  // アニメーション更新（1回のuniform更新のみ）
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={true}
      castShadow={false}
      receiveShadow={false}
    >
      <primitive object={material} ref={materialRef} attach="material" />
    </instancedMesh>
  );
}

export default SimpleGrass;
