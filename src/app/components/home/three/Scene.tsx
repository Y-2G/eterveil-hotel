import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { HotelModel } from "./HotelModel";
import { DebugConfig } from "./types";
import { WorldModel, WorldModelRef } from "./WorldModel";
import { Ocean } from "./Ocean";
import { Sky } from "./Sky";
import { CameraState } from "./Canvas";
import { MapPinSprite, MapPinSpriteRef } from "./MapPinSprite";
import { BlueOrb, BlueOrbRef } from "./BlueOrb";
import { SimpleGrass } from "./grass/SimpleGrass";
import { GroundFogEffect } from "./groundFog/GroundFogEffect";

export type SceneRef = {
  mapPinSprite: MapPinSpriteRef | null;
  // Guest Rooms用オーブ（3つ）
  guestRoomOrb1: BlueOrbRef | null;
  guestRoomOrb2: BlueOrbRef | null;
  guestRoomOrb3: BlueOrbRef | null;
  // Pool & Spa用オーブ
  poolSpaOrb: BlueOrbRef | null;
  // Fine Dining用オーブ
  fineDiningOrb: BlueOrbRef | null;
};

type SceneProps = {
  debugConfig: DebugConfig;
  animationProgress: number;
  cameraState?: CameraState;
  dissolveProgress?: number;
  orbitControlsEnabled?: boolean;
  onMapPinClick?: () => void;
  mapPinPortalRef?: React.RefObject<HTMLElement>;
};

export const Scene = forwardRef<SceneRef, SceneProps>(
  (
    {
      debugConfig,
      animationProgress,
      cameraState,
      dissolveProgress,
      orbitControlsEnabled,
      onMapPinClick,
      mapPinPortalRef,
    },
    ref
  ) => {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const orbitControlsRef = useRef<OrbitControlsType>(null);
    const mapPinRef = useRef<MapPinSpriteRef>(null);
    // Guest Rooms用オーブ（3つ）
    const guestRoomOrb1Ref = useRef<BlueOrbRef>(null);
    const guestRoomOrb2Ref = useRef<BlueOrbRef>(null);
    const guestRoomOrb3Ref = useRef<BlueOrbRef>(null);
    // Pool & Spa用オーブ
    const poolSpaOrbRef = useRef<BlueOrbRef>(null);
    // Fine Dining用オーブ
    const fineDiningOrbRef = useRef<BlueOrbRef>(null);
    const worldModelRef = useRef<WorldModelRef>(null);

    // 地形メッシュの参照（草の配置用）
    const [terrainScene, setTerrainScene] = useState<THREE.Group | null>(null);

    const lastLookAtTarget = useRef(
      new THREE.Vector3(
        debugConfig.camera.targetX,
        debugConfig.camera.targetY,
        debugConfig.camera.targetZ
      )
    );
    const initialLookAtApplied = useRef(false);

    // マウント時にスクロール位置をチェックし、heroセクション外ならtargetXを0にする
    useEffect(() => {
      if (window.scrollY >= window.innerHeight) {
        lastLookAtTarget.current.x = 0;
      }
    }, []);

    // WorldModelのロード完了を監視
    useEffect(() => {
      const checkTerrain = () => {
        if (worldModelRef.current?.scene) {
          setTerrainScene(worldModelRef.current.scene);
        }
      };

      // 少し遅延させてロードを待つ
      const timer = setTimeout(checkTerrain, 500);
      const interval = setInterval(checkTerrain, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }, []);

    // 外部からMapPinSprite, BlueOrbを制御可能にする
    useImperativeHandle(ref, () => ({
      get mapPinSprite() {
        return mapPinRef.current;
      },
      get guestRoomOrb1() {
        return guestRoomOrb1Ref.current;
      },
      get guestRoomOrb2() {
        return guestRoomOrb2Ref.current;
      },
      get guestRoomOrb3() {
        return guestRoomOrb3Ref.current;
      },
      get poolSpaOrb() {
        return poolSpaOrbRef.current;
      },
      get fineDiningOrb() {
        return fineDiningOrbRef.current;
      },
    }));

    // カメラの zoom を更新（CSS scale の代わり）
    useEffect(() => {
      if (cameraRef.current && cameraState) {
        // cameraStateに値がない場合はdebugConfigの値を使用
        // posX/posY/posZがすべてundefinedの場合はカメラ位置を変更しない（targetのみの更新）
        const hasPositionUpdate =
          cameraState.posX !== undefined ||
          cameraState.posY !== undefined ||
          cameraState.posZ !== undefined;

        if (hasPositionUpdate) {
          cameraRef.current.position.x =
            cameraState.posX ?? debugConfig.camera.positionX;
          cameraRef.current.position.y =
            cameraState.posY ?? debugConfig.camera.positionY;
          cameraRef.current.position.z =
            cameraState.posZ ?? debugConfig.camera.positionZ;
        }

        if (cameraState.zoom !== undefined) {
          cameraRef.current.zoom = cameraState.zoom;
        }
        if (cameraState.rotX !== undefined) {
          cameraRef.current.rotation.x = cameraState.rotX;
        }
        if (cameraState.rotY !== undefined) {
          cameraRef.current.rotation.y = cameraState.rotY;
        }
        if (cameraState.rotZ !== undefined) {
          cameraRef.current.rotation.z = cameraState.rotZ;
        }
        cameraRef.current.updateProjectionMatrix();
      }
    }, [cameraState, debugConfig.camera]);

    // useFrameでカメラのlookAtを制御（OrbitControlsが無効の時）
    useFrame(() => {
      if (!orbitControlsEnabled && cameraRef.current) {
        // cameraStateがある場合（スクロールアニメーション中）
        if (cameraState) {
          // cameraStateにtargetがある場合はそれを使用
          const targetX =
            cameraState.targetX ??
            (initialLookAtApplied.current
              ? lastLookAtTarget.current.x
              : debugConfig.camera.targetX);
          const targetY =
            cameraState.targetY ??
            (initialLookAtApplied.current
              ? lastLookAtTarget.current.y
              : debugConfig.camera.targetY);
          const targetZ =
            cameraState.targetZ ??
            (initialLookAtApplied.current
              ? lastLookAtTarget.current.z
              : debugConfig.camera.targetZ);

          cameraRef.current.lookAt(targetX, targetY, targetZ);
          lastLookAtTarget.current.set(targetX, targetY, targetZ);
          initialLookAtApplied.current = true;
        } else {
          // 初回だけdebugConfigのtarget、それ以降は前回のlookAtを維持
          const targetX = initialLookAtApplied.current
            ? lastLookAtTarget.current.x
            : debugConfig.camera.targetX;
          const targetY = initialLookAtApplied.current
            ? lastLookAtTarget.current.y
            : debugConfig.camera.targetY;
          const targetZ = initialLookAtApplied.current
            ? lastLookAtTarget.current.z
            : debugConfig.camera.targetZ;

          cameraRef.current.lookAt(targetX, targetY, targetZ);
          lastLookAtTarget.current.set(targetX, targetY, targetZ);
          initialLookAtApplied.current = true;
        }
      }
    });

    // debugConfigからカメラ設定を適用
    useEffect(() => {
      if (cameraRef.current && debugConfig.camera && !cameraState) {
        cameraRef.current.position.set(
          debugConfig.camera.positionX,
          debugConfig.camera.positionY,
          debugConfig.camera.positionZ
        );
        cameraRef.current.fov = debugConfig.camera.fov;
        cameraRef.current.updateProjectionMatrix();

        // OrbitControlsが無効の場合は直接lookAtを設定
        if (!orbitControlsEnabled) {
          const targetX = initialLookAtApplied.current
            ? lastLookAtTarget.current.x
            : debugConfig.camera.targetX;
          const targetY = initialLookAtApplied.current
            ? lastLookAtTarget.current.y
            : debugConfig.camera.targetY;
          const targetZ = initialLookAtApplied.current
            ? lastLookAtTarget.current.z
            : debugConfig.camera.targetZ;
          cameraRef.current.lookAt(targetX, targetY, targetZ);
          lastLookAtTarget.current.set(targetX, targetY, targetZ);
          initialLookAtApplied.current = true;
        }
      }
      // OrbitControlsが有効の場合はターゲットを(0,0,0)に固定
      if (orbitControlsRef.current && orbitControlsEnabled) {
        orbitControlsRef.current.target.set(0, 0, 0);
        orbitControlsRef.current.update();
      }
    }, [debugConfig.camera, cameraState, orbitControlsEnabled]);

    const resolveDissolveProgress = (
      progress: number,
      start: number,
      end: number
    ) => {
      if (end <= start) {
        return progress <= start ? 0 : 1;
      }
      return THREE.MathUtils.clamp((progress - start) / (end - start), 0, 1);
    };

    const globalDissolveProgress = dissolveProgress ?? 0;
    const modelDissolveProgress = resolveDissolveProgress(
      globalDissolveProgress,
      debugConfig.dissolve.modelStart,
      debugConfig.dissolve.modelEnd
    );
    const skyDissolveProgress = resolveDissolveProgress(
      globalDissolveProgress,
      debugConfig.dissolve.skyStart,
      debugConfig.dissolve.skyEnd
    );
    const oceanDissolveProgress = resolveDissolveProgress(
      globalDissolveProgress,
      debugConfig.dissolve.oceanStart,
      debugConfig.dissolve.oceanEnd
    );
    const fogDissolveProgress = resolveDissolveProgress(
      globalDissolveProgress,
      debugConfig.dissolve.fogStart,
      debugConfig.dissolve.fogEnd
    );
    const fogOpacity =
      debugConfig.groundFog.opacity * (1 - fogDissolveProgress);
    const showGroundFog =
      debugConfig.groundFog.enabled && fogOpacity > 0.001;

    return (
      <>
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[
            debugConfig.camera.positionX,
            debugConfig.camera.positionY,
            debugConfig.camera.positionZ,
          ]}
          fov={debugConfig.camera.fov}
          near={0.1}
          far={500000}
        />
        {/* OrbitControlsはorbitControlsEnabledがtrueの時のみ有効 */}
        <OrbitControls
          ref={orbitControlsRef}
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          enabled={orbitControlsEnabled}
          target={[0, 0, 0]}
        />
        {/* Fog */}
        {debugConfig.fog.enabled && (
          <fog
            attach="fog"
            args={[
              debugConfig.fog.color,
              debugConfig.fog.near,
              debugConfig.fog.far,
            ]}
          />
        )}

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* 物理ベースの空（Sky シェーダー） */}
        <Sky
          config={debugConfig.sky}
          dissolveProgress={skyDissolveProgress}
          dissolvePointSize={debugConfig.dissolve.skyPointSize}
          dissolveScatterStart={debugConfig.dissolve.scatterStart}
        />

        {/* リアル寄りの海を追加 */}
        <Ocean
          waterSize={2000}
          waterSegments={64}
          sunElevation={50}
          sunAzimuth={180}
          rtResolution={512}
          waterNormalsPath="/textures/waternormals.jpg"
          toneMappingExposure={1.5}
          position={[
            debugConfig.ocean.positionX,
            debugConfig.ocean.positionY,
            debugConfig.ocean.positionZ,
          ]}
          fogEnabled={debugConfig.fog.enabled}
          dissolveProgress={oceanDissolveProgress}
          dissolvePointSize={debugConfig.dissolve.oceanPointSize}
          dissolveScatterStart={debugConfig.dissolve.scatterStart}
        />

        <WorldModel
          ref={worldModelRef}
          positionX={debugConfig.world.positionX}
          positionY={debugConfig.world.positionY}
          positionZ={debugConfig.world.positionZ}
          scale={debugConfig.world.scaleValue}
          rotationX={debugConfig.world.rotationX}
          rotationY={debugConfig.world.rotationY}
          rotationZ={debugConfig.world.rotationZ}
          dissolveProgress={modelDissolveProgress}
          dissolveMaxPoints={debugConfig.dissolve.worldMaxPoints}
          dissolvePointSize={debugConfig.dissolve.worldPointSize}
          dissolveScatterStart={debugConfig.dissolve.scatterStart}
        />

        {/* 軽量草システム - 単一InstancedMeshで描画 */}
        {debugConfig.grass.enabled && terrainScene && (
          <SimpleGrass
            key={`grass-${debugConfig.grass.count}-${debugConfig.grass.spread}-${debugConfig.grass.height}-${debugConfig.grass.width}-${debugConfig.grass.positionX}-${debugConfig.grass.positionY}-${debugConfig.grass.positionZ}-${terrainScene?.uuid}`}
            count={debugConfig.grass.count}
            spread={debugConfig.grass.spread}
            height={debugConfig.grass.height}
            width={debugConfig.grass.width}
            baseColor={new THREE.Color(debugConfig.grass.baseColor)}
            swayStrength={debugConfig.grass.swayStrength}
            swaySpeed={debugConfig.grass.swaySpeed}
            position={[
              debugConfig.grass.positionX,
              0,
              debugConfig.grass.positionZ,
            ]}
            groundY={debugConfig.grass.positionY}
            terrain={terrainScene}
          />
        )}

        <HotelModel
          debugConfig={debugConfig}
          animationProgress={animationProgress}
          dissolveProgress={modelDissolveProgress}
          dissolveMaxPoints={debugConfig.dissolve.hotelMaxPoints}
          dissolvePointSize={debugConfig.dissolve.hotelPointSize}
          dissolveScatterStart={debugConfig.dissolve.scatterStart}
        />

        {/* MapPin Sprite - カメラに対して常に正面を向く */}
        <MapPinSprite
          ref={mapPinRef}
          position={[0, 20, 0]}
          scale={1}
          onPinClick={onMapPinClick}
          portalRef={mapPinPortalRef}
        />

        {/* Blue Orbs - 固定位置で配置、表示/非表示のみで制御 */}
        {/* Guest Rooms用オーブ（3つ） */}
        <BlueOrb
          ref={guestRoomOrb1Ref}
          config={debugConfig.blueOrb}
          initialPosition={{ x: 0.5, y: -6.4, z: 3.5 }}
        />
        <BlueOrb
          ref={guestRoomOrb2Ref}
          config={debugConfig.blueOrb}
          initialPosition={{ x: 0.5, y: 0, z: 3.5 }}
        />
        <BlueOrb
          ref={guestRoomOrb3Ref}
          config={debugConfig.blueOrb}
          initialPosition={{ x: 0.5, y: -3.2, z: 3.5 }}
        />
        {/* Pool & Spa用オーブ */}
        <BlueOrb
          ref={poolSpaOrbRef}
          config={debugConfig.blueOrb}
          initialPosition={{ x: 0.5, y: 3.5, z: 3.5 }}
        />
        {/* Fine Dining用オーブ */}
        <BlueOrb
          ref={fineDiningOrbRef}
          config={debugConfig.blueOrb}
          initialPosition={{ x: 0.5, y: 6.5, z: 3.5 }}
        />

        {/* ポストプロセスエフェクト */}
        {(showGroundFog || debugConfig.bloom.enabled) && (
          <EffectComposer>
            <>
              {showGroundFog && (
                <GroundFogEffect
                  color={debugConfig.groundFog.color}
                  density={debugConfig.groundFog.density}
                  height={debugConfig.groundFog.height}
                  noiseScale={debugConfig.groundFog.noiseScale}
                  noiseSeed={debugConfig.groundFog.noiseSeed}
                  noiseSpeed={debugConfig.groundFog.noiseSpeed}
                  opacity={fogOpacity}
                />
              )}
              {debugConfig.bloom.enabled && (
                <Bloom
                  intensity={debugConfig.bloom.intensity}
                  luminanceThreshold={debugConfig.bloom.luminanceThreshold}
                  luminanceSmoothing={debugConfig.bloom.luminanceSmoothing}
                  radius={debugConfig.bloom.radius}
                />
              )}
            </>
          </EffectComposer>
        )}
      </>
    );
  }
);

Scene.displayName = "Scene";
