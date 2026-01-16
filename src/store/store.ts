import { create } from "zustand";
import type { AvatarState } from "../interfaces/Store";
import * as THREE from "three";

export const useStore = create<AvatarState>((set) => ({
  VRM: null,
  currentAnim: {
    url: "",
    onlyOnce: true
  },
  cameraTarget: { 
    pos: new THREE.Vector3(0, 0, 0), 
    lookAt: new THREE.Vector3(0, 0, 0) 
  },
  playAnim: async () => {},
  isIntroPlaying: true,  
  nameVisible: false,
  projectVisible: false,
  setIsIntroPlaying: (value) => set({ isIntroPlaying: value }),
  setVRM: (VRM) => set({ VRM }),
  setAnimation: (url, onlyOnce) => set({ currentAnim: {url, onlyOnce} }),
  setCamera: (pos, lookAt) => set({ cameraTarget: { pos, lookAt } }),
  setPlayAnim: (fn) => set({ playAnim: fn }),
  setNameVisible: (value) => set({ nameVisible: value }),
  setProjectVisible: (value) => set({ projectVisible: value })
}));