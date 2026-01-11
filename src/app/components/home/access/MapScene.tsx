import { useGLTF, OrbitControls } from "@react-three/drei";
import { MapConfig, HotelConfig } from "./MapCanvas";

interface MapSceneProps {
  mapConfig: MapConfig;
  hotelConfig: HotelConfig;
}

export const MapScene = ({ mapConfig, hotelConfig }: MapSceneProps) => {
  const { scene: mapScene } = useGLTF("/models/map.glb");
  const { scene: hotelScene } = useGLTF("/models/hottel.glb");
  const clonedMapScene = mapScene.clone();
  const clonedHotelScene = hotelScene.clone();

  return (
    <>
      {/* ライティング */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 5]} intensity={0.8} />

      {/* カメラコントロール */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        autoRotate={false}
        minDistance={10}
        maxDistance={100}
      />

      {/* Mapモデルの読み込み */}
      <group
        position={[
          mapConfig.positionX,
          mapConfig.positionY,
          mapConfig.positionZ,
        ]}
        rotation={[
          mapConfig.rotationX,
          mapConfig.rotationY,
          mapConfig.rotationZ,
        ]}
        scale={[mapConfig.scaleX, mapConfig.scaleY, mapConfig.scaleZ]}
      >
        <primitive object={clonedMapScene} />
      </group>

      {/* Hotelモデルの読み込み */}
      <group
        position={[
          hotelConfig.positionX,
          hotelConfig.positionY,
          hotelConfig.positionZ,
        ]}
        rotation={[
          hotelConfig.rotationX,
          hotelConfig.rotationY,
          hotelConfig.rotationZ,
        ]}
        scale={hotelConfig.scale}
      >
        <primitive object={clonedHotelScene} />
      </group>
    </>
  );
};
