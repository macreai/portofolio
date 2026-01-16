import { useAnimations, useGLTF } from "@react-three/drei"
import { useEffect } from "react";
import type { Object3DAnimationProps } from "../../interfaces/Object3D";

export const Object3DAnimation = ({ url, position, rotation, scale }: Object3DAnimationProps) => {
    const { scene, animations } = useGLTF(url);

    const { actions } = useAnimations(animations, scene);

    useEffect(() => {
        const animationName = Object.keys(actions)[0]; 
        
        if (actions[animationName]) {
        actions[animationName].play();
        }
    }, [actions]);

    return (
        <primitive 
            object={scene} 
            position={position}
            rotation={rotation} 
            scale={scale} 
        />
    );
}