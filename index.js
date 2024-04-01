import npyjs from "npyjs"
import path from "path"
import fs from "fs"
import os from "os"

import { read_joints, positions2vectors, bone_rotations2animation_euler } from "./pos2rot.js"
import JointsPosition2Rotation from "./JointsPosition2Rotation.js"

const npy = new npyjs()

const filepath = path.join(os.homedir(), "Documents", "video2motion", "results3d")


// iterate over all files in the `filepath`
fs.readdir(filepath, (err, files) => {
    if (err) {
        console.log(err)
    } else {
        files.forEach(file => {
            const buffer = fs.readFileSync(path.join(filepath, file))
            const res = npy.parse(buffer.buffer.slice(0, buffer.length))

            const res_shaped = read_joints(res)

            const bone_rotations = []

            for (let i = 0; i < res_shaped.length; i++) {

                const joints_vectors = positions2vectors(res_shaped[i])

                // console.log(joints_vectors)

                const jpr = new JointsPosition2Rotation(joints_vectors)

                jpr.applyPose2Bone(joints_vectors)

                bone_rotations.push(jpr.getRotationsEuler())

                // break

            }

            // console.log(bone_rotations)

            const animation_euler = bone_rotations2animation_euler(bone_rotations)

            // console.log(animation_euler)

            // save `animation_euler` to json file
            const json_data = JSON.stringify(animation_euler, null, 4)

            const json_filename = file.replace(".avi.npy", ".json")

            fs.writeFileSync(path.join(os.homedir(), "Documents", "video2motion-animplayer", "public", "anim-euler-uniform", json_filename), json_data)


            // break
            process.exit(0)
        })
    }
})


