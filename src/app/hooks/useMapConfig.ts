import { useState } from "react";

export interface MapConfig {
  positionX: number;
  positionY: number;
  positionZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

export interface HotelConfig {
  positionX: number;
  positionY: number;
  positionZ: number;
  scale: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

const defaultMapConfig: MapConfig = {
  positionX: -1.5,
  positionY: 0,
  positionZ: -5.5,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
};

const defaultHotelConfig: HotelConfig = {
  positionX: 0,
  positionY: 5.6,
  positionZ: 0,
  scale: 1,
  rotationX: 0,
  rotationY: Math.PI / 2,
  rotationZ: 0,
};

export const useMapConfig = () => {
  const [mapConfig, setMapConfig] = useState<MapConfig>(defaultMapConfig);
  const [hotelConfig, setHotelConfig] =
    useState<HotelConfig>(defaultHotelConfig);

  return { mapConfig, setMapConfig, hotelConfig, setHotelConfig };
};
