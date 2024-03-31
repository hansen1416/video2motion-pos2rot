import npyjs from "npyjs"
import path from "path"
import fs from "fs"
import os from "os"

import { read_joints, process_frame } from "./pos2rot.js"


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



            const data_shaped = read_joints(res)

            for (let i = 0; i < data_shaped.length; i++) {
                process_frame(data_shaped[i])

                break
            }



            // break
            process.exit(0)
        })
    }
})


