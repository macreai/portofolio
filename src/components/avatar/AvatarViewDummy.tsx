import { useScroll } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { loadMixamoAnimation, useVRM } from ".";
import { useStore } from "../../store/store";
import type { AvatarViewProps } from "../../interfaces/Avatar";

/* =========================
   🔧 TUNING CONSTANTS
   (ubah di sini saja)
========================= */

// jarak total catwalk (meter unit world)
const CATWALK_DISTANCE = 1.5;

// kecepatan langkah kaki
const ANIM_SPEED = 0.5; // 1 = normal

// respons scroll (berat / ringan)
const SCROLL_RESPONSE = 0.12;

// damping gerak maju (halus / snap)
const Z_DAMPING = 8;

// crossfade antar animasi
const FADE_DURATION = 0.25;

// kamera smoothing
const CAMERA_LERP = 0.05;

// blink
const BLINK_INTERVAL = 5;
const BLINK_DURATION = 0.15;

/* ========================= */

export const AvatarViewDummy = ({ handleClick }: AvatarViewProps) => {
    const scroll = useScroll();

    const gltf = useVRM("models/model.vrm");
    const vrm = gltf?.userData.vrm;

    const mixer = useMemo(
        () => (vrm ? new THREE.AnimationMixer(vrm.scene) : null),
        [vrm]
    );

    // animation state
    const currentAction = useRef<THREE.AnimationAction | null>(null);
    const scrollAction = useRef<THREE.AnimationAction | null>(null);
    const phase = useRef<"intro" | "scroll" | "action">("intro");

    // cache
    const clips = useRef<Record<string, THREE.AnimationClip>>({});

    // smoothers
    const scrollSmooth = useRef(0);
    const zSmooth = useRef(0);

    const { setVRM, setAnimation, cameraTarget, setPlayAnim } = useStore();

    /* =========================
       REGISTER
    ========================= */

    useEffect(() => {
        if (vrm) setVRM(vrm);
    }, [vrm]);

    useEffect(() => {
        if (mixer && vrm) setPlayAnim(playAnimation);
    }, [mixer, vrm]);

    /* =========================
       INTRO → SCROLL
    ========================= */

    useEffect(() => {
        if (!vrm || !mixer) return;
        let alive = true;

        (async () => {
            const introClip = await loadMixamoAnimation(
                "/animations/Standing Greeting.fbx",
                vrm
            );
            if (!alive) return;

            clips.current.intro = introClip;

            const intro = mixer.clipAction(introClip);
            intro.reset();
            intro.setLoop(THREE.LoopOnce, 1);
            intro.clampWhenFinished = true;
            intro.play();

            currentAction.current = intro;
            phase.current = "intro";

            const onFinished = async (e: any) => {
                if (e.action !== intro) return;
                mixer.removeEventListener("finished", onFinished);

                const scrollClip = await loadMixamoAnimation(
                    "/animations/Catwalk Walk Forward.fbx",
                    vrm
                );
                if (!alive) return;

                clips.current.scroll = scrollClip;

                const action = mixer.clipAction(scrollClip);
                action.reset();
                action.play();
                action.timeScale = 0; // dikontrol manual
                action.setEffectiveWeight(1);

                intro.fadeOut(FADE_DURATION);

                scrollAction.current = action;
                currentAction.current = action;
                phase.current = "scroll";
            };

            mixer.addEventListener("finished", onFinished);
        })();

        return () => {
            alive = false;
        };
    }, [vrm, mixer]);

    /* =========================
       USER ACTION
    ========================= */

    async function playAnimation(url: string, onlyOnce = false) {
        if (!mixer || !vrm) return;
        if (phase.current === "intro") return;

        phase.current = "action";

        if (!clips.current[url]) {
            clips.current[url] = await loadMixamoAnimation(url, vrm);
        }

        const action = mixer.clipAction(clips.current[url]);
        action.reset();
        action.setLoop(
            onlyOnce ? THREE.LoopOnce : THREE.LoopRepeat,
            onlyOnce ? 1 : Infinity
        );
        action.clampWhenFinished = true;

        currentAction.current?.crossFadeTo(action, FADE_DURATION, true);

        action.play();
        currentAction.current = action;
        setAnimation(url, onlyOnce);

        if (!onlyOnce) return;

        return new Promise<void>((resolve) => {
            const onFinished = (e: any) => {
                if (e.action !== action) return;
                mixer.removeEventListener("finished", onFinished);

                phase.current = "scroll";

                if (scrollAction.current) {
                    action.fadeOut(FADE_DURATION);
                    scrollAction.current.reset();
                    scrollAction.current.play();
                    scrollAction.current.setEffectiveWeight(1);
                    currentAction.current = scrollAction.current;
                }

                resolve();
            };

            mixer.addEventListener("finished", onFinished);
        });
    }

    /* =========================
       FRAME LOOP
    ========================= */

    useFrame((state, delta) => {
        mixer?.update(delta);

        /* ----- SCROLL CATWALK ----- */
        if (phase.current === "scroll" && scrollAction.current && vrm) {
            // smooth scroll
            scrollSmooth.current +=
                (scroll.offset - scrollSmooth.current) *
                SCROLL_RESPONSE;

            // animation time (deterministic)
            const duration =
                scrollAction.current.getClip().duration;

            scrollAction.current.time =
                scrollSmooth.current * duration * ANIM_SPEED;

            // root motion (Z)
            const targetZ =
                -scrollSmooth.current * CATWALK_DISTANCE;

            zSmooth.current = THREE.MathUtils.damp(
                zSmooth.current,
                targetZ,
                Z_DAMPING,
                delta
            );

            vrm.scene.position.z = zSmooth.current;
        }

        vrm?.update(delta);

        /* ----- CAMERA ----- */
        const { pos, lookAt } = cameraTarget;
        state.camera.position.lerp(pos, CAMERA_LERP);
        state.camera.lookAt(lookAt);

        if (vrm?.lookAt) {
            vrm.lookAt.target = state.camera;
        }

        /* ----- BLINK ----- */
        const t = state.clock.elapsedTime % BLINK_INTERVAL;
        const blink =
            t < BLINK_DURATION
                ? Math.sin(Math.PI * (t / BLINK_DURATION))
                : 0;

        vrm?.expressionManager?.setValue("blink", blink);
    });

    if (!gltf) return null;
    return <primitive object={gltf.scene} onClick={handleClick} />;
};
