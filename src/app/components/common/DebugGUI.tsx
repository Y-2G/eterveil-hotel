"use client";

import { useEffect, useRef } from "react";
import GUI from "lil-gui";
import { DebugConfig } from "../home/three/types";
import { MapConfig, HotelConfig } from "../../hooks/useMapConfig";

// lil-gui のインスタンスをグローバルに共有して重複生成を防ぐ
let sharedGui: GUI | null = null;
let sharedDebugFolder: GUI | null = null;
let sharedConceptFolder: GUI | null = null;
let sharedMapFolder: GUI | null = null;
let sharedInstanceCount = 0;

interface DebugGUIProps {
  // Scene用の設定（ConceptSectionで使用）
  sceneConfig?: DebugConfig;
  setSceneConfig?: (config: DebugConfig) => void;

  // Map用の設定（AccessSectionで使用）
  mapConfig?: MapConfig;
  setMapConfig?: (config: MapConfig) => void;
  hotelConfig?: HotelConfig;
  setHotelConfig?: (config: HotelConfig) => void;
}

export const DebugGUI = ({
  sceneConfig,
  setSceneConfig,
  mapConfig,
  setMapConfig,
  hotelConfig,
  setHotelConfig,
}: DebugGUIProps) => {
  // 環境変数でDebug GUIの表示を制御
  const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG_GUI === "true";

  const guiRef = useRef<GUI | null>(null);
  const sceneConfigRef = useRef(
    sceneConfig ? structuredClone(sceneConfig) : null
  );
  const mapConfigRef = useRef(mapConfig ? structuredClone(mapConfig) : null);
  const hotelConfigRef = useRef(
    hotelConfig ? structuredClone(hotelConfig) : null
  );

  // すべてのコントローラーを再帰的に更新するヘルパー関数
  const updateAllControllers = () => {
    if (sharedGui) {
      const allControllers = sharedGui.controllersRecursive();
      allControllers.forEach((controller) => {
        controller.updateDisplay();
      });
    }
  };

  // config state が変更されたら configRef も更新し、GUIも更新
  useEffect(() => {
    if (sceneConfig && sceneConfigRef.current) {
      const target = sceneConfigRef.current;
      Object.assign(target.hotel, sceneConfig.hotel);
      Object.assign(target.world, sceneConfig.world);
      Object.assign(target.sky, sceneConfig.sky);
      Object.assign(target.ocean, sceneConfig.ocean);
      Object.assign(target.fog, sceneConfig.fog);
      Object.assign(target.blueOrb, sceneConfig.blueOrb);
      Object.assign(target.grass, sceneConfig.grass);
      Object.assign(target.camera, sceneConfig.camera);
      Object.assign(target.dissolve, sceneConfig.dissolve);
      Object.assign(target.groundFog, sceneConfig.groundFog);
      Object.assign(target.hotelLights.light1, sceneConfig.hotelLights.light1);
      Object.assign(target.hotelLights.light2, sceneConfig.hotelLights.light2);
      Object.assign(target.hotelLights.light3, sceneConfig.hotelLights.light3);
      Object.assign(target.hotelLights.light4, sceneConfig.hotelLights.light4);
      target.hotelLights.showHelpers = sceneConfig.hotelLights.showHelpers;
      target.hotelLights.helperSize = sceneConfig.hotelLights.helperSize;
      Object.assign(
        target.neonSign.verticalSign,
        sceneConfig.neonSign.verticalSign
      );
      Object.assign(
        target.neonSign.horizontalSign,
        sceneConfig.neonSign.horizontalSign
      );
      target.neonSign.enabled = sceneConfig.neonSign.enabled;
      target.neonSign.flickerEnabled = sceneConfig.neonSign.flickerEnabled;
      target.neonSign.flickerSpeed = sceneConfig.neonSign.flickerSpeed;
      target.neonSign.flickerIntensity = sceneConfig.neonSign.flickerIntensity;
      target.neonSign.glowIntensity = sceneConfig.neonSign.glowIntensity;
      target.neonSign.showHelpers = sceneConfig.neonSign.showHelpers;
      target.neonSign.helperSize = sceneConfig.neonSign.helperSize;
      Object.assign(target.bloom, sceneConfig.bloom);
      updateAllControllers();
    }
  }, [sceneConfig]);

  useEffect(() => {
    if (mapConfig && mapConfigRef.current) {
      Object.assign(mapConfigRef.current, mapConfig);
      updateAllControllers();
    }
  }, [mapConfig]);

  useEffect(() => {
    if (hotelConfig && hotelConfigRef.current) {
      Object.assign(hotelConfigRef.current, hotelConfig);
      updateAllControllers();
    }
  }, [hotelConfig]);

  // lil-gui の初期化（マウント時のみ実行）
  useEffect(() => {
    // 環境変数でDebug GUIが無効の場合は何もしない
    if (!isDebugEnabled) return;

    sharedInstanceCount += 1;

    // 1つの GUI インスタンスを共有
    if (!sharedGui) {
      sharedGui = new GUI({
        title: "Debug Controls",
        width: 320,
        closeFolders: true,
      });
      sharedDebugFolder = sharedGui.addFolder("Debug");
    }

    guiRef.current = sharedGui;

    // ====================================
    // Scene用のコントロール (Concept フォルダー配下)
    // ====================================
    if (
      sharedDebugFolder &&
      sceneConfigRef.current &&
      setSceneConfig &&
      !sharedConceptFolder
    ) {
      const conceptFolder = sharedDebugFolder.addFolder("Concept");
      sharedConceptFolder = conceptFolder;

      // Hotel フォルダー
      const hotelFolder = conceptFolder.addFolder("Hotel");
      hotelFolder
        .add(sceneConfigRef.current.hotel, "positionX", -500, 500, 0.1)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      hotelFolder
        .add(sceneConfigRef.current.hotel, "positionY", -500, 500, 0.1)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      hotelFolder
        .add(sceneConfigRef.current.hotel, "positionZ", -500, 500, 0.1)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      hotelFolder
        .add(sceneConfigRef.current.hotel, "scaleValue", 0.01, 500, 0.1)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      hotelFolder
        .add(sceneConfigRef.current.hotel, "rotationX", -Math.PI, Math.PI, 0.01)
        .name("rotationX")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      hotelFolder
        .add(sceneConfigRef.current.hotel, "rotationY", -Math.PI, Math.PI, 0.01)
        .name("rotationY")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      hotelFolder
        .add(sceneConfigRef.current.hotel, "rotationZ", -Math.PI, Math.PI, 0.01)
        .name("rotationZ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // World フォルダー
      const worldFolder = conceptFolder.addFolder("World");
      worldFolder
        .add(sceneConfigRef.current.world, "positionX", -500, 500, 0.1)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      worldFolder
        .add(sceneConfigRef.current.world, "positionY", -500, 500, 0.1)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      worldFolder
        .add(sceneConfigRef.current.world, "positionZ", -500, 500, 0.1)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      worldFolder
        .add(sceneConfigRef.current.world, "scaleValue", 0.01, 500, 0.1)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      worldFolder
        .add(sceneConfigRef.current.world, "rotationX", -Math.PI, Math.PI, 0.01)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      worldFolder
        .add(sceneConfigRef.current.world, "rotationY", -Math.PI, Math.PI, 0.01)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      worldFolder
        .add(sceneConfigRef.current.world, "rotationZ", -Math.PI, Math.PI, 0.01)
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Sky フォルダー
      const skyFolder = conceptFolder.addFolder("Sky (空)");

      skyFolder
        .add(sceneConfigRef.current.sky, "elevation", 0, 90, 1)
        .name("太陽高度 (Elevation)")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      skyFolder
        .add(sceneConfigRef.current.sky, "azimuth", 0, 360, 1)
        .name("太陽方位 (Azimuth)")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      skyFolder
        .add(sceneConfigRef.current.sky, "turbidity", 0, 20, 0.1)
        .name("濁り (Turbidity)")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      skyFolder
        .add(sceneConfigRef.current.sky, "rayleigh", 0, 4, 0.01)
        .name("青空の強さ (Rayleigh)")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      skyFolder
        .add(sceneConfigRef.current.sky, "mieCoefficient", 0, 0.1, 0.001)
        .name("散乱係数 (Mie)")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      skyFolder
        .add(sceneConfigRef.current.sky, "mieDirectionalG", 0, 1, 0.01)
        .name("太陽の輝き (Mie G)")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // 時間帯プリセット
      const timePresets = {
        "朝 (Morning)": () => {
          sceneConfigRef.current!.sky.elevation = 15;
          sceneConfigRef.current!.sky.azimuth = 90;
          // フォルダーを開いて変更を可視化
          sharedDebugFolder!.open();
          conceptFolder.open();
          skyFolder.open();
          updateAllControllers();
          setSceneConfig(structuredClone(sceneConfigRef.current!));
        },
        "昼 (Noon)": () => {
          sceneConfigRef.current!.sky.elevation = 60;
          sceneConfigRef.current!.sky.azimuth = 180;
          // フォルダーを開いて変更を可視化
          sharedDebugFolder!.open();
          conceptFolder.open();
          skyFolder.open();
          updateAllControllers();
          setSceneConfig(structuredClone(sceneConfigRef.current!));
        },
        "夕方 (Sunset)": () => {
          sceneConfigRef.current!.sky.elevation = 5;
          sceneConfigRef.current!.sky.azimuth = 270;
          // フォルダーを開いて変更を可視化
          sharedDebugFolder!.open();
          conceptFolder.open();
          skyFolder.open();
          updateAllControllers();
          setSceneConfig(structuredClone(sceneConfigRef.current!));
        },
      };

      skyFolder.add(timePresets, "朝 (Morning)");
      skyFolder.add(timePresets, "昼 (Noon)");
      skyFolder.add(timePresets, "夕方 (Sunset)");

      // Ocean フォルダー
      const oceanFolder = conceptFolder.addFolder("Ocean (海)");
      oceanFolder
        .add(sceneConfigRef.current.ocean, "positionX", -500, 500, 0.1)
        .name("位置 X")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      oceanFolder
        .add(sceneConfigRef.current.ocean, "positionY", -500, 500, 0.1)
        .name("位置 Y")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      oceanFolder
        .add(sceneConfigRef.current.ocean, "positionZ", -500, 500, 0.1)
        .name("位置 Z")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Fog フォルダー
      const fogFolder = conceptFolder.addFolder("Fog (霧)");
      fogFolder
        .add(sceneConfigRef.current.fog, "enabled")
        .name("有効")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      fogFolder
        .addColor(sceneConfigRef.current.fog, "color")
        .name("色")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      fogFolder
        .add(sceneConfigRef.current.fog, "near", 0, 500, 1)
        .name("開始距離 (Near)")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      fogFolder
        .add(sceneConfigRef.current.fog, "far", 0, 2000, 10)
        .name("終了距離 (Far)")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Blue Orb フォルダー
      const blueOrbFolder = conceptFolder.addFolder("Blue Orb (青オーブ)");

      // Always Visible (Debug)
      blueOrbFolder
        .add(sceneConfigRef.current.blueOrb, "alwaysVisible")
        .name("常に表示 (Debug)")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Position
      const orbPositionFolder = blueOrbFolder.addFolder("Position");
      orbPositionFolder
        .add(sceneConfigRef.current.blueOrb, "positionX", -30, 30, 0.1)
        .name("X")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      orbPositionFolder
        .add(sceneConfigRef.current.blueOrb, "positionY", -30, 30, 0.1)
        .name("Y")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      orbPositionFolder
        .add(sceneConfigRef.current.blueOrb, "positionZ", -30, 30, 0.1)
        .name("Z")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Scale
      blueOrbFolder
        .add(sceneConfigRef.current.blueOrb, "scale", 0.1, 5, 0.1)
        .name("サイズ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Colors
      const orbColorFolder = blueOrbFolder.addFolder("Colors");
      orbColorFolder
        .addColor(sceneConfigRef.current.blueOrb, "coreColor")
        .name("コア色")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      orbColorFolder
        .addColor(sceneConfigRef.current.blueOrb, "emissiveColor")
        .name("発光色")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      orbColorFolder
        .add(sceneConfigRef.current.blueOrb, "emissiveIntensity", 0, 10, 0.1)
        .name("発光強度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      orbColorFolder
        .addColor(sceneConfigRef.current.blueOrb, "glowColor")
        .name("グロー色")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      orbColorFolder
        .add(sceneConfigRef.current.blueOrb, "glowOpacity", 0, 1, 0.01)
        .name("グロー不透明度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Light
      const orbLightFolder = blueOrbFolder.addFolder("Light");
      orbLightFolder
        .add(sceneConfigRef.current.blueOrb, "lightIntensity", 0, 10, 0.1)
        .name("ライト強度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      orbLightFolder
        .add(sceneConfigRef.current.blueOrb, "lightDistance", 1, 50, 1)
        .name("ライト距離")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Animation
      const orbAnimFolder = blueOrbFolder.addFolder("Animation");
      orbAnimFolder
        .add(sceneConfigRef.current.blueOrb, "floatAmplitude", 0, 2, 0.05)
        .name("浮遊振幅")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      orbAnimFolder
        .add(sceneConfigRef.current.blueOrb, "floatSpeed", 0, 5, 0.1)
        .name("浮遊速度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      orbAnimFolder
        .add(sceneConfigRef.current.blueOrb, "rotationSpeed", 0, 0.1, 0.001)
        .name("回転速度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Grass フォルダー
      const grassFolder = conceptFolder.addFolder("Grass (草)");

      grassFolder
        .add(sceneConfigRef.current.grass, "enabled")
        .name("有効")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      grassFolder
        .add(sceneConfigRef.current.grass, "count", 100, 1000000, 100)
        .name("草の数")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      grassFolder
        .add(sceneConfigRef.current.grass, "spread", 10, 200, 5)
        .name("配置範囲")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      grassFolder
        .add(sceneConfigRef.current.grass, "height", 0.1, 2, 0.05)
        .name("高さ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      grassFolder
        .add(sceneConfigRef.current.grass, "width", 0.01, 0.3, 0.01)
        .name("幅")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      grassFolder
        .addColor(sceneConfigRef.current.grass, "baseColor")
        .name("色")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      grassFolder
        .add(sceneConfigRef.current.grass, "swayStrength", 0, 0.5, 0.01)
        .name("揺れ強さ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      grassFolder
        .add(sceneConfigRef.current.grass, "swaySpeed", 0, 3, 0.1)
        .name("揺れ速度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Position
      const grassPositionFolder = grassFolder.addFolder("Position");
      grassPositionFolder
        .add(sceneConfigRef.current.grass, "positionX", -200, 200, 1)
        .name("X")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      grassPositionFolder
        .add(sceneConfigRef.current.grass, "positionY", -200, 200, 1)
        .name("Y")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      grassPositionFolder
        .add(sceneConfigRef.current.grass, "positionZ", -200, 200, 1)
        .name("Z")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Camera フォルダー
      const cameraFolder = conceptFolder.addFolder("Camera (カメラ)");

      cameraFolder
        .add(sceneConfigRef.current.camera, "positionX", -200, 200, 0.1)
        .name("位置 X")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      cameraFolder
        .add(sceneConfigRef.current.camera, "positionY", -200, 200, 0.1)
        .name("位置 Y")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      cameraFolder
        .add(sceneConfigRef.current.camera, "positionZ", -200, 200, 0.1)
        .name("位置 Z")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      cameraFolder
        .add(sceneConfigRef.current.camera, "fov", 10, 120, 1)
        .name("視野角 (FOV)")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // 注視点
      const targetFolder = cameraFolder.addFolder("Target (注視点)");
      targetFolder
        .add(sceneConfigRef.current.camera, "targetX", -200, 200, 0.1)
        .name("X")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      targetFolder
        .add(sceneConfigRef.current.camera, "targetY", -200, 200, 0.1)
        .name("Y")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      targetFolder
        .add(sceneConfigRef.current.camera, "targetZ", -200, 200, 0.1)
        .name("Z")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Dissolve (Particles)
      const dissolveFolder = conceptFolder.addFolder("Dissolve (Particles)");
      dissolveFolder
        .add(sceneConfigRef.current.dissolve, "startDistance", 0, 1000, 1)
        .name("開始距離")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      dissolveFolder
        .add(sceneConfigRef.current.dissolve, "endDistance", 0, 500, 1)
        .name("終了距離")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      const dissolveTimingFolder = dissolveFolder.addFolder("Timing");
      dissolveTimingFolder
        .add(sceneConfigRef.current.dissolve, "scatterStart", 0, 1, 0.01)
        .name("飛散開始")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      const modelTimingFolder = dissolveTimingFolder.addFolder(
        "Model (World/Hotel)"
      );
      modelTimingFolder
        .add(sceneConfigRef.current.dissolve, "modelStart", 0, 1, 0.01)
        .name("粒子化開始")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      modelTimingFolder
        .add(sceneConfigRef.current.dissolve, "modelEnd", 0, 1, 0.01)
        .name("非表示")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      const skyTimingFolder = dissolveTimingFolder.addFolder("Sky");
      skyTimingFolder
        .add(sceneConfigRef.current.dissolve, "skyStart", 0, 1, 0.01)
        .name("粒子化開始")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      skyTimingFolder
        .add(sceneConfigRef.current.dissolve, "skyEnd", 0, 1, 0.01)
        .name("非表示")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      const oceanTimingFolder = dissolveTimingFolder.addFolder("Ocean");
      oceanTimingFolder
        .add(sceneConfigRef.current.dissolve, "oceanStart", 0, 1, 0.01)
        .name("粒子化開始")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      oceanTimingFolder
        .add(sceneConfigRef.current.dissolve, "oceanEnd", 0, 1, 0.01)
        .name("非表示")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      const fogTimingFolder = dissolveTimingFolder.addFolder("Fog");
      fogTimingFolder
        .add(sceneConfigRef.current.dissolve, "fogStart", 0, 1, 0.01)
        .name("粒子化開始")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      fogTimingFolder
        .add(sceneConfigRef.current.dissolve, "fogEnd", 0, 1, 0.01)
        .name("非表示")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      const worldParticleFolder = dissolveFolder.addFolder("World");
      worldParticleFolder
        .add(sceneConfigRef.current.dissolve, "worldMaxPoints", 1000, 60000, 500)
        .name("Max Points")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      worldParticleFolder
        .add(sceneConfigRef.current.dissolve, "worldPointSize", 0.05, 2, 0.05)
        .name("Point Size")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      const hotelParticleFolder = dissolveFolder.addFolder("Hotel");
      hotelParticleFolder
        .add(sceneConfigRef.current.dissolve, "hotelMaxPoints", 500, 20000, 250)
        .name("Max Points")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      hotelParticleFolder
        .add(sceneConfigRef.current.dissolve, "hotelPointSize", 0.05, 1.5, 0.05)
        .name("Point Size")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      const skyParticleFolder = dissolveFolder.addFolder("Sky");
      skyParticleFolder
        .add(sceneConfigRef.current.dissolve, "skyPointSize", 0.1, 8, 0.1)
        .name("Point Size")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      const oceanParticleFolder = dissolveFolder.addFolder("Ocean");
      oceanParticleFolder
        .add(sceneConfigRef.current.dissolve, "oceanPointSize", 0.05, 2, 0.05)
        .name("Point Size")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Ground Fog フォルダー（シェーダーベースの霧）
      const groundFogFolder = conceptFolder.addFolder("Ground Fog (地面霧)");

      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "enabled")
        .name("有効")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      groundFogFolder
        .addColor(sceneConfigRef.current.groundFog, "color")
        .name("色")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "density", 0, 2, 0.01)
        .name("濃度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "height", 1, 100, 1)
        .name("高さ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "noiseScale", 0.001, 0.1, 0.001)
        .name("ノイズスケール")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "noiseSeed", 0, 100, 0.1)
        .name("ノイズシード")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "noiseSpeed", 0, 2, 0.05)
        .name("ノイズ速度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "opacity", 0, 1, 0.01)
        .name("不透明度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "size", 50, 1000, 10)
        .name("サイズ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "segments", 8, 128, 8)
        .name("セグメント")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Ground Fog Position
      const groundFogPositionFolder = groundFogFolder.addFolder("Position");
      groundFogPositionFolder
        .add(sceneConfigRef.current.groundFog, "positionX", -200, 200, 1)
        .name("X")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      groundFogPositionFolder
        .add(sceneConfigRef.current.groundFog, "positionY", -200, 200, 1)
        .name("Y")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      groundFogPositionFolder
        .add(sceneConfigRef.current.groundFog, "positionZ", -200, 200, 1)
        .name("Z")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // カメラ追従設定
      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "followCamera")
        .name("カメラ追従")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      groundFogFolder
        .add(sceneConfigRef.current.groundFog, "cameraOffsetY", -50, 50, 0.5)
        .name("カメラオフセットY")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Hotel Lights フォルダー
      const hotelLightsFolder = conceptFolder.addFolder(
        "Hotel Lights (ホテルライト)"
      );

      // ヘルパー表示切替
      hotelLightsFolder
        .add(sceneConfigRef.current.hotelLights, "showHelpers")
        .name("ヘルパー表示")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      hotelLightsFolder
        .add(sceneConfigRef.current.hotelLights, "helperSize", 0.1, 5, 0.1)
        .name("ヘルパーサイズ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // ライト1〜4を追加するヘルパー関数
      const addLightControls = (
        parentFolder: GUI,
        lightKey: "light1" | "light2" | "light3" | "light4",
        lightName: string
      ) => {
        const lightFolder = parentFolder.addFolder(lightName);
        const lightConfig = sceneConfigRef.current!.hotelLights[lightKey];

        lightFolder
          .add(lightConfig, "enabled")
          .name("有効")
          .onChange(() =>
            setSceneConfig(structuredClone(sceneConfigRef.current!))
          );

        lightFolder
          .addColor(lightConfig, "color")
          .name("色")
          .onChange(() =>
            setSceneConfig(structuredClone(sceneConfigRef.current!))
          );

        lightFolder
          .add(lightConfig, "intensity", 0, 200, 0.1)
          .name("強度")
          .onChange(() =>
            setSceneConfig(structuredClone(sceneConfigRef.current!))
          );

        lightFolder
          .add(lightConfig, "power", 0, 5000, 1)
          .name("パワー (W)")
          .onChange(() =>
            setSceneConfig(structuredClone(sceneConfigRef.current!))
          );

        lightFolder
          .add(lightConfig, "distance", 0, 500, 0.1)
          .name("距離")
          .onChange(() =>
            setSceneConfig(structuredClone(sceneConfigRef.current!))
          );

        lightFolder
          .add(lightConfig, "decay", 0, 10, 0.01)
          .name("減衰")
          .onChange(() =>
            setSceneConfig(structuredClone(sceneConfigRef.current!))
          );

        const posFolder = lightFolder.addFolder("Position");
        posFolder
          .add(lightConfig, "positionX", -50, 50, 0.01)
          .name("X")
          .onChange(() =>
            setSceneConfig(structuredClone(sceneConfigRef.current!))
          );
        posFolder
          .add(lightConfig, "positionY", -50, 50, 0.01)
          .name("Y")
          .onChange(() =>
            setSceneConfig(structuredClone(sceneConfigRef.current!))
          );
        posFolder
          .add(lightConfig, "positionZ", -50, 50, 0.01)
          .name("Z")
          .onChange(() =>
            setSceneConfig(structuredClone(sceneConfigRef.current!))
          );
      };

      addLightControls(hotelLightsFolder, "light1", "Light 1");
      addLightControls(hotelLightsFolder, "light2", "Light 2");
      addLightControls(hotelLightsFolder, "light3", "Light 3");
      addLightControls(hotelLightsFolder, "light4", "Light 4");

      // Neon Sign フォルダー
      const neonSignFolder =
        conceptFolder.addFolder("Neon Sign (ネオンサイン)");

      neonSignFolder
        .add(sceneConfigRef.current.neonSign, "enabled")
        .name("有効")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      neonSignFolder
        .add(sceneConfigRef.current.neonSign, "showHelpers")
        .name("ライトヘルパー表示")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      neonSignFolder
        .add(sceneConfigRef.current.neonSign, "helperSize", 0.01, 1, 0.01)
        .name("ヘルパーサイズ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      neonSignFolder
        .add(sceneConfigRef.current.neonSign, "flickerEnabled")
        .name("点滅効果")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      neonSignFolder
        .add(sceneConfigRef.current.neonSign, "flickerSpeed", 0, 5, 0.1)
        .name("点滅速度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      neonSignFolder
        .add(sceneConfigRef.current.neonSign, "flickerIntensity", 0, 1, 0.01)
        .name("点滅強度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      neonSignFolder
        .add(sceneConfigRef.current.neonSign, "glowIntensity", 0, 5, 0.1)
        .name("グロー強度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // 縦書きサイン
      const verticalSignFolder = neonSignFolder.addFolder(
        "Vertical Sign (縦書き)"
      );

      verticalSignFolder
        .add(sceneConfigRef.current.neonSign.verticalSign, "enabled")
        .name("有効")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      verticalSignFolder
        .add(sceneConfigRef.current.neonSign.verticalSign, "text")
        .name("テキスト")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      verticalSignFolder
        .addColor(sceneConfigRef.current.neonSign.verticalSign, "color")
        .name("色")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      verticalSignFolder
        .add(
          sceneConfigRef.current.neonSign.verticalSign,
          "fontSize",
          0.01,
          0.2,
          0.001
        )
        .name("フォントサイズ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      verticalSignFolder
        .add(
          sceneConfigRef.current.neonSign.verticalSign,
          "emissiveIntensity",
          0,
          20,
          0.1
        )
        .name("発光強度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      verticalSignFolder
        .add(
          sceneConfigRef.current.neonSign.verticalSign,
          "letterSpacing",
          -0.1,
          0.2,
          0.005
        )
        .name("文字間隔")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      const verticalPosFolder = verticalSignFolder.addFolder("Position");
      verticalPosFolder
        .add(
          sceneConfigRef.current.neonSign.verticalSign,
          "positionX",
          -1,
          1,
          0.01
        )
        .name("X")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      verticalPosFolder
        .add(
          sceneConfigRef.current.neonSign.verticalSign,
          "positionY",
          -1,
          1,
          0.01
        )
        .name("Y")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      verticalPosFolder
        .add(
          sceneConfigRef.current.neonSign.verticalSign,
          "positionZ",
          -1,
          1,
          0.01
        )
        .name("Z")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      verticalPosFolder
        .add(
          sceneConfigRef.current.neonSign.verticalSign,
          "rotationY",
          -Math.PI,
          Math.PI,
          0.01
        )
        .name("回転Y")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // 横書きサイン
      const horizontalSignFolder = neonSignFolder.addFolder(
        "Horizontal Sign (横書き)"
      );

      horizontalSignFolder
        .add(sceneConfigRef.current.neonSign.horizontalSign, "enabled")
        .name("有効")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      horizontalSignFolder
        .add(sceneConfigRef.current.neonSign.horizontalSign, "text")
        .name("テキスト")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      horizontalSignFolder
        .addColor(sceneConfigRef.current.neonSign.horizontalSign, "color")
        .name("色")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      horizontalSignFolder
        .add(
          sceneConfigRef.current.neonSign.horizontalSign,
          "fontSize",
          0.01,
          0.2,
          0.001
        )
        .name("フォントサイズ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      horizontalSignFolder
        .add(
          sceneConfigRef.current.neonSign.horizontalSign,
          "emissiveIntensity",
          0,
          10,
          0.1
        )
        .name("発光強度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      const horizontalPosFolder = horizontalSignFolder.addFolder("Position");
      horizontalPosFolder
        .add(
          sceneConfigRef.current.neonSign.horizontalSign,
          "positionX",
          -1,
          1,
          0.01
        )
        .name("X")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      horizontalPosFolder
        .add(
          sceneConfigRef.current.neonSign.horizontalSign,
          "positionY",
          -1,
          1,
          0.01
        )
        .name("Y")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      horizontalPosFolder
        .add(
          sceneConfigRef.current.neonSign.horizontalSign,
          "positionZ",
          -1,
          1,
          0.01
        )
        .name("Z")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
      horizontalPosFolder
        .add(
          sceneConfigRef.current.neonSign.horizontalSign,
          "rotationY",
          -Math.PI,
          Math.PI,
          0.01
        )
        .name("回転Y")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      // Bloom フォルダー
      const bloomFolder = conceptFolder.addFolder("Bloom (発光エフェクト)");

      bloomFolder
        .add(sceneConfigRef.current.bloom, "enabled")
        .name("有効")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      bloomFolder
        .add(sceneConfigRef.current.bloom, "intensity", 0, 5, 0.1)
        .name("強度")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      bloomFolder
        .add(sceneConfigRef.current.bloom, "luminanceThreshold", 0, 1, 0.01)
        .name("明るさ閾値")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      bloomFolder
        .add(sceneConfigRef.current.bloom, "luminanceSmoothing", 0, 1, 0.01)
        .name("閾値の滑らかさ")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );

      bloomFolder
        .add(sceneConfigRef.current.bloom, "radius", 0, 2, 0.05)
        .name("半径")
        .onChange(() =>
          setSceneConfig(structuredClone(sceneConfigRef.current!))
        );
    }

    // ====================================
    // Map用のコントロール (Map フォルダー配下)
    // ====================================
    if (
      sharedDebugFolder &&
      mapConfigRef.current &&
      setMapConfig &&
      !sharedMapFolder
    ) {
      const mapFolder = sharedDebugFolder.addFolder("Map");
      sharedMapFolder = mapFolder;

      // Map Position
      const mapPositionFolder = mapFolder.addFolder("Map Position");
      mapPositionFolder
        .add(mapConfigRef.current, "positionX", -100, 100, 0.1)
        .onChange(() => setMapConfig(structuredClone(mapConfigRef.current!)));
      mapPositionFolder
        .add(mapConfigRef.current, "positionY", -100, 100, 0.1)
        .onChange(() => setMapConfig(structuredClone(mapConfigRef.current!)));
      mapPositionFolder
        .add(mapConfigRef.current, "positionZ", -100, 100, 0.1)
        .onChange(() => setMapConfig(structuredClone(mapConfigRef.current!)));

      // Map Scale
      const mapScaleFolder = mapFolder.addFolder("Map Scale");
      mapScaleFolder
        .add(mapConfigRef.current, "scaleX", 0.1, 5, 0.1)
        .onChange(() => setMapConfig(structuredClone(mapConfigRef.current!)));
      mapScaleFolder
        .add(mapConfigRef.current, "scaleY", 0.1, 5, 0.1)
        .onChange(() => setMapConfig(structuredClone(mapConfigRef.current!)));
      mapScaleFolder
        .add(mapConfigRef.current, "scaleZ", 0.1, 5, 0.1)
        .onChange(() => setMapConfig(structuredClone(mapConfigRef.current!)));

      // Map Rotation
      const mapRotationFolder = mapFolder.addFolder("Map Rotation");
      mapRotationFolder
        .add(mapConfigRef.current, "rotationX", -Math.PI, Math.PI, 0.01)
        .onChange(() => setMapConfig(structuredClone(mapConfigRef.current!)));
      mapRotationFolder
        .add(mapConfigRef.current, "rotationY", -Math.PI, Math.PI, 0.01)
        .onChange(() => setMapConfig(structuredClone(mapConfigRef.current!)));
      mapRotationFolder
        .add(mapConfigRef.current, "rotationZ", -Math.PI, Math.PI, 0.01)
        .onChange(() => setMapConfig(structuredClone(mapConfigRef.current!)));

      // Hotel controls for Map scene
      if (hotelConfigRef.current && setHotelConfig) {
        // Hotel Position (Map用)
        const hotelPositionFolder = mapFolder.addFolder("Hotel Position");
        hotelPositionFolder
          .add(hotelConfigRef.current, "positionX", -100, 100, 0.1)
          .onChange(() =>
            setHotelConfig(structuredClone(hotelConfigRef.current!))
          );
        hotelPositionFolder
          .add(hotelConfigRef.current, "positionY", -100, 100, 0.1)
          .onChange(() =>
            setHotelConfig(structuredClone(hotelConfigRef.current!))
          );
        hotelPositionFolder
          .add(hotelConfigRef.current, "positionZ", -100, 100, 0.1)
          .onChange(() =>
            setHotelConfig(structuredClone(hotelConfigRef.current!))
          );

        // Hotel Scale (Map用)
        const hotelScaleFolder = mapFolder.addFolder("Hotel Scale");
        hotelScaleFolder
          .add(hotelConfigRef.current, "scale", 0.1, 5, 0.1)
          .onChange(() =>
            setHotelConfig(structuredClone(hotelConfigRef.current!))
          );

        // Hotel Rotation (Map用)
        const hotelRotationFolder = mapFolder.addFolder("Hotel Rotation");
        hotelRotationFolder
          .add(hotelConfigRef.current, "rotationX", -Math.PI, Math.PI, 0.01)
          .onChange(() =>
            setHotelConfig(structuredClone(hotelConfigRef.current!))
          );
        hotelRotationFolder
          .add(hotelConfigRef.current, "rotationY", -Math.PI, Math.PI, 0.01)
          .onChange(() =>
            setHotelConfig(structuredClone(hotelConfigRef.current!))
          );
        hotelRotationFolder
          .add(hotelConfigRef.current, "rotationZ", -Math.PI, Math.PI, 0.01)
          .onChange(() =>
            setHotelConfig(structuredClone(hotelConfigRef.current!))
          );
      }
    }

    return () => {
      sharedInstanceCount -= 1;
      if (sharedInstanceCount === 0 && sharedGui) {
        sharedGui.destroy();
        sharedGui = null;
        sharedDebugFolder = null;
        sharedConceptFolder = null;
        sharedMapFolder = null;
      }
    };
  }, [isDebugEnabled, setSceneConfig, setMapConfig, setHotelConfig]);

  return null;
};
