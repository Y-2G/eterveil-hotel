import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type MaterialEntry = {
  material: THREE.Material;
  baseOpacity: number;
  baseTransparent: boolean;
};

type MeshEntry = {
  mesh: THREE.Mesh;
  baseVisible: boolean;
};

type Props = {
  sourceRef: RefObject<THREE.Group>;
  progress?: number;
  maxPoints?: number;
  color?: string;
  size?: number;
  sizeAttenuation?: boolean;
  scatterMultiplier?: number;
  scatterStart?: number;
  rebuildKey?: string;
};

export const DissolveParticles = ({
  sourceRef,
  progress = 0,
  maxPoints = 12000,
  color = "#cfd8df",
  size = 0.5,
  sizeAttenuation = true,
  scatterMultiplier = 1,
  scatterStart = 0,
  rebuildKey,
}: Props) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const originRef = useRef<Float32Array | null>(null);
  const scatterRef = useRef<Float32Array | null>(null);
  const materialsRef = useRef<MaterialEntry[]>([]);
  const meshesRef = useRef<MeshEntry[]>([]);
  const lastProgressRef = useRef(-1);
  const lastScatterStartRef = useRef(-1);

  useEffect(() => {
    const root = sourceRef.current;
    if (!root) return;

    const materials: MaterialEntry[] = [];
    const meshes: MeshEntry[] = [];
    root.traverse((node) => {
      if (node instanceof THREE.Mesh && node.material) {
        meshes.push({ mesh: node, baseVisible: node.visible });
        const list = Array.isArray(node.material)
          ? node.material
          : [node.material];
        list.forEach((mat) => {
          materials.push({
            material: mat,
            baseOpacity: mat.opacity ?? 1,
            baseTransparent: mat.transparent,
          });
        });
      }
    });
    materialsRef.current = materials;
    meshesRef.current = meshes;

    return () => {
      materials.forEach(({ material, baseOpacity, baseTransparent }) => {
        material.opacity = baseOpacity;
        material.transparent = baseTransparent;
      });
      meshes.forEach(({ mesh, baseVisible }) => {
        mesh.visible = baseVisible;
      });
    };
  }, [sourceRef, rebuildKey]);

  useEffect(() => {
    const root = sourceRef.current;
    if (!root) return;

    root.updateWorldMatrix(true, true);
    const groupInverse = new THREE.Matrix4()
      .copy(root.matrixWorld)
      .invert();

    const meshes: THREE.Mesh[] = [];
    let totalVertices = 0;

    root.traverse((node) => {
      if (node instanceof THREE.Mesh && node.geometry) {
        const position = node.geometry.getAttribute("position");
        if (!position) return;
        meshes.push(node);
        totalVertices += position.count;
      }
    });

    if (totalVertices === 0) return;

    const stride = Math.max(1, Math.ceil(totalVertices / maxPoints));
    const positions: number[] = [];
    const temp = new THREE.Vector3();
    const box = new THREE.Box3();
    box.makeEmpty();

    meshes.forEach((mesh) => {
      const position = mesh.geometry.getAttribute("position");
      if (!position) return;
      for (let i = 0; i < position.count; i += stride) {
        temp.fromBufferAttribute(position, i);
        temp.applyMatrix4(mesh.matrixWorld);
        temp.applyMatrix4(groupInverse);
        positions.push(temp.x, temp.y, temp.z);
        box.expandByPoint(temp);
      }
    });

    if (positions.length === 0) return;

    const center = box.getCenter(new THREE.Vector3());
    const sizeVec = box.getSize(new THREE.Vector3());
    const radius = sizeVec.length() * 0.5;
    const baseScatter = THREE.MathUtils.clamp(radius * 0.15, 6, 40);
    const scatterDistance = baseScatter * scatterMultiplier;

    const origin = new Float32Array(positions);
    const scatter = new Float32Array(positions.length);
    const dir = new THREE.Vector3();
    const rand = new THREE.Vector3();

    for (let i = 0; i < positions.length; i += 3) {
      dir.set(
        positions[i] - center.x,
        positions[i + 1] - center.y,
        positions[i + 2] - center.z
      );
      if (dir.lengthSq() < 1e-6) {
        dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      }
      dir.normalize();
      rand.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      if (rand.lengthSq() > 0) {
        rand.normalize();
        dir.lerp(rand, 0.35).normalize();
      }
      const magnitude = scatterDistance * (0.5 + Math.random() * 0.8);
      scatter[i] = dir.x * magnitude;
      scatter[i + 1] = dir.y * magnitude;
      scatter[i + 2] = dir.z * magnitude;
    }

    const newGeometry = new THREE.BufferGeometry();
    const dynamicPositions = new Float32Array(origin.length);
    dynamicPositions.set(origin);
    newGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(dynamicPositions, 3)
    );
    newGeometry.computeBoundingSphere();

    geometryRef.current = newGeometry;
    originRef.current = origin;
    scatterRef.current = scatter;
    lastProgressRef.current = -1;
    setGeometry((prev) => {
      prev?.dispose();
      return newGeometry;
    });
  }, [sourceRef, maxPoints, scatterMultiplier, rebuildKey]);

  useFrame(() => {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    const scatterStartClamped = THREE.MathUtils.clamp(scatterStart, 0, 1);
    if (
      Math.abs(clamped - lastProgressRef.current) < 0.001 &&
      Math.abs(scatterStartClamped - lastScatterStartRef.current) < 0.001
    ) {
      return;
    }
    lastProgressRef.current = clamped;
    lastScatterStartRef.current = scatterStartClamped;
    const fadeOutStart = 0.9;
    const fadeOut =
      1 -
      THREE.MathUtils.clamp(
        (clamped - fadeOutStart) / (1 - fadeOutStart),
        0,
        1
      );
    const particleOpacity = Math.min(1, clamped * 1.15) * fadeOut;

    const origin = originRef.current;
    const scatter = scatterRef.current;
    const currentGeometry = geometryRef.current;
    const positionAttr = currentGeometry?.getAttribute(
      "position"
    ) as THREE.BufferAttribute | null;

    if (origin && scatter && positionAttr) {
      const target = positionAttr.array as Float32Array;
      const scatterT =
        scatterStartClamped >= 1
          ? 0
          : THREE.MathUtils.clamp(
              (clamped - scatterStartClamped) /
                (1 - scatterStartClamped),
              0,
              1
            );
      const t = scatterT * scatterT;
      for (let i = 0; i < origin.length; i++) {
        target[i] = origin[i] + scatter[i] * t;
      }
      positionAttr.needsUpdate = true;
    }

    if (pointsRef.current) {
      pointsRef.current.visible = particleOpacity > 0.001;
    }

    if (materialRef.current) {
      materialRef.current.opacity = particleOpacity;
    }

    const isDissolving = clamped > 0.001;
    meshesRef.current.forEach(({ mesh, baseVisible }) => {
      mesh.visible = isDissolving ? false : baseVisible;
    });

    const meshFade = 1 - Math.min(1, clamped * 1.1);
    materialsRef.current.forEach(
      ({ material, baseOpacity, baseTransparent }) => {
        material.opacity = baseOpacity * meshFade;
        if (isDissolving) {
          material.transparent = true;
        } else {
          material.transparent = baseTransparent;
        }
      }
    );
  });

  if (!geometry) return null;

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={materialRef}
        color={color}
        size={size}
        sizeAttenuation={sizeAttenuation}
        transparent={true}
        opacity={0}
        depthWrite={false}
      />
    </points>
  );
};
