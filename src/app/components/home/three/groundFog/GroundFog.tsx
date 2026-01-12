"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createFogMaterial } from "./fogShader";

export type GroundFogConfig = {
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

export const defaultGroundFogConfig: GroundFogConfig = {
  enabled: true,
  color: "#8899aa",
  density: 0.8,
  height: 15.0,
  noiseScale: 0.015,
  noiseSeed: 0.0,
  noiseSpeed: 0.3,
  opacity: 0.5,
  positionX: 0,
  positionY: 0.5,
  positionZ: 0,
  size: 300,
  segments: 64,
  followCamera: false,
  cameraOffsetY: -5,
};

type GroundFogProps = {
  config?: Partial<GroundFogConfig>;
};

export const GroundFog = ({ config }: GroundFogProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();

  const mergedConfig = useMemo(
    () => ({ ...defaultGroundFogConfig, ...config }),
    [config]
  );

  const material = useMemo(() => {
    return createFogMaterial({
      fogColor: new THREE.Color(mergedConfig.color),
      fogDensity: mergedConfig.density,
      fogHeight: mergedConfig.height,
      noiseScale: mergedConfig.noiseScale,
      noiseSeed: mergedConfig.noiseSeed,
      noiseSpeed: mergedConfig.noiseSpeed,
      opacity: mergedConfig.opacity,
    });
  }, [
    mergedConfig.color,
    mergedConfig.density,
    mergedConfig.height,
    mergedConfig.noiseScale,
    mergedConfig.noiseSeed,
    mergedConfig.noiseSpeed,
    mergedConfig.opacity,
  ]);

  useFrame(({ clock }) => {
    if (meshRef.current && material) {
      material.uniforms.uTime.value = clock.elapsedTime;

      // カメラ追従モード
      if (mergedConfig.followCamera) {
        camera.updateMatrixWorld();
        // カメラ前方にスクリーン空間クアッドとして配置
        const distance = Math.max(1, Math.abs(mergedConfig.cameraOffsetY));
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
          camera.quaternion
        );
        const offset = forward.multiplyScalar(distance);

        meshRef.current.position.copy(camera.position).add(offset);
        // カメラと同じ向きに回転（レンズフィルターのように平行）
        meshRef.current.quaternion.copy(camera.quaternion);
        meshRef.current.frustumCulled = false;
        meshRef.current.renderOrder = 999;
        material.depthWrite = false;
        material.depthTest = false;

        // 視野内を覆うようにスケール調整
        const fov = (camera as THREE.PerspectiveCamera).fov ?? 50;
        const distanceScale = Math.tan(THREE.MathUtils.degToRad(fov) / 2) * distance;
        const height = distanceScale * 2;
        const width = height * (size.width / size.height);
        const oversize = 2.5;
        meshRef.current.scale.set(width * oversize, height * oversize, 1);
      }
    }
  }, 1);

  if (!mergedConfig.enabled) {
    return null;
  }

  // カメラ追従時は初期rotation不要（useFrameで設定）
  const initialRotation: [number, number, number] = mergedConfig.followCamera 
    ? [0, 0, 0] 
    : [-Math.PI / 2, 0, 0];

  const initialPosition: [number, number, number] = mergedConfig.followCamera
    ? [0, 0, 0]
    : [mergedConfig.positionX, mergedConfig.positionY, mergedConfig.positionZ];

  return (
    <mesh
      ref={meshRef}
      rotation={initialRotation}
      position={initialPosition}
      material={material}
    >
      <planeGeometry
        args={[mergedConfig.size, mergedConfig.size, mergedConfig.segments, mergedConfig.segments]}
      />
    </mesh>
  );
};

GroundFog.displayName = "GroundFog";
