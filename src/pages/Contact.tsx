import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/store";
import { FilmPerforations } from "../components/additional/FilmPerforations";

function Contact() {

    const { VRM } = useStore();
    
        const [isVisible, setIsVisible] = useState(false);
        const sectionRef = useRef(null);
    
        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.unobserve(entry.target);
                    }
                },
                { threshold: 0.2 }
            );
    
            if (sectionRef.current) {
                observer.observe(sectionRef.current);
            }
    
            return () => observer.disconnect();
        }, []);
    
        const shouldAnimate = VRM && isVisible;

    return (
        <div 
        // ref={sectionRef}
        className="relative w-full h-screen bg-[#93032E] px-12 overflow-hidden snap-start">
        
            <div className={`absolute left-0 top-0 h-[200%] w-12 bg-[#151515] z-30 transition-transform duration-5000 
                ${shouldAnimate ? "translate-y-[-50%]" : "translate-y-0"} animate-[slide_20s_linear_infinite]`}>
                <FilmPerforations colorHex="#93032E"/>
            </div>

            <div className={`absolute right-0 top-0 h-[200%] w-12 bg-[#151515] z-30 transition-transform duration-5000 
                ${shouldAnimate ? "translate-y-[-50%]" : "translate-y-0"} animate-[slide_20s_linear_infinite]`}>
                <FilmPerforations colorHex="#93032E"/>
            </div>

            <div className="w-full h-screen snap-start bg-[#93032E] relative overflow-hidden">
                <div className="absolute inset-0 z-10">
                    {/* <Canvas camera={{ position: [0, 0.5, 3] }}>
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
                    </Canvas> */}
                </div>
            </div>
        </div>
    )
}

export default Contact;