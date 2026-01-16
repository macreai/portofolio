import { useEffect, useRef, useState } from "react";
import { useStore } from "./store";

export const ProjectStore = () => {
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

    return {
        sectionRef,
        shouldAnimate
    };
}