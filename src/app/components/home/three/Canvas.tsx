"use client";

import { useEffect, useState, useRef } from "react";
import { Canvas as ThreeCanvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scene, SceneRef } from "./Scene";
import { DebugConfig } from "./types";
import styles from "./styles.module.scss";

// ScrollTrigger プラグインを登録
gsap.registerPlugin(ScrollTrigger);

type Props = {
  debugConfig: DebugConfig;
  zIndex?: number;
  orbitControlsEnabled?: boolean;
  onMapPinClick?: () => void;
};

export type CameraState = {
  posX?: number;
  posY?: number;
  posZ?: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  zoom?: number;
  // カメラのターゲット位置
  targetX?: number;
  targetY?: number;
  targetZ?: number;
};

export type CameraSettings = {
  before: CameraState;
  after: CameraState;
};

// 初期カメラ設定はdebugConfigから取得するため、ここでは後半のアニメーション用設定のみ定義
const cameraAnimationSettings = {
  after: {
    zoom: 1,
    posX: 0,
    posY: 200,
    posZ: 0,
    rotX: -Math.PI / 2,
    rotY: 0,
    rotZ: 0,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
  },
};

// 画面幅に応じて相対的なtargetXを計算
// 基準: 画面幅1470pxのときtargetX = 45
const getRelativeTargetX = () => {
  if (typeof window === "undefined") return 45;
  const baseWidth = 1470;
  const baseTargetX = 45;
  return (window.innerWidth / baseWidth) * baseTargetX;
};

export const Canvas = ({
  debugConfig,
  zIndex = 1,
  orbitControlsEnabled = false,
  onMapPinClick,
}: Props) => {
  const [animationProgress] = useState(0);
  const [isMapPinLayerActive, setIsMapPinLayerActive] = useState(false);
  const [dissolveProgress, setDissolveProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1470
  );
  const [showOnlyHotel, setShowOnlyHotel] = useState(false);

  // 初期状態ではundefined（debugConfigの値を使用）
  // スクロールアニメーション時のみcameraStateを設定
  const [cameraState, setCameraState] = useState<CameraState | undefined>(
    undefined
  );
  const sceneRef = useRef<SceneRef>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const mapPinOpacityRef = useRef(0);
  const mapPinTweenRef = useRef<gsap.core.Tween | null>(null);
  const mapPinHideCallRef = useRef<gsap.core.Tween | null>(null);
  const dissolveProgressRef = useRef(0);
  const dissolveConfigRef = useRef({
    startDistance: debugConfig.dissolve.startDistance,
    endDistance: debugConfig.dissolve.endDistance,
  });

  useEffect(() => {
    dissolveConfigRef.current = {
      startDistance: debugConfig.dissolve.startDistance,
      endDistance: debugConfig.dissolve.endDistance,
    };
  }, [debugConfig.dissolve.startDistance, debugConfig.dissolve.endDistance]);

  // showOnlyHotelが変わったときにCanvas背景の透明度を更新
  useEffect(() => {
    if (glRef.current) {
      glRef.current.setClearColor("#0a1628", showOnlyHotel ? 0 : 1);
    }
  }, [showOnlyHotel]);

  // ウィンドウリサイズ時にwindowWidthを更新
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // カメラアニメーション: ScrollTrigger で駆動
  useEffect(() => {
    const canvasElement = document.getElementById("canvasA");
    if (!canvasElement) return;

    const ctx = gsap.context(() => {
      // conceptセクションに入ったらtargetXを0に、カメラZを40にアニメーション（スクロール連動）
      // targetXは画面幅に応じて相対計算（基準: 1470px = 45）
      const conceptCameraProxy = {
        targetX: getRelativeTargetX(),
        targetY: debugConfig.camera.targetY,
        targetZ: debugConfig.camera.targetZ,
        posZ: debugConfig.camera.positionZ,
      };
      gsap.to(conceptCameraProxy, {
        targetX: 0,
        targetY: 0,
        targetZ: 0,
        posZ: 40,
        ease: "none",
        scrollTrigger: {
          trigger: "#concept",
          start: "top bottom",
          end: "#facility-guest-rooms top",
          scrub: true,
          onLeave: () => {
            setCameraState((prev) => ({
              ...prev,
              targetX: 0,
              targetY: 0,
              targetZ: 0,
            }));
          },
        },
        onUpdate: () => {
          setCameraState((prev) => ({
            ...prev,
            targetX: conceptCameraProxy.targetX,
            targetY: conceptCameraProxy.targetY,
            targetZ: conceptCameraProxy.targetZ,
            posX: debugConfig.camera.positionX,
            posY: debugConfig.camera.positionY,
            posZ: conceptCameraProxy.posZ,
          }));
        },
      });

      // .b-content の開始時に縮小
      const isMobile = windowWidth < 768;

      if (isMobile) {
        // SP用: scaleで縮小（左下基点）
        gsap.fromTo(
          "#canvas-container",
          {
            scale: 1,
            transformOrigin: "left bottom",
          },
          {
            scale: 0.35,
            transformOrigin: "left bottom",
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              id: "canvas-shrink-mobile",
              trigger: "#divB .b-content",
              start: "top bottom",
              end: "bottom top",
              toggleActions: "play reverse play reverse",
              markers: false,
              onEnter: () => setShowOnlyHotel(true),
              onLeave: () => setShowOnlyHotel(false),
              onEnterBack: () => setShowOnlyHotel(true),
              onLeaveBack: () => setShowOnlyHotel(false),
            },
          }
        );

      } else {
        // デスクトップ用: 幅のみ縮小（既存アニメーション）
        gsap.fromTo(
          "#canvasA",
          { width: document.body.clientWidth },
          {
            width: document.body.clientWidth * 0.4,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              id: "canvas-shrink",
              trigger: "#divB .b-content",
              start: "top bottom",
              end: "bottom top",
              toggleActions: "play reverse play reverse",
              markers: false,
            },
          }
        );
      }

      // b-content 終了時のパン〜zoomOut を一つのタイムラインで制御
      const bContentCameraProxy = {
        zoom: 1,
        posX: debugConfig.camera.positionX,
        posY: debugConfig.camera.positionY,
        posZ: 40,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
      };
      const syncBContentCamera = () => {
        setCameraState({
          zoom: bContentCameraProxy.zoom,
          posX: bContentCameraProxy.posX,
          posY: bContentCameraProxy.posY,
          posZ: bContentCameraProxy.posZ,
          rotX: bContentCameraProxy.rotX,
          rotY: bContentCameraProxy.rotY,
          rotZ: bContentCameraProxy.rotZ,
          targetX: bContentCameraProxy.targetX,
          targetY: bContentCameraProxy.targetY,
          targetZ: bContentCameraProxy.targetZ,
        });
      };
      gsap
        .timeline({
          scrollTrigger: {
            trigger: "#divB .b-content",
            endTrigger: "#access",
            start: "bottom center",
            end: "top top",
            scrub: true,
            toggleActions: "play none none reverse",
            markers: false,
          },
        })
        .to(bContentCameraProxy, {
          ...cameraAnimationSettings.after,
          rotX: 0,
          rotY: 0,
          rotZ: 0,
          duration: 0.4,
          onUpdate: syncBContentCamera,
        })
        .to(bContentCameraProxy, {
          posY: 800,
          rotX: 0,
          rotY: 0,
          rotZ: 0,
          duration: 0.6,
          onUpdate: syncBContentCamera,
        });

      // FacilityDetails が画面内に現れたら青いオーブを表示
      // guest-rooms: 3つの固定位置オーブを表示
      ScrollTrigger.create({
        trigger: "#facility-guest-rooms",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          // Guest Rooms用の3つのオーブを表示
          sceneRef.current?.guestRoomOrb1?.setVisible(true);
          sceneRef.current?.guestRoomOrb2?.setVisible(true);
          sceneRef.current?.guestRoomOrb3?.setVisible(true);
        },
        onEnterBack: () => {
          // pool-spaから戻ってきた時
          sceneRef.current?.poolSpaOrb?.setVisible(false);
          sceneRef.current?.guestRoomOrb1?.setVisible(true);
          sceneRef.current?.guestRoomOrb2?.setVisible(true);
          sceneRef.current?.guestRoomOrb3?.setVisible(true);
        },
        onLeaveBack: () => {
          // 上にスクロールして離れた時に全て非表示
          sceneRef.current?.guestRoomOrb1?.setVisible(false);
          sceneRef.current?.guestRoomOrb2?.setVisible(false);
          sceneRef.current?.guestRoomOrb3?.setVisible(false);
        },
        markers: false,
      });

      // pool-spa: Pool & Spa用オーブを表示
      ScrollTrigger.create({
        trigger: "#facility-pool-spa",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          // Guest Roomsのオーブを非表示にし、Pool & Spaのオーブを表示
          sceneRef.current?.guestRoomOrb1?.setVisible(false);
          sceneRef.current?.guestRoomOrb2?.setVisible(false);
          sceneRef.current?.guestRoomOrb3?.setVisible(false);
          sceneRef.current?.poolSpaOrb?.setVisible(true);
        },
        onEnterBack: () => {
          // fine-diningから戻ってきた時
          sceneRef.current?.fineDiningOrb?.setVisible(false);
          sceneRef.current?.poolSpaOrb?.setVisible(true);
        },
        markers: false,
      });

      // fine-dining: Fine Dining用オーブを表示
      ScrollTrigger.create({
        trigger: "#facility-fine-dining",
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          // Pool & Spaのオーブを非表示にし、Fine Diningのオーブを表示
          sceneRef.current?.poolSpaOrb?.setVisible(false);
          sceneRef.current?.fineDiningOrb?.setVisible(true);
        },
        onLeave: () => {
          // 下にスクロールして離れた時に非表示
          sceneRef.current?.fineDiningOrb?.setVisible(false);
        },
        onEnterBack: () => {
          // contactから戻ってきた時
          sceneRef.current?.fineDiningOrb?.setVisible(true);
        },
        markers: false,
      });

      const animateMapPin = (visible: boolean) => {
        if (mapPinTweenRef.current) {
          mapPinTweenRef.current.kill();
        }
        if (mapPinHideCallRef.current) {
          mapPinHideCallRef.current.kill();
        }

        const targetOpacity = visible ? 1 : 0;
        const proxy = { value: mapPinOpacityRef.current };

        if (visible) {
          sceneRef.current?.mapPinSprite?.setVisible(true);
          setIsMapPinLayerActive(true);
        }

        mapPinTweenRef.current = gsap.to(proxy, {
          value: targetOpacity,
          duration: visible ? 0.5 : 0.3,
          ease: visible ? "power2.out" : "power2.in",
          onUpdate: () => {
            mapPinOpacityRef.current = proxy.value;
            sceneRef.current?.mapPinSprite?.setOpacity(proxy.value);
          },
          onComplete: () => {
            mapPinOpacityRef.current = targetOpacity;
          },
        });

        if (!visible) {
          mapPinHideCallRef.current = gsap.delayedCall(0.35, () => {
            mapPinOpacityRef.current = 0;
            sceneRef.current?.mapPinSprite?.setOpacity(0);
            sceneRef.current?.mapPinSprite?.setVisible(false);
            setIsMapPinLayerActive(false);
          });
        }
      };

      // Access セクションへのスクロールでMapPin Sprite & キャプションを表示/非表示
      ScrollTrigger.create({
        trigger: "#access",
        start: "top bottom",
        end: "bottom bottom", // カメラ下降前（Accessセクション中央）でフェードアウト
        onEnter: () => {
          animateMapPin(true);
          gsap.set("#mapCaptionWrap", { display: "block" });
          gsap.to("#mapCaptionWrap", {
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
            overwrite: true,
          });
        },
        onLeave: () => {
          animateMapPin(false);
          gsap.to("#mapCaptionWrap", {
            autoAlpha: 0,
            duration: 0.3,
            ease: "power2.in",
            overwrite: true,
            onComplete: () => {
              gsap.set("#mapCaptionWrap", { display: "none" });
            },
          });
        },
        onEnterBack: () => {
          animateMapPin(true);
          gsap.set("#mapCaptionWrap", { display: "block" });
          gsap.to("#mapCaptionWrap", {
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
            overwrite: true,
          });
        },
        onLeaveBack: () => {
          animateMapPin(false);
          gsap.to("#mapCaptionWrap", {
            autoAlpha: 0,
            duration: 0.3,
            ease: "power2.in",
            overwrite: true,
            onComplete: () => {
              gsap.set("#mapCaptionWrap", { display: "none" });
            },
          });
          setCameraState((prev) => ({
            ...prev,
            posZ: 40,
          }));
        },
        markers: false,
      });

      // カメラ移動: 弧を描くように（scrubで制御）
      // Access離れた後〜Contact開始までの間でスクロール連動
      const radius = 800;
      const arcOuterPosZ = 800;
      const arcAngleProxy = { angle: Math.PI / 2 };
      const arcCameraProxy = {
        ...cameraAnimationSettings.after,
        posY: 800,
        targetY: 0,
      };
      const updateDissolveProgress = (
        posX: number,
        posY: number,
        posZ: number
      ) => {
        const distance = Math.sqrt(posX * posX + posY * posY + posZ * posZ);
        const { startDistance, endDistance } = dissolveConfigRef.current;
        const raw =
          (startDistance - distance) / Math.max(1, startDistance - endDistance);
        const clamped = Math.min(1, Math.max(0, raw));
        if (clamped === dissolveProgressRef.current) return;
        dissolveProgressRef.current = clamped;
        setDissolveProgress(clamped);
      };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: "#transition-spacer",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            markers: false,
          },
        })
        // 第一段階: 弧を描く（角度を90度→0度に変化）
        .to(arcAngleProxy, {
          angle: 0,
          duration: 1,
          onUpdate: () => {
            const progress = 1 - arcAngleProxy.angle / (Math.PI / 2);
            arcCameraProxy.posY = radius * Math.sin(arcAngleProxy.angle);
            arcCameraProxy.posZ = arcOuterPosZ * progress;
            arcCameraProxy.rotX = (-Math.PI / 2) * (1 - progress);
            setCameraState({ ...arcCameraProxy });
            updateDissolveProgress(
              arcCameraProxy.posX ?? 0,
              arcCameraProxy.posY ?? 0,
              arcCameraProxy.posZ ?? 0
            );
          },
        })
        // 第二段階: 原点に近づく（posZを最終位置へ）
        .to(
          arcCameraProxy,
          {
            posX: 0.1,
            posY: -13,
            posZ: 0,
            duration: 0.5,
            onStart: () => {
              arcCameraProxy.targetY = -13;
            },
            onUpdate: () => {
              setCameraState({ ...arcCameraProxy });
              updateDissolveProgress(
                arcCameraProxy.posX ?? 0,
                arcCameraProxy.posY ?? 0,
                arcCameraProxy.posZ ?? 0
              );
            },
          },
          ">"
        );
    });

    return () => {
      mapPinTweenRef.current?.kill();
      mapPinHideCallRef.current?.kill();
      ctx.revert();
    };
    // windowWidthを依存配列に追加し、リサイズ時にScrollTriggerを再セットアップ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowWidth]);

  return (
    <div
      id="canvas-container"
      className={styles.canvasContainer}
      style={{
        zIndex: orbitControlsEnabled || isMapPinLayerActive ? 4 : zIndex,
      }}
    >
      <ThreeCanvas
        id="canvasA"
        className={styles.canvas}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        gl={{ alpha: true }}
        onCreated={({ gl }) => {
          glRef.current = gl;
          gl.setClearColor("#0a1628", showOnlyHotel ? 0 : 1);
        }}
      >
        <Scene
          ref={sceneRef}
          debugConfig={debugConfig}
          animationProgress={animationProgress}
          showOnlyHotel={showOnlyHotel}
          cameraState={cameraState}
          dissolveProgress={dissolveProgress}
          orbitControlsEnabled={orbitControlsEnabled}
          onMapPinClick={onMapPinClick}
        />
      </ThreeCanvas>
      {/* Map Overlay - Navy gradient */}
      <div
        className={styles.mapOverlay}
        style={{ display: showOnlyHotel ? "none" : undefined }}
      />
      {/* Desaturation Overlay */}
      <div className={styles.desaturationOverlay} />
    </div>
  );
};
