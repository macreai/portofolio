import { Canvas } from "@react-three/fiber";
import { FilmPerforations } from "../components/additional/FilmPerforations";
import { Center } from "@react-three/drei";
import { Suspense } from "react";
import { Object3DAnimation } from "../components/additional/Object3DAnimation";
import * as THREE from "three";
import { ProjectStore } from "../store/ProjectStore";

function Project() {

    const { sectionRef, shouldAnimate } = ProjectStore();
    
    return (
        <div ref={sectionRef} className="relative w-full h-screen bg-[#151515] px-12 overflow-hidden snap-start">

            <div className={`absolute left-0 top-0 h-[200%] w-12 bg-[#93032E] z-30 transition-transform duration-5000 
                ${shouldAnimate ? "translate-y-[-50%]" : "translate-y-0"} animate-[slide_20s_linear_infinite]`}>
                <FilmPerforations colorHex="#151515"/>
            </div>

            <div className={`absolute right-0 top-0 h-[200%] w-12 bg-[#93032E] z-30 transition-transform duration-5000 
                ${shouldAnimate ? "translate-y-[-50%]" : "translate-y-0"} animate-[slide_20s_linear_infinite]`}>
                <FilmPerforations colorHex="#151515"/>
            </div>

            <div className="w-full h-screen snap-start bg-[#151515] relative overflow-hidden">
                <div className={`absolute top-20 right-10 z-20 pointer-events-none transition-all duration-5000 ease-out 
                    ${shouldAnimate ? "opacity-100" : "opacity-0"}`}>             
                    <h1 className="text-[#93032E] text-6xl md:text-6xl monoton-regular uppercase leading-tight">
                        Projects
                    </h1>
                </div>
                <div className="absolute inset-0 z-10">
                    <Canvas camera={{ position: [0, 0.5, 3] }}>
                        <ambientLight intensity={1.5} />
                        <pointLight position={[5, 5, 5]} />
                        <Center>
                            <Suspense fallback={null}> 
                                <Object3DAnimation
                                    url={"models/post_apocalyptic_phone_booth.glb"}
                                    position={[-0.9, 0, 2]}
                                    rotation={[0, THREE.MathUtils.degToRad(70), 0]}
                                    scale={0.3}
                                />
                            </Suspense>
                        </Center>
                    </Canvas>
                </div>
        
                <div className="absolute bottom-10 right-20 z-20 flex flex-col items-center">
                    <div className="animate-bounce text-[#93032E]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Project;