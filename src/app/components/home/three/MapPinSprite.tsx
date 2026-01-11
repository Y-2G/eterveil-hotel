"use client";

import { useRef, forwardRef, useImperativeHandle, useState } from "react";
import { Html } from "@react-three/drei";
import { Group } from "three";

export type MapPinSpriteRef = {
  setVisible: (visible: boolean) => void;
  setOpacity: (opacity: number) => void;
};

type Props = {
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onPinClick?: () => void;
  portalRef?: React.RefObject<HTMLElement>;
};

export const MapPinSprite = forwardRef<MapPinSpriteRef, Props>(
  ({ position = [0, 0, 0], onPinClick, portalRef }, ref) => {
    const groupRef = useRef<Group>(null);
    const [opacity, setOpacity] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    // 外部からの制御用API
    useImperativeHandle(ref, () => ({
      setVisible: (visible: boolean) => {
        if (visible) {
          setIsMounted(true);
          return;
        }

        setIsMounted(false);
        setOpacity(0);
      },
      setOpacity: (newOpacity: number) => {
        setOpacity(newOpacity);
      },
    }));

    return (
      <group ref={groupRef} position={position}>
        {/* HTML MapPin & Label */}
        {isMounted && (
          <Html
            center
            style={{
              opacity: opacity,
              pointerEvents: onPinClick ? "auto" : "none",
            }}
            zIndexRange={[100, 0]}
            portal={portalRef}
          >
            <div
              onClick={onPinClick}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                cursor: onPinClick ? "pointer" : "default",
              }}
            >
              {/* MapPin Icon */}
              <svg
                width="40"
                height="64"
                viewBox="0 0 32 54"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* ピン本体（縦長の涙型） */}
                <path
                  d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 54 16 54C16 54 32 24.837 32 16C32 7.163 24.837 0 16 0Z"
                  fill="#c77a7a"
                />
                {/* 内側の白い円 */}
                <circle
                  cx="16"
                  cy="16"
                  r="10"
                  fill="rgba(255, 255, 255, 0.9)"
                />
              </svg>
              {/* Label */}
              <div
                style={{
                  background: "rgba(40, 40, 40, 0.75)",
                  color: "rgba(255, 255, 255, 0.9)",
                  padding: "6px 14px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  fontFamily: "sans-serif",
                }}
              >
                ETERVEIL HOTEL
              </div>
            </div>
          </Html>
        )}
      </group>
    );
  }
);

MapPinSprite.displayName = "MapPinSprite";
