import { VRMLoaderPlugin, VRM } from "@pixiv/three-vrm";
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export const useVRM = (url: string) => {
    return useGLTF(
        url,
        undefined,
        undefined,
        (loader) => {
            loader.register((parser) => {
                return new VRMLoaderPlugin(parser as any) as any;
            });
        }
    );
}

export async function loadMixamoAnimation(url: string, vrm: VRM): Promise<THREE.AnimationClip> {
    const loader = new FBXLoader();
    
    const asset = await loader.loadAsync(url);

    const clip = THREE.AnimationClip.findByName(asset.animations, 'mixamo.com');
    if (!clip) {
        throw new Error('AnimationClip "mixamo.com" not found');
    }

    const tracks: THREE.KeyframeTrack[] = []

    const restRotationInverse = new THREE.Quaternion();
    const parentRestWorldRotation = new THREE.Quaternion();
    const _quatA = new THREE.Quaternion();

    const mixamoHips = asset.getObjectByName('mixamorigHips');
    const vrmHipsPosition = vrm.humanoid?.normalizedRestPose?.hips?.position;

    if (!mixamoHips || !vrmHipsPosition) {
        throw new Error('Hips Not Found.');
    }

    const motionHipsHeight = mixamoHips.position.y;
    const vrmHipsHeight = vrmHipsPosition[1]
    const hipsPositionScale = vrmHipsHeight / motionHipsHeight;

    clip.tracks.forEach((track) => {
        const trackSplitted = track.name.split('.');
        const mixamoRigName = trackSplitted[0];

        const vrmBoneName = mixamoVRMRigMap[mixamoRigName as keyof typeof mixamoVRMRigMap];

        const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName as any)?.name;
        const mixamoRigNode = asset.getObjectByName(mixamoRigName);

        if (vrmNodeName && mixamoRigNode && mixamoRigNode.parent) {
            const propertyName = trackSplitted[1];
    
            mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
            mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation);

            if (track instanceof THREE.QuaternionKeyframeTrack) {
        
                const values = track.values.slice(); 

                for (let i = 0; i < values.length; i += 4) {
                    _quatA.fromArray(values, i);
            
                    _quatA
                        .premultiply(parentRestWorldRotation)
                        .multiply(restRotationInverse);

                    _quatA.toArray(values, i);
                }

                tracks.push(
                    new THREE.QuaternionKeyframeTrack(
                        `${vrmNodeName}.${propertyName}`,
                        track.times,
                        values.map((v, i) => 
                            vrm.meta?.metaVersion === '0' && i % 2 === 0 ? -v : v
                        ),
                    )
                );

            } else if (track instanceof THREE.VectorKeyframeTrack) {
                const vrmBoneName = mixamoVRMRigMap[mixamoRigName as keyof typeof mixamoVRMRigMap];
                
                let values = Array.from(track.values);

                if (vrmBoneName === 'hips') {
                    for (let i = 0; i < values.length; i += 3) {
                        
                        values[i] = 0; 
                        values[i + 2] = 0;

                        values[i + 1] *= hipsPositionScale;
                    }
                } else {
                    values = values.map((v, i) => 
                        (vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? -v : v) * hipsPositionScale
                    );
                }

                tracks.push(
                    new THREE.VectorKeyframeTrack(
                        `${vrmNodeName}.${propertyName}`, 
                        track.times, 
                        new Float32Array(values)
                    )
                );
            }
        }
    });

    return new THREE.AnimationClip('vrmAnimation', clip.duration, tracks);
}

/**
 * A map from Mixamo rig name to VRM Humanoid bone name
 */
export const mixamoVRMRigMap = {
	mixamorigHips: 'hips',
	mixamorigSpine: 'spine',
	mixamorigSpine1: 'chest',
	mixamorigSpine2: 'upperChest',
	mixamorigNeck: 'neck',
	mixamorigHead: 'head',
	mixamorigLeftShoulder: 'leftShoulder',
	mixamorigLeftArm: 'leftUpperArm',
	mixamorigLeftForeArm: 'leftLowerArm',
	mixamorigLeftHand: 'leftHand',
	mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
	mixamorigLeftHandThumb2: 'leftThumbProximal',
	mixamorigLeftHandThumb3: 'leftThumbDistal',
	mixamorigLeftHandIndex1: 'leftIndexProximal',
	mixamorigLeftHandIndex2: 'leftIndexIntermediate',
	mixamorigLeftHandIndex3: 'leftIndexDistal',
	mixamorigLeftHandMiddle1: 'leftMiddleProximal',
	mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
	mixamorigLeftHandMiddle3: 'leftMiddleDistal',
	mixamorigLeftHandRing1: 'leftRingProximal',
	mixamorigLeftHandRing2: 'leftRingIntermediate',
	mixamorigLeftHandRing3: 'leftRingDistal',
	mixamorigLeftHandPinky1: 'leftLittleProximal',
	mixamorigLeftHandPinky2: 'leftLittleIntermediate',
	mixamorigLeftHandPinky3: 'leftLittleDistal',
	mixamorigRightShoulder: 'rightShoulder',
	mixamorigRightArm: 'rightUpperArm',
	mixamorigRightForeArm: 'rightLowerArm',
	mixamorigRightHand: 'rightHand',
	mixamorigRightHandPinky1: 'rightLittleProximal',
	mixamorigRightHandPinky2: 'rightLittleIntermediate',
	mixamorigRightHandPinky3: 'rightLittleDistal',
	mixamorigRightHandRing1: 'rightRingProximal',
	mixamorigRightHandRing2: 'rightRingIntermediate',
	mixamorigRightHandRing3: 'rightRingDistal',
	mixamorigRightHandMiddle1: 'rightMiddleProximal',
	mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
	mixamorigRightHandMiddle3: 'rightMiddleDistal',
	mixamorigRightHandIndex1: 'rightIndexProximal',
	mixamorigRightHandIndex2: 'rightIndexIntermediate',
	mixamorigRightHandIndex3: 'rightIndexDistal',
	mixamorigRightHandThumb1: 'rightThumbMetacarpal',
	mixamorigRightHandThumb2: 'rightThumbProximal',
	mixamorigRightHandThumb3: 'rightThumbDistal',
	mixamorigLeftUpLeg: 'leftUpperLeg',
	mixamorigLeftLeg: 'leftLowerLeg',
	mixamorigLeftFoot: 'leftFoot',
	mixamorigLeftToeBase: 'leftToes',
	mixamorigRightUpLeg: 'rightUpperLeg',
	mixamorigRightLeg: 'rightLowerLeg',
	mixamorigRightFoot: 'rightFoot',
	mixamorigRightToeBase: 'rightToes',
};