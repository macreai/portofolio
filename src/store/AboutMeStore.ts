import { useEffect } from "react";
import { useStore } from "./store";
import * as THREE from "three";

export const AboutMeStore = () => {
    const { VRM, setCamera, playAnim, setIsIntroPlaying, isIntroPlaying, setNameVisible, nameVisible, projectVisible } = useStore();
        
    useEffect(() => {
        if (!VRM) {
            return; 
        } else {
            setNameVisible(true);
        }
        const charPos = VRM.scene.position;
        const headNode = VRM.humanoid?.getNormalizedBoneNode('head');
        
        if (headNode) {
            const headWorldPos = new THREE.Vector3();
            headNode.getWorldPosition(headWorldPos);            
            setCamera(
                new THREE.Vector3(charPos.x, 1.6, charPos.z + 0.6), 
                new THREE.Vector3(charPos.x, 1.3, charPos.z)
            );
        }

        const playAnimations = async () => {
            await playAnim('animations/Standing Greeting.fbx', true);
            await playAnim('animations/Standing Idle.fbx', false);
            setIsIntroPlaying(false);
        };

        playAnimations();
    }, [VRM, playAnim]);

    const handleClick = () => {
        if (isIntroPlaying) return;
        playAnim('animations/Bashful.fbx', true).then(() => playAnim('animations/Standing Idle.fbx', false));
    }

    return {
        VRM,
        handleClick,
        nameVisible,
        projectVisible
    }
}

// new THREE.Vector3(charPos.x, 1.6, charPos.z + 0.6), 
// new THREE.Vector3(charPos.x, 1.3, charPos.z)
// targetCamPos.set(charPos.x, 1.8, charPos.z + 0.8);
// targetLookAt.set(charPos.x, 1.29, charPos.z);
// targetCamPos.set(charPos.x - 1, headWorldPos.y, charPos.z + 1);
// targetLookAt.set(headWorldPos.x + 1, headWorldPos.y, headWorldPos.z);
// targetCamPos.set(charPos.x + 2.32, headWorldPos.y, charPos.z + 1.8);
// targetLookAt.set(headWorldPos.x + 1, headWorldPos.y, headWorldPos.z);