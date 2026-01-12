import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { DissolveParticles } from "./DissolveParticles";

interface WorldModelProps {
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  scale?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  dissolveProgress?: number;
  dissolveMaxPoints?: number;
  dissolvePointSize?: number;
  dissolveScatterStart?: number;
}

export interface WorldModelRef {
  /** ワールドモデルのGroupへの参照 */
  group: THREE.Group | null;
  /** GLTFシーンへの参照（草配置用の地形として使用可能） */
  scene: THREE.Group | null;
}

export const WorldModel = forwardRef<WorldModelRef, WorldModelProps>(
  (
    {
      positionX = 0,
      positionY = 0,
      positionZ = 0,
      scale = 1,
      rotationX = 0,
      rotationY = 0,
      rotationZ = 0,
      dissolveProgress = 0,
      dissolveMaxPoints = 20000,
      dissolvePointSize = 0.6,
      dissolveScatterStart = 0,
    },
    ref
  ) => {
    const gltf = useGLTF("/models/world.glb");
    const groupRef = useRef<THREE.Group>(null);

    // 外部からgroup, sceneを参照可能にする
    useImperativeHandle(ref, () => ({
      group: groupRef.current,
      scene: gltf.scene,
    }));

    // Set doubleSided to false on model load
    useEffect(() => {
      if (gltf.scene) {
        gltf.scene.traverse((node) => {
          if (node instanceof THREE.Mesh && node.material) {
            const material = node.material as THREE.Material;
            if (Array.isArray(material)) {
              material.forEach((mat) => {
                mat.side = THREE.FrontSide;
              });
            } else {
              material.side = THREE.FrontSide;
            }
          }
        });
      }
    }, [gltf]);

    useEffect(() => {
      if (groupRef.current) {
        groupRef.current.position.set(positionX, positionY, positionZ);
        groupRef.current.scale.set(scale, scale, scale);
        groupRef.current.rotation.set(rotationX, rotationY, rotationZ);
      }
    }, [
      positionX,
      positionY,
      positionZ,
      scale,
      rotationX,
      rotationY,
      rotationZ,
    ]);

    const rebuildKey = [
      positionX,
      positionY,
      positionZ,
      scale,
      rotationX,
      rotationY,
      rotationZ,
    ].join("-");

    return (
      <group ref={groupRef}>
        <primitive object={gltf.scene} />
        <DissolveParticles
          sourceRef={groupRef as React.RefObject<THREE.Group>}
          progress={dissolveProgress}
          maxPoints={dissolveMaxPoints}
          size={dissolvePointSize}
          scatterStart={dissolveScatterStart}
          scatterMultiplier={1.15}
          color="#cfd8df"
          rebuildKey={rebuildKey}
        />
      </group>
    );
  }
);

WorldModel.displayName = "WorldModel";

// Preload the model
useGLTF.preload("/models/world.glb");
