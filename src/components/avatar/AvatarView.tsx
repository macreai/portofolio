import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { loadMixamoAnimation, useVRM } from ".";
import { useStore } from "../../store/store";
import type { AvatarViewProps } from "../../interfaces/Avatar";
import { useScroll } from "@react-three/drei";

export const AvatarView = ({ handleClick }: AvatarViewProps) => {

    const scroll = useScroll();

    const gltf = useVRM('models/model.vrm');
    const vrm = gltf?.userData.vrm;
    
    const mixer = useMemo(() => (vrm ? new THREE.AnimationMixer(vrm.scene) : null), [vrm]);
    const currentActionRef = useRef<THREE.AnimationAction | null>(null);
    const clipsCache = useRef<Record<string, THREE.AnimationClip>>({});
    const lastPageRef = useRef<number>(-1);
    
    const { setVRM, setAnimation, cameraTarget, setCamera, setPlayAnim, isIntroPlaying, setNameVisible, setProjectVisible } = useStore();
    
    useEffect(() => {
        if (mixer && vrm) {
            setPlayAnim(playAnimation);
        }
    }, [mixer, vrm]);

    useEffect(() => {
        if (vrm) setVRM(vrm);
    }, [vrm]);

    const playAnimation = async (url: string, onlyOnce: boolean = false) => {
        if (!mixer || !vrm) return;
        if (!clipsCache.current[url]) clipsCache.current[url] = await loadMixamoAnimation(url, vrm);
        
        const clip = clipsCache.current[url];
        const newAction = mixer.clipAction(clip);
        newAction.reset().setLoop(onlyOnce ? THREE.LoopOnce : THREE.LoopRepeat, onlyOnce ? 1 : Infinity);
        newAction.clampWhenFinished = true;

        if (currentActionRef.current) newAction.play(), currentActionRef.current.crossFadeTo(newAction, 0.4, true);
        else newAction.play();
        currentActionRef.current = newAction;
        setAnimation(url, onlyOnce);

        if (onlyOnce) {
            return new Promise((resolve) => {
                const onFinished = (e: any) => {
                    if (e.action === newAction) {
                        const hipsNode = vrm.humanoid?.getNormalizedBoneNode('hips');
                        if (hipsNode) {
                            const worldPos = new THREE.Vector3();
                            hipsNode.getWorldPosition(worldPos);
                            vrm.scene.position.set(worldPos.x, vrm.scene.position.y, worldPos.z);
                            hipsNode.position.set(0, hipsNode.position.y, 0);
                        }
                        mixer.removeEventListener('finished', onFinished);
                        resolve(newAction);
                    }
                };
                mixer.addEventListener('finished', onFinished);
            });
        }
    };


    useFrame((state, delta) => {
        if (!vrm || !mixer) return;

        mixer.update(delta);
        vrm.update(delta);

        if (isIntroPlaying) {
            const { pos, lookAt } = cameraTarget;
            state.camera.position.lerp(pos, 0.05);
            state.camera.lookAt(lookAt);
            return;
        }

        const charPos = vrm.scene.position;
        const headNode = vrm.humanoid?.getNormalizedBoneNode("head");
        if (!headNode) return;

        const headWorldPos = new THREE.Vector3();
        headNode.getWorldPosition(headWorldPos);

        const pageIndex = scroll.offset < 0.5 ? 0 : 1;

        const targetPos = new THREE.Vector3();
        const targetLookAt = new THREE.Vector3();

        if (lastPageRef.current !== pageIndex) {
            lastPageRef.current = pageIndex;

            if (pageIndex === 0) {
                setCamera(
                    targetPos.set(charPos.x, 1.5, charPos.z + 1),
                    targetLookAt.set(charPos.x, 1.3, charPos.z)
                );
                setNameVisible(true);
                setProjectVisible(false);
            } else if (pageIndex === 1) {
                setCamera(
                    targetPos.set(charPos.x - 1, headWorldPos.y, charPos.z + 1),
                    targetLookAt.set(headWorldPos.x + 4, headWorldPos.y, headWorldPos.z)
                );
                setNameVisible(false);
                setProjectVisible(true);
            }
        }

        const { pos, lookAt } = cameraTarget;
        state.camera.position.lerp(pos, 0.1);
        state.camera.lookAt(lookAt);

        if (vrm.lookAt) vrm.lookAt.target = state.camera;

        const t = state.clock.elapsedTime % 5.0;
        const blinkValue = t < 0.2 ? Math.sin(Math.PI * (t / 0.2)) : 0;
        vrm.expressionManager?.setValue("blink", blinkValue);
    });



    if (!gltf) return null;
    return (
        <primitive object={gltf.scene} onClick={handleClick} />
    );
};