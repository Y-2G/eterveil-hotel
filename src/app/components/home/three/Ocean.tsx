/**
 * Ocean.tsx - リアル寄りの海
 *
 * 段階的デバッグ版
 * Sky を表示して、確認してから Water を追加
 */

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DissolveParticles } from "./DissolveParticles";

interface OceanProps {
  waterSize?: number;
  waterSegments?: number;
  sunElevation?: number;
  sunAzimuth?: number;
  rtResolution?: number;
  toneMappingExposure?: number;
  waterNormalsPath?: string;
  position?: [number, number, number]; // 水面の位置
  fogEnabled?: boolean;
  dissolveProgress?: number;
  dissolveMaxPoints?: number;
  dissolvePointSize?: number;
  dissolveColor?: string;
  dissolveScatterStart?: number;
}

export const Ocean = ({
  waterSize = 2000,
  waterSegments = 64,
  sunElevation = 50,
  sunAzimuth = 180,
  rtResolution = 512,
  toneMappingExposure = 1.5,
  waterNormalsPath = "/textures/waternormals.jpg",
  position = [0, 0, 0], // 水面の位置（デフォルト：原点）
  fogEnabled = true,
  dissolveProgress = 0,
  dissolveMaxPoints = 6000,
  dissolvePointSize = 0.55,
  dissolveColor = "#a4bfd4",
  dissolveScatterStart = 0,
}: OceanProps) => {
  const { scene, gl: renderer } = useThree();
  const waterRef = useRef<THREE.Mesh | null>(null);
  const sceneSetupRef = useRef(false);
  const groupRef = useRef<THREE.Group>(null);
  const [waterReady, setWaterReady] = useState(false);

  useEffect(() => {
    if (sceneSetupRef.current) return;
    sceneSetupRef.current = true;

    try {
      console.log("[Ocean] Initialization starting...");

      // Sun light（Waterの反射用）
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
      sunLight.position.setFromSphericalCoords(
        150,
        THREE.MathUtils.degToRad(90 - sunElevation),
        THREE.MathUtils.degToRad(sunAzimuth)
      );
      scene.add(sunLight);
      console.log("[Ocean] Sun light added");

      // ============================================================
      // Water の動的インポートとセットアップ
      // ============================================================
      import("three/examples/jsm/objects/Water.js")
        .then(({ Water }) => {
          console.log("[Ocean] Water module loaded");

          const waterGeometry = new THREE.PlaneGeometry(
            waterSize,
            waterSize,
            waterSegments,
            waterSegments
          );

          // フォールバックテクスチャ
          const canvas = document.createElement("canvas");
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, 512, 512);
          }
          const waterNormals = new THREE.CanvasTexture(canvas);
          waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

          const water = new Water(waterGeometry, {
            textureWidth: rtResolution,
            textureHeight: rtResolution,
            waterNormals: waterNormals,
            sunDirection: sunLight.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 15.0, // 波の強度を大幅に増加（デフォルト 3.7 → 15.0）
            fog: fogEnabled,
          });

          water.rotation.x = -Math.PI / 2;
          water.position.set(position[0], position[1], position[2]); // 位置を設定
          waterRef.current = water;
          if (groupRef.current) {
            groupRef.current.add(water);
          } else {
            scene.add(water);
          }
          console.log(
            `[Ocean] Water added to scene at position [${position.join(", ")}]`
          );
          setWaterReady(true);

          // 非同期でテクスチャをロード（重要：波の詳細を見るために必須）
          const textureLoader = new THREE.TextureLoader();
          console.log(
            `[Ocean] Attempting to load texture: ${waterNormalsPath}`
          );

          textureLoader.load(
            waterNormalsPath,
            (texture) => {
              console.log("[Ocean] ✓ Texture loaded successfully!");
              texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

              // Water マテリアルのノーマルマップを更新
              const waterMaterial = water.material as any;
              if (
                waterMaterial?.uniforms &&
                waterMaterial.uniforms.normalSampler
              ) {
                waterMaterial.uniforms.normalSampler.value = texture;
                console.log(
                  "[Ocean] ✓ normalSampler updated with proper texture"
                );
              } else {
                console.warn("[Ocean] normalSampler uniform not found");
              }
            },
            (progress) => {
              console.log(
                `[Ocean] Texture loading: ${Math.round(
                  (progress.loaded / progress.total) * 100
                )}%`
              );
            },
            (error) => {
              console.warn(
                `[Ocean] ✗ Failed to load texture: ${waterNormalsPath}`,
                error
              );
              console.log(
                "[Ocean] Using fallback white texture (waves will be subtle)"
              );
            }
          );
        })
        .catch((error) => {
          console.error("[Ocean] Failed to load Water module:", error);
        });

      // ============================================================
      // 3. Renderer設定（Fogは Scene で管理）
      // ============================================================
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = toneMappingExposure;

      console.log("[Ocean] Renderer configured");

      // ============================================================
      // 4. PMREM（環境反射）
      // ============================================================
      setTimeout(() => {
        try {
          const pmremGenerator = new (THREE as any).PMREMGenerator(renderer);
          pmremGenerator.compileEquirectangularShader();
          const renderTarget = pmremGenerator.fromScene(scene);
          scene.environment = renderTarget.texture;
          console.log("[Ocean] PMREM environment set");
          pmremGenerator.dispose();
        } catch (error) {
          console.warn("[Ocean] PMREM setup failed:", error);
        }
      }, 500);
    } catch (error) {
      console.error("[Ocean] Initialization error:", error);
    }

    return () => {
      try {
        if (waterRef.current && waterRef.current.parent) {
          waterRef.current.parent.remove(waterRef.current);
        }
      } catch (error) {
        console.error("[Ocean] Cleanup error:", error);
      }
    };
  }, []);

  // position プロパティの変更を監視して、水面の位置を更新
  useEffect(() => {
    if (waterRef.current) {
      waterRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [position]);

  // ============================================================
  // Animation Loop - Water wave を駆動（極めて重要）
  // ============================================================
  useFrame(({ camera }) => {
    if (!waterRef.current) return;

    const water = waterRef.current as any;
    const material = water.material as any;

    // 【重要】Water マテリアルの uniform を更新
    if (material?.uniforms?.time) {
      // time uniform を増加させる（波の動きを制御）
      material.uniforms.time.value += 0.016 * 2; // 波の速度調整（2倍で高速化）

      // カメラ位置を更新（反射の正確性）
      if (material.uniforms.eye) {
        material.uniforms.eye.value.copy(camera.position);
      }

      // 【最重要】uniform 更新をトリガー
      material.uniformsNeedUpdate = true;
    }

    // Water の update メソッドがあれば呼び出す
    if (typeof water.update === "function") {
      water.update();
    }
  });

  return (
    <group ref={groupRef}>
      <DissolveParticles
        sourceRef={groupRef}
        progress={dissolveProgress}
        maxPoints={dissolveMaxPoints}
        size={dissolvePointSize}
        color={dissolveColor}
        scatterStart={dissolveScatterStart}
        rebuildKey={waterReady ? "ocean-ready" : "ocean-init"}
      />
    </group>
  );
};
