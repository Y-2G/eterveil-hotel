import { useEffect, useRef } from "react";
import { useGLTF, Helper } from "@react-three/drei";
import * as THREE from "three";
import { PointLightHelper } from "three";
import { DebugConfig, HotelLightConfig } from "./types";
import { NeonSign } from "./NeonSign";
import { DissolveParticles } from "./DissolveParticles";

// 個別のライトコンポーネント
const HotelLight = ({
  config,
  showHelper,
  helperSize,
}: {
  config: HotelLightConfig;
  showHelper: boolean;
  helperSize: number;
}) => {
  const lightRef = useRef<THREE.PointLight>(null);

  if (!config.enabled) return null;

  return (
    <pointLight
      ref={lightRef}
      position={[config.positionX, config.positionY, config.positionZ]}
      color={config.color}
      intensity={config.intensity}
      power={config.power}
      distance={config.distance}
      decay={config.decay}
    >
      {showHelper && <Helper type={PointLightHelper} args={[helperSize, config.color]} />}
    </pointLight>
  );
};

export const HotelModel = ({
  debugConfig,
  animationProgress,
  dissolveProgress = 0,
  dissolveMaxPoints = 7000,
  dissolvePointSize = 0.35,
  dissolveScatterStart = 0,
}: {
  debugConfig: DebugConfig;
  animationProgress: number;
  dissolveProgress?: number;
  dissolveMaxPoints?: number;
  dissolvePointSize?: number;
  dissolveScatterStart?: number;
}) => {
  const gltf = useGLTF("/models/hottel.glb");
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        debugConfig.hotel.positionX,
        debugConfig.hotel.positionY,
        debugConfig.hotel.positionZ
      );
      groupRef.current.scale.set(
        debugConfig.hotel.scaleValue,
        debugConfig.hotel.scaleValue,
        debugConfig.hotel.scaleValue
      );
      groupRef.current.rotation.set(
        debugConfig.hotel.rotationX || 0,
        debugConfig.hotel.rotationY || 0,
        debugConfig.hotel.rotationZ || 0
      );
    }
  }, [
    debugConfig.hotel.positionX,
    debugConfig.hotel.positionY,
    debugConfig.hotel.positionZ,
    debugConfig.hotel.scaleValue,
    debugConfig.hotel.rotationX,
    debugConfig.hotel.rotationY,
    debugConfig.hotel.rotationZ,
  ]);

  const rebuildKey = [
    debugConfig.hotel.positionX,
    debugConfig.hotel.positionY,
    debugConfig.hotel.positionZ,
    debugConfig.hotel.scaleValue,
    debugConfig.hotel.rotationX ?? 0,
    debugConfig.hotel.rotationY ?? 0,
    debugConfig.hotel.rotationZ ?? 0,
  ].join("-");

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
      {/* ホテルに取り付けるライト（ホテルのローカル座標系に配置） */}
      <HotelLight config={debugConfig.hotelLights.light1} showHelper={debugConfig.hotelLights.showHelpers} helperSize={debugConfig.hotelLights.helperSize} />
      <HotelLight config={debugConfig.hotelLights.light2} showHelper={debugConfig.hotelLights.showHelpers} helperSize={debugConfig.hotelLights.helperSize} />
      <HotelLight config={debugConfig.hotelLights.light3} showHelper={debugConfig.hotelLights.showHelpers} helperSize={debugConfig.hotelLights.helperSize} />
      <HotelLight config={debugConfig.hotelLights.light4} showHelper={debugConfig.hotelLights.showHelpers} helperSize={debugConfig.hotelLights.helperSize} />

      {/* ネオンサイン */}
      <NeonSign
        key={JSON.stringify(debugConfig.neonSign)}
        config={debugConfig.neonSign}
      />
      <DissolveParticles
        sourceRef={groupRef}
        progress={dissolveProgress}
        maxPoints={dissolveMaxPoints}
        size={dissolvePointSize}
        scatterStart={dissolveScatterStart}
        scatterMultiplier={0.9}
        color="#d9e1e8"
        rebuildKey={rebuildKey}
      />
    </group>
  );
};
