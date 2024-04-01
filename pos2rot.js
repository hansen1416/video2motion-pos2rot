import * as THREE from 'three';


export function read_joints (videopose3d_results) {
    /**
     * shape of the data: [num_frames, num_joints, 3]
     */

    const shape = videopose3d_results.shape

    const arr3 = []
    const arr2 = []

    const step3 = shape[2]
    const step2 = shape[1]

    for (let i = 0; i < videopose3d_results.data.length; i += step3) {
        arr3.push(videopose3d_results.data.slice(i, i + step3))
    }

    for (let i = 0; i < arr3.length; i += step2) {
        arr2.push(arr3.slice(i, i + step2))
    }

    return arr2
}

const joints_labels = [
    "pelvis",
    "left_hip",
    "left_knee",
    "left_foot",
    "right_hip",
    "right_knee",
    "right_foot",
    "spine",
    "neck",
    "nose",
    "top",
    "right_shoulder",
    "right_elbow",
    "right_hand",
    "left_shoulder",
    "left_elbow",
    "left_hand",
]

const skeleton = [
    ["pelvis", "left_hip"],
    ["left_hip", "left_knee"],
    ["left_knee", "left_foot"],
    ["pelvis", "right_hip"],
    ["right_hip", "right_knee"],
    ["right_knee", "right_foot"],
    ["pelvis", "spine"],
    ["spine", "neck"],
    ["neck", "nose"],
    ["nose", "top"],
    ["neck", "right_shoulder"],
    ["right_shoulder", "right_elbow"],
    ["right_elbow", "right_hand"],
    ["neck", "left_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["left_elbow", "left_hand"],
]

export function positions2vectors (joints_positions) {

    const joints_vectors = []

    for (let i in joints_positions) {

        const joint_data = joints_positions[i]

        joints_vectors.push(new THREE.Vector3(joint_data[0], joint_data[1], joint_data[2]))
    }

    return joints_vectors
}
