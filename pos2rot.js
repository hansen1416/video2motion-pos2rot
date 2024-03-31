export function read_joints (videopose3d_results) {

    const shape = videopose3d_results.shape

    const arr3 = []

    const step2 = shape[1]
    const step3 = shape[2]

    for (let i = 0; i < videopose3d_results.data.length; i += step3) {
        const sub_array = videopose3d_results.data.slice(i, i + step3)
        arr3.push(sub_array)
    }

    // console.log(arr3)

    const arr2 = []

    for (let i = 0; i < arr3.length; i += step2) {
        const sub_array = arr3.slice(i, i + step2)
        arr2.push(sub_array)
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

export function process_frame (frame_data) {
    console.log(frame_data)
}