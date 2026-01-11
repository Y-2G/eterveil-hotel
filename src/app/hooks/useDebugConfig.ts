import { useState } from "react";
import { debugConfig as initialConfig } from "../components/home/three/debugConfig";
import { DebugConfig } from "../components/home/three/types";

export const useDebugConfig = () => {
  const [config, setConfig] = useState<DebugConfig>(initialConfig);

  return { config, setConfig };
};
