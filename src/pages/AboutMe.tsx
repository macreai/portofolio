import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import { AvatarView } from "../components/avatar/AvatarView";
import { Object3DAnimation } from "../components/additional/Object3DAnimation";
import { FilmPerforations } from "../components/additional/FilmPerforations";
import { AboutMeStore } from "../store/AboutMeStore";

function AboutMe() {

    const { VRM, nameVisible, projectVisible, handleClick } = AboutMeStore();

    return (
        <div className="relative w-full h-screen bg-[#93032E] px-12 overflow-hidden snap-start">
            <div className={`absolute left-0 top-0 h-[200%] w-12 bg-[#151515] z-30 transition-transform duration-5000 
                ${VRM ? "translate-y-[-50%]" : "translate-y-0"} animate-[slide_20s_linear_infinite]`}>
                <FilmPerforations colorHex="#93032E"/>
            </div>

            <div className={`absolute right-0 top-0 h-[200%] w-12 bg-[#151515] z-30 transition-transform duration-5000 
                ${VRM ? "translate-y-[-50%]" : "translate-y-0"} animate-[slide_20s_linear_infinite]`}>
                <FilmPerforations colorHex="#93032E"/>
            </div>

            <div className="w-full h-screen snap-start bg-[#93032E] relative overflow-hidden">
                <div className={`fixed inset-0 z-100 bg-[#93032E] flex flex-col items-center justify-center transition-all duration-1000 ease-in-out
                    ${VRM ? "opacity-0 pointer-events-none scale-110" : "opacity-100"}`}>
                    
                    <h2 className="monoton-regular text-[#151515] text-3xl animate-pulse tracking-widest">
                        LOADING
                    </h2>
                    <div className="w-48 h-0.5 bg-[#151515]/20 mt-4 overflow-hidden">
                        <div className="w-full h-full bg-[#151515] origin-left animate-[loading_2s_easeInOut_infinite]"></div>
                    </div>
                </div>

                <div className={`absolute top-20 left-10 z-20 pointer-events-none transition-all duration-5000 ease-out 
                    ${nameVisible ? "opacity-100" : "opacity-0"}`}>
                    
                    <h1 className="text-[#151515] text-6xl md:text-6xl monoton-regular uppercase leading-tight">
                        Arda<br/>Ardiyansyah
                    </h1>
                    <p className="text-[#151515]/70 text-xl tracking-[0.3em] uppercase mt-2 font-sans">
                        3D Web & ML Engineer
                    </p>
                </div>

                <div className={`absolute top-20 right-10 z-20 pointer-events-none transition-all duration-5000 ease-out 
                    ${projectVisible ? "opacity-100" : "opacity-0"}`}>             
                    <h1 className="text-[#151515] text-6xl md:text-6xl monoton-regular uppercase leading-tight">
                        Projects
                    </h1>
                </div>

                <div className="absolute inset-0 z-10">
                    <Canvas camera={{ position: [0, 0, 5] }}>
                        <ambientLight intensity={1.5} />
                        <pointLight position={[5, 5, 5]} />
                        <ScrollControls pages={1} damping={0.4}>
                            <Suspense fallback={null}> 
                                <AvatarView handleClick={handleClick}/>
                                <Object3DAnimation
                                    url={"models/technical_difficulties.glb"}
                                    position={[2, 0, -2]}
                                    rotation={[0, THREE.MathUtils.degToRad(200), 0]}
                                    scale={0.2}
                                />
                            </Suspense>
                        </ScrollControls>
                    </Canvas>
                </div>
            </div>
        </div>
        
    )
}

export default AboutMe;