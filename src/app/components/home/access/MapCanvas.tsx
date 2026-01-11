"use client";

import { Canvas as ThreeCanvas } from "@react-three/fiber";
import { MapScene } from "./MapScene";
import { MapConfig, HotelConfig } from "../../../hooks/useMapConfig";

export type { MapConfig, HotelConfig };

interface MapCanvasProps {
  mapConfig: MapConfig;
  hotelConfig: HotelConfig;
}

export const MapCanvas = ({ mapConfig, hotelConfig }: MapCanvasProps) => {
  return (
    <ThreeCanvas
      style={{ width: "100%", height: "100%" }}
      camera={{
        position: [0, 100, 0],
        fov: 50,
      }}
    >
      <MapScene mapConfig={mapConfig} hotelConfig={hotelConfig} />
    </ThreeCanvas>
  );
};
