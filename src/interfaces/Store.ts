import * as THREE from "three";

export interface AvatarState {
  VRM: any | null;
  currentAnim: { url:string, onlyOnce: boolean };
  cameraTarget: { pos: THREE.Vector3; lookAt: THREE.Vector3 };
  playAnim: (url: string, onlyOnce?: boolean) => Promise<any>;
  isIntroPlaying: boolean;        
  setIsIntroPlaying: (value: boolean) => void;
  nameVisible: boolean;
  projectVisible: boolean;
  setVRM: (VRM: any) => void;
  setAnimation: (url: string, onlyOnce: boolean) => void;
  setCamera: (pos: THREE.Vector3, lookAt: THREE.Vector3) => void;
  setPlayAnim: (fn: (url: string, onlyOnce?: boolean) => Promise<any>) => void;
  setNameVisible: (value: boolean) => void;
  setProjectVisible: (value: boolean) => void;
}