import npyjs from "npyjs"
import path from "path"
import fs from "fs"

import * as THREE from "three"

import JointsPosition2Rotation from "./JointsPosition2Rotation.js"

const npy = new npyjs()

// const filepath = path.join("D:\\", "video2motion", "results3d")
const filepath = path.join("C:\\", "Users", "105476", "Documents", "video2motion", "results3d")


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

/**
 * joints_positions: [x, y, z] to THREE.Vector3(x, y, z)
 * @param {Array<Array>} joints_positions 
 * @returns 
 */
export function positions2vectors (joints_positions) {

    const joints_vectors = []

    for (let i in joints_positions) {

        const joint_data = joints_positions[i]

        joints_vectors.push(new THREE.Vector3(joint_data[0], joint_data[1], joint_data[2]))
    }

    return joints_vectors
}

/**
 * convert from [{bone_name: Rotation, bone_name: Rotation...}, ...] to {bone_name: [Rotation, Rotation...], bone_name: [Rotation, Rotation...]...}
 * @param {object} bone_rotations 
 * @returns 
 */
export function bone_rotations2animation_data (bone_rotations) {

    const animation_euler = {}
    // use the keys from `bone_rotations[0]` as keys for `animation_euler`
    for (let i in bone_rotations[0]) {
        animation_euler[i] = []
    }

    // console.log(animation_euler)

    for (let i = 0; i < bone_rotations.length; i++) {
        for (let j in bone_rotations[i]) {
            animation_euler[j].push(bone_rotations[i][j])
        }
    }

    return animation_euler
}

function draw (file, save_file = false) {
    const buffer = fs.readFileSync(path.join(filepath, file))
    const res = npy.parse(buffer.buffer.slice(0, buffer.length))

    // console.log(res)

    const res_shaped = read_joints(res)

    // console.log(res_shaped[0])

    const bone_eulers = []
    const bone_quaternions = []

    for (let i = 0; i < res_shaped.length; i++) {
        // conver [x, y, z] to THREE.Vector3(x, y, z)
        const joints_vectors = positions2vectors(res_shaped[i])

        const jpr = new JointsPosition2Rotation()
        // calculate rotation for each bone
        jpr.applyPose2Bone(joints_vectors)

        // output two format of rotation: euler and quaternion
        bone_eulers.push(jpr.getRotationsEuler())
        bone_quaternions.push(jpr.getRotationsQuaternion())
    }

    console.log(bone_eulers[0])

    const animation_euler = bone_rotations2animation_data(bone_eulers)
    const animation_quaternion = bone_rotations2animation_data(bone_quaternions)

    const json_euler = JSON.stringify(animation_euler, null, 4)
    const json_quaternion = JSON.stringify(animation_quaternion, null, 4)

    // console.log(json_euler)

    if (save_file) {

        const json_filename = file.replace(".avi.npy", ".json")

        fs.writeFileSync(path.join("D:\\", "repos", "video2motion-animplayer", "public", "anim-calculated-euler", json_filename), json_euler)
        fs.writeFileSync(path.join("D:\\", "repos", "video2motion-animplayer", "public", "anim-calculated-quaternion", json_filename), json_quaternion)
    }
}


// const sample_names = ['180 Turn W_ Briefcase (1)-30-0.avi.npy', 'Receiver Catch-30-0.avi.npy',
//     'Pull Plant-30-0.avi.npy', 'Sitting Clap (4)-30-0.avi.npy', 'Walking (9)-30-0.avi.npy']

// for (let i = 0; i < sample_names.length; i++) {
//     draw(sample_names[i])
// }


// iterate over all files in the `filepath`
fs.readdir(filepath, (err, files) => {
    if (err) {
        console.log(err)
    } else {
        for (let i = 0; i < files.length; i++) {
            console.log(files[i])
            draw(files[i])

            break
        }
    }
})


