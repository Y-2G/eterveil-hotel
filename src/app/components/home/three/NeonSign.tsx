"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Helper, Text } from "@react-three/drei";
import * as THREE from "three";
import { PointLightHelper } from "three";

export type NeonSignConfig = {
  enabled: boolean;
  showHelpers: boolean;
  helperSize: number;
  // 縦書きサイン (MOBATT)
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
  // 横書きサイン (WHISKEY HOTEL)
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

type NeonTextProps = {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  fontSize: number;
  color: string;
  emissiveIntensity: number;
  vertical?: boolean;
  letterSpacing?: number;
  flickerEnabled?: boolean;
  flickerSpeed?: number;
  flickerIntensity?: number;
  showHelper?: boolean;
  helperSize?: number;
};

const NeonText = ({
  text,
  position,
  rotation = [0, 0, 0],
  fontSize,
  color,
  emissiveIntensity,
  vertical = false,
  letterSpacing = 0,
  flickerEnabled = false,
  flickerSpeed = 1,
  flickerIntensity = 0.3,
  showHelper = false,
  helperSize = 0.25,
}: NeonTextProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const positionRef = useRef<[number, number, number]>(position);
  const rotationRef = useRef<[number, number, number]>(rotation);
  const baseIntensity = useRef(emissiveIntensity);
  const flickerEnabledRef = useRef(flickerEnabled);
  const flickerSpeedRef = useRef(flickerSpeed);
  const flickerIntensityRef = useRef(flickerIntensity);

  // lil-guiから更新された最新値を参照できるようにする
  useEffect(() => {
    flickerEnabledRef.current = flickerEnabled;
  }, [flickerEnabled]);

  useEffect(() => {
    flickerSpeedRef.current = flickerSpeed;
  }, [flickerSpeed]);

  useEffect(() => {
    flickerIntensityRef.current = flickerIntensity;
  }, [flickerIntensity]);

  // 位置・回転の最新値を保持
  useEffect(() => {
    positionRef.current = position;
    rotationRef.current = rotation;
  }, [position, rotation]);

  // GUIで強度を変えたときに即時反映させる
  useEffect(() => {
    baseIntensity.current = emissiveIntensity;
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = emissiveIntensity;
    }
    if (lightRef.current) {
      lightRef.current.intensity = Math.max(1, emissiveIntensity * 2);
    }
  }, [emissiveIntensity]);

  // 点滅をオフにしたらベース強度に戻す
  useEffect(() => {
    if (!flickerEnabled) {
      if (materialRef.current) {
        materialRef.current.emissiveIntensity = baseIntensity.current;
      }
      if (lightRef.current) {
        lightRef.current.intensity = Math.max(1, baseIntensity.current * 2);
      }
    }
  }, [flickerEnabled]);

  useFrame(({ clock }) => {
    // 位置・回転を毎フレーム同期（GUI更新の取りこぼし防止）
    if (groupRef.current) {
      const [px, py, pz] = positionRef.current;
      const [rx, ry, rz] = rotationRef.current;
      groupRef.current.position.set(px, py, pz);
      groupRef.current.rotation.set(rx, ry, rz);
      groupRef.current.updateMatrixWorld();
    }

    if (
      flickerEnabledRef.current &&
      materialRef.current &&
      lightRef.current
    ) {
      // ランダムなちらつき効果
      const time = clock.elapsedTime * flickerSpeedRef.current;
      const flicker =
        Math.sin(time * 10) * 0.5 +
        Math.sin(time * 23) * 0.3 +
        Math.sin(time * 47) * 0.2;
      const intensity =
        baseIntensity.current * (1 + flicker * flickerIntensityRef.current);
      materialRef.current.emissiveIntensity = Math.max(0.5, intensity);
      lightRef.current.intensity = Math.max(1, intensity * 2);
    }
  });

  // 縦書きの場合は文字を改行で分割
  const displayText = vertical ? text.split("").join("\n") : text;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        letterSpacing={vertical ? 0 : letterSpacing}
        lineHeight={vertical ? 1.2 : 1}
        textAlign="center"
      >
        {displayText}
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
        />
      </Text>
      {/* ネオンの光源 */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={emissiveIntensity * 2}
        distance={5}
        decay={2}
      >
        {showHelper && <Helper type={PointLightHelper} args={[helperSize, color]} />}
      </pointLight>
    </group>
  );
};

type NeonSignProps = {
  config: NeonSignConfig;
};

export const NeonSign = ({ config }: NeonSignProps) => {
  if (!config.enabled) return null;

  // 値変更時に確実に再構築されるようキーを付与
  const verticalKey = [
    "vertical",
    config.verticalSign.text,
    config.verticalSign.positionX,
    config.verticalSign.positionY,
    config.verticalSign.positionZ,
    config.verticalSign.rotationY,
    config.verticalSign.fontSize,
    config.verticalSign.color,
    config.verticalSign.emissiveIntensity,
    config.verticalSign.letterSpacing,
  ].join("-");

  const horizontalKey = [
    "horizontal",
    config.horizontalSign.text,
    config.horizontalSign.positionX,
    config.horizontalSign.positionY,
    config.horizontalSign.positionZ,
    config.horizontalSign.rotationY,
    config.horizontalSign.fontSize,
    config.horizontalSign.color,
    config.horizontalSign.emissiveIntensity,
  ].join("-");

  const rootKey = [
    verticalKey,
    horizontalKey,
    config.flickerEnabled,
    config.flickerSpeed,
    config.flickerIntensity,
    config.showHelpers,
    config.helperSize,
  ].join("|");

  return (
    <group key={rootKey}>
      {/* 縦書きサイン (MOBATT) */}
      {config.verticalSign.enabled && (
        <NeonText
          key={verticalKey}
          text={config.verticalSign.text}
          position={[
            config.verticalSign.positionX,
            config.verticalSign.positionY,
            config.verticalSign.positionZ,
          ]}
          rotation={[0, config.verticalSign.rotationY, 0]}
          fontSize={config.verticalSign.fontSize}
          color={config.verticalSign.color}
          emissiveIntensity={config.verticalSign.emissiveIntensity}
          vertical={true}
          letterSpacing={config.verticalSign.letterSpacing}
          flickerEnabled={config.flickerEnabled}
          flickerSpeed={config.flickerSpeed}
          flickerIntensity={config.flickerIntensity}
          showHelper={config.showHelpers}
          helperSize={config.helperSize}
        />
      )}

      {/* 横書きサイン (WHISKEY HOTEL) */}
      {config.horizontalSign.enabled && (
        <NeonText
          key={horizontalKey}
          text={config.horizontalSign.text}
          position={[
            config.horizontalSign.positionX,
            config.horizontalSign.positionY,
            config.horizontalSign.positionZ,
          ]}
          rotation={[0, config.horizontalSign.rotationY, 0]}
          fontSize={config.horizontalSign.fontSize}
          color={config.horizontalSign.color}
          emissiveIntensity={config.horizontalSign.emissiveIntensity}
          flickerEnabled={config.flickerEnabled}
          flickerSpeed={config.flickerSpeed}
          flickerIntensity={config.flickerIntensity}
          showHelper={config.showHelpers}
          helperSize={config.helperSize}
        />
      )}
    </group>
  );
};

NeonSign.displayName = "NeonSign";
