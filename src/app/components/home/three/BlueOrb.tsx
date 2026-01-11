import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { forwardRef, useImperativeHandle, useState } from "react";
import { BlueOrbConfig } from "./types";

export type BlueOrbRef = {
  setVisible: (visible: boolean) => void;
};

type BlueOrbProps = {
  config: BlueOrbConfig;
  initialPosition?: { x: number; y: number; z: number };
};

export const BlueOrb = forwardRef<BlueOrbRef, BlueOrbProps>(
  ({ config, initialPosition }, ref) => {
    const groupRef = useRef<Group>(null);
    const outerGlowRef = useRef<Mesh>(null);
    const middleGlowRef = useRef<Mesh>(null);
    const coreRef = useRef<Mesh>(null);
    const innerCoreRef = useRef<Mesh>(null);
    // フェードアニメーション用
    const targetOpacityRef = useRef(0);
    const currentOpacityRef = useRef(0);
    // 実際にレンダリングするかどうか
    const [shouldRender, setShouldRender] = useState(false);

    // 固定位置: initialPositionがあればそれを使用、なければconfigの値
    const position = {
      x: initialPosition?.x ?? config.positionX,
      y: initialPosition?.y ?? config.positionY,
      z: initialPosition?.z ?? config.positionZ,
    };

    useImperativeHandle(ref, () => ({
      setVisible: (v: boolean) => {
        if (v) {
          targetOpacityRef.current = 1;
          setShouldRender(true);
        } else {
          targetOpacityRef.current = 0;
        }
      },
    }));

    // アニメーション: グループ全体を浮遊 + コアの回転 + グローの脈動 + フェード
    useFrame((state, delta) => {
      const isActive = shouldRender || config.alwaysVisible;

      // フェードアニメーション
      const lerpSpeed = 5;
      currentOpacityRef.current +=
        (targetOpacityRef.current - currentOpacityRef.current) * lerpSpeed * delta;

      // opacityが0に近づいた時の処理
      if (currentOpacityRef.current < 0.01 && targetOpacityRef.current === 0) {
        // レンダリングを停止
        setShouldRender(false);
      }

      const opacityMultiplier = currentOpacityRef.current;

      // マテリアルのopacityを更新
      if (outerGlowRef.current) {
        const mat = outerGlowRef.current.material as MeshBasicMaterial;
        mat.opacity = config.glowOpacity * 0.5 * opacityMultiplier;
      }
      if (middleGlowRef.current) {
        const mat = middleGlowRef.current.material as MeshBasicMaterial;
        mat.opacity = config.glowOpacity * opacityMultiplier;
      }
      if (coreRef.current) {
        const mat = coreRef.current.material as MeshStandardMaterial;
        mat.opacity = 0.9 * opacityMultiplier;
      }
      if (innerCoreRef.current) {
        const mat = innerCoreRef.current.material as MeshBasicMaterial;
        mat.opacity = 0.8 * opacityMultiplier;
      }

      if (groupRef.current && isActive) {
        // 固定位置 + 浮遊アニメーション
        groupRef.current.position.x = position.x;
        groupRef.current.position.z = position.z;
        // Y方向は浮遊アニメーションを適用
        groupRef.current.position.y =
          position.y +
          Math.sin(state.clock.elapsedTime * config.floatSpeed) *
            config.floatAmplitude;
      }

      if (coreRef.current && isActive) {
        // コアの回転
        coreRef.current.rotation.y += config.rotationSpeed;
      }

      if (outerGlowRef.current && isActive) {
        // グローの脈動
        const pulseScale =
          config.scale * 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        outerGlowRef.current.scale.setScalar(pulseScale);
      }
    });

    if (!shouldRender && !config.alwaysVisible) return null;

    return (
      <group ref={groupRef} position={[position.x, position.y, position.z]}>
        {/* 外側のグロー */}
        <mesh ref={outerGlowRef} scale={config.scale * 1.5}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={config.glowColor}
            transparent
            opacity={config.glowOpacity * 0.5}
            depthWrite={false}
          />
        </mesh>

        {/* 中間のグロー */}
        <mesh ref={middleGlowRef} scale={config.scale * 1.2}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={config.glowColor}
            transparent
            opacity={config.glowOpacity}
            depthWrite={false}
          />
        </mesh>

        {/* コアのオーブ */}
        <mesh ref={coreRef} scale={config.scale}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={config.coreColor}
            emissive={config.emissiveColor}
            emissiveIntensity={config.emissiveIntensity}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* 内側の明るいコア */}
        <mesh ref={innerCoreRef} scale={config.scale * 0.6}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#b3e5fc" transparent opacity={0.8} />
        </mesh>

        {/* ポイントライト */}
        <pointLight
          color={config.glowColor}
          intensity={config.lightIntensity}
          distance={config.lightDistance}
          decay={2}
        />
      </group>
    );
  }
);

BlueOrb.displayName = "BlueOrb";
