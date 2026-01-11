import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
// three.js の examples から Sky をインポート
import { Sky as ThreeSky } from "three/examples/jsm/objects/Sky.js";
import { SkyConfig } from "./types";
import { DissolveParticles } from "./DissolveParticles";

interface SkyProps {
  config: SkyConfig;
  dissolveProgress?: number;
  dissolveMaxPoints?: number;
  dissolvePointSize?: number;
  dissolveColor?: string;
  dissolveScatterStart?: number;
}

/**
 * 物理ベースの Sky シェーダーを使ったリアルな空コンポーネント
 * three.js の Sky オブジェクトを使用して、時間帯による空の色変化を表現
 */
export const Sky = ({
  config,
  dissolveProgress = 0,
  dissolveMaxPoints = 200,
  dissolvePointSize = 2,
  dissolveColor = "#dbe8f3",
  dissolveScatterStart = 0,
}: SkyProps) => {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  const sky = useMemo(() => {
    const instance = new ThreeSky();
    instance.scale.setScalar(450000); // スカイドームのスケール（シーン全体を包む大きさ）
    instance.material.depthWrite = false; // 深度バッファに書き込まない
    instance.renderOrder = -1000; // 最初に描画
    return instance;
  }, []);

  useEffect(() => {
    // tone mapping の設定（HDR レンダリング用）
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.5;
  }, [gl]);

  useEffect(() => {
    return () => {
      sky.geometry.dispose();
      sky.material.dispose();
    };
  }, [sky]);

  // 太陽の位置を計算（球面座標系から3D座標へ変換）
  const sunPosition = useMemo(() => {
    const phi = THREE.MathUtils.degToRad(90 - config.elevation); // 仰角 -> 球面座標のφ
    const theta = THREE.MathUtils.degToRad(config.azimuth); // 方位角 -> 球面座標のθ

    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  }, [config.elevation, config.azimuth]);

  // Sky のパラメータを更新
  useEffect(() => {
    const uniforms = sky.material.uniforms;

    // 大気の濁り具合（1-20: 値が大きいほど霞んだ空）
    uniforms["turbidity"].value = config.turbidity;

    // レイリー散乱係数（0-4: 青空の強さ）
    uniforms["rayleigh"].value = config.rayleigh;

    // ミー散乱係数（0-0.1: 大気中の粒子による散乱）
    uniforms["mieCoefficient"].value = config.mieCoefficient;

    // ミー散乱の方向性（0-1: 太陽周辺の輝き）
    uniforms["mieDirectionalG"].value = config.mieDirectionalG;

    // 太陽の位置
    uniforms["sunPosition"].value.copy(sunPosition);
  }, [
    config.turbidity,
    config.rayleigh,
    config.mieCoefficient,
    config.mieDirectionalG,
    sunPosition,
    sky,
  ]);

  return (
    <group ref={groupRef}>
      <primitive object={sky} />
      <DissolveParticles
        sourceRef={groupRef}
        progress={dissolveProgress}
        maxPoints={dissolveMaxPoints}
        size={dissolvePointSize}
        color={dissolveColor}
        scatterStart={dissolveScatterStart}
        sizeAttenuation={false}
      />
    </group>
  );
};
