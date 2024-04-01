import * as THREE from 'three';

export default class JointsPosition2Rotation {

    // // mediapipe 33 joints mapping to index
    // joints_map_origin = {
    //     "PELVIS": 0,
    //     "LEFT_HIP": 1,
    //     "LEFT_KNEE": 2,
    //     "LEFT_ANKLE": 3,
    //     "RIGHT_HIP": 4,
    //     "RIGHT_KNEE": 5,
    //     "RIGHT_ANKLE": 6,
    //     "spine": 7,
    //     "NECK": 8,
    //     "nose": 9,
    //     "top": 10,
    //     "RIGHT_SHOULDER": 11,
    //     "RIGHT_ELBOW": 12,
    //     "RIGHT_WRIST": 13,
    //     "LEFT_SHOULDER": 14,
    //     "LEFT_ELBOW": 15,
    //     "LEFT_WRIST": 16,
    // };

    joints_map = {
        "PELVIS": 0,
        "LEFT_HIP": 4,
        "LEFT_KNEE": 5,
        "LEFT_ANKLE": 6,
        "RIGHT_HIP": 1,
        "RIGHT_KNEE": 2,
        "RIGHT_ANKLE": 3,
        "spine": 7,
        "NECK": 8,
        "nose": 9,
        "top": 10,
        "RIGHT_SHOULDER": 14,
        "RIGHT_ELBOW": 15,
        "RIGHT_WRIST": 16,
        "LEFT_SHOULDER": 11,
        "LEFT_ELBOW": 12,
        "LEFT_WRIST": 13,
    };


    /**
     * @type {Array<Float32Array>}
     */
    pose3d = []

    /**
     * @type  {{[key: string]: THREE.Quaternion}}
     */
    rotations = {
        "Hips": new THREE.Quaternion(0, 0, 0, 1),
        "Spine2": new THREE.Quaternion(0, 0, 0, 1),
        "LeftShoulder": new THREE.Quaternion(0, 0, 0, 1),
        "LeftArm": new THREE.Quaternion(0, 0, 0, 1),
        "LeftForeArm": new THREE.Quaternion(0, 0, 0, 1),
        "RightShoulder": new THREE.Quaternion(0, 0, 0, 1),
        "RightArm": new THREE.Quaternion(0, 0, 0, 1),
        "RightForeArm": new THREE.Quaternion(0, 0, 0, 1),
        "LeftUpLeg": new THREE.Quaternion(0, 0, 0, 1),
        "LeftLeg": new THREE.Quaternion(0, 0, 0, 1),
        "RightUpLeg": new THREE.Quaternion(0, 0, 0, 1),
        "RightLeg": new THREE.Quaternion(0, 0, 0, 1),
    }
    /**
     *
     */
    constructor() { }

    /**
     * the position of these 3 joints are real position of the user in front of the camera
     * eg.
     * left_shoulder: _Vector3 {x: -5.438949018716812, y: 9.090009704232216, z: 4.032454490661621}
     * right_shoulder: _Vector3 {x: 4.430159032344818, y: 10.827043130993843, z: 2.75645412504673}
     * core: _Vector3 {x: -0.2822154387831688, y: 5.020033587352373, z: 1.701674242503941}
     *
     * @param {THREE.Vector3} left_shoulder
     * @param {THREE.Vector3} right_shoulder
     * @param {THREE.Vector3} core
     * @returns {THREE.Quaternion}
     */
    #getChestQuaternion (left_shoulder, right_shoulder, core) {
        // new basis of chest from pose data
        const xaxis = new THREE.Vector3()
            .subVectors(left_shoulder, right_shoulder)
            .normalize();

        const y_tmp = new THREE.Vector3()
            .subVectors(left_shoulder, core)
            .normalize();

        const zaxis = new THREE.Vector3()
            .crossVectors(xaxis, y_tmp)
            .normalize();

        const yaxis = new THREE.Vector3()
            .crossVectors(zaxis, xaxis)
            .normalize();

        // transfer origin basis of chest to target basis
        const m0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1)
        );

        const m1 = new THREE.Matrix4().makeBasis(xaxis, yaxis, zaxis);

        const m = m1.multiply(m0.invert());

        return new THREE.Quaternion().setFromRotationMatrix(m);
    }

    /**
     * the position of these 3 joints are real position of the user in front of the camera
     * eg.
     * _Vector3 {x: -2.8411057591438293, y: -0.21446174243465066, z: -0.6154307909309864}
     * _Vector3 {x: 2.759140133857727, y: 0.3627159632742405, z: 0.6565528549253941}
     * _Vector3 {x: -0.1843450963497162, y: 5.061126192449592, z: 1.4994440227746964}
     *
     * @param {THREE.Vector3} left_hip
     * @param {THREE.Vector3} right_hip
     * @param {THREE.Vector3} core
     * @returns {THREE.Quaternion}
     */
    #getAbsQuaternion (left_hip, right_hip, core) {
        // new basis of abdominal from pose data
        const xaxis = new THREE.Vector3()
            .subVectors(right_hip, left_hip)
            .normalize();

        const y_tmp = new THREE.Vector3()
            .subVectors(core, left_hip)
            .normalize();

        const zaxis = new THREE.Vector3()
            .crossVectors(xaxis, y_tmp)
            .normalize();

        const yaxis = new THREE.Vector3()
            .crossVectors(zaxis, xaxis)
            .normalize();

        // transfer origin basis of abdominal to target basis
        const m0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1)
        );

        const m1 = new THREE.Matrix4().makeBasis(xaxis, yaxis, zaxis);

        const m = m1.multiply(m0.invert());

        return new THREE.Quaternion().setFromRotationMatrix(m);
    }

    #torsoRotation () {
        /**
            Now you want matrix B that maps from 1st set of coords to 2nd set:
            A2 = B * A1
            This is now a very complex math problem that requires advanced skills to arrive at the solution:
            B = A2 * inverse of A1
        */

        // console.log(this.pose3d, this.joints_map["LEFT_SHOULDER"])

        const left_oblique = new THREE.Vector3()
            .addVectors(
                this.pose3d[this.joints_map["LEFT_SHOULDER"]],
                this.pose3d[this.joints_map["LEFT_HIP"]]
            )
            .multiplyScalar(0.5);

        const right_oblique = new THREE.Vector3()
            .addVectors(
                this.pose3d[this.joints_map["RIGHT_SHOULDER"]],
                this.pose3d[this.joints_map["RIGHT_HIP"]]
            )
            .multiplyScalar(0.5);

        const core = new THREE.Vector3()
            .subVectors(left_oblique, right_oblique)
            .multiplyScalar(0.5);

        const chest_q = this.#getChestQuaternion(
            this.pose3d[this.joints_map["LEFT_SHOULDER"]],
            this.pose3d[this.joints_map["RIGHT_SHOULDER"]],
            core
        );

        const abs_q = this.#getAbsQuaternion(
            this.pose3d[this.joints_map["LEFT_HIP"]],
            this.pose3d[this.joints_map["RIGHT_HIP"]],
            core
        );

        return [abs_q, chest_q];
    }

    /**
     *
     * @param {string} bone_name
     * @param {string} parent_bone_name
     * @param {string} start_joint_name
     * @param {string} end_joint_name
     * @param {THREE.Euler} init_euler
     * @param {THREE.Vector3} up_vector
     */
    #rotateLimb (
        bone_name,
        parent_bone_name,
        start_joint_name,
        end_joint_name,
        init_euler,
        up_vector
    ) {


        const start_joint =
            this.pose3d[this.joints_map[start_joint_name]];
        const end_joint =
            this.pose3d[this.joints_map[end_joint_name]];

        const world_target_vector = new THREE.Vector3(
            end_joint.x - start_joint.x,
            end_joint.y - start_joint.y,
            end_joint.z - start_joint.z
        ).normalize();

        // console.log(parent_bone_name, this.rotations[parent_bone_name])

        const world_quaternion = this.rotations[parent_bone_name].clone();

        // after apply the parent quaternion,
        // `world_target_vector` actually became the local target vector
        world_target_vector.applyQuaternion(world_quaternion.conjugate());

        // store the local vectors for all bones, used for gesture classification
        // this.local_vectors[bone_name] = world_target_vector.clone();

        // all the bones rest pose in the model is (0,1,0)
        // first place the limb to the human body nature position
        const init_quaternion = new THREE.Quaternion().setFromEuler(init_euler);

        // maby for thighs, the up_vector should be (0,-1,0)
        // const up_vector = new THREE.Vector3(0, 1, 0);

        // this is the real human body rotation,
        let local_quaternion_bio = new THREE.Quaternion().setFromUnitVectors(
            up_vector,
            world_target_vector
        );

        // Note that rotating by `a` and then by `b` is equivalent to 
        // performing a single rotation by the quaternion product `ba`.
        const local_quaternion_bone =
            new THREE.Quaternion().multiplyQuaternions(
                local_quaternion_bio,
                init_quaternion
            );

        // const angle = local_quaternion_bone.angleTo(new THREE.Quaternion());

        // const axis = new THREE.Vector3(
        // 	local_quaternion_bone.x,
        // 	local_quaternion_bone.y,
        // 	local_quaternion_bone.z
        // );

        // const local_quaternion_round = new THREE.Quaternion().setFromAxisAngle(
        // 	axis,
        // 	parseFloat(angle.toFixed(2)) // this will cause the left arm unable to hang down
        // );

        this.rotations[bone_name] = local_quaternion_bone.normalize()
    }


    #pelvisRotation () {


        const left_hip = this.pose3d[this.joints_map["LEFT_HIP"]];
        const right_hip = this.pose3d[this.joints_map["RIGHT_HIP"]];
        const neck = this.pose3d[this.joints_map["NECK"]];
        const pelvis = this.pose3d[this.joints_map["PELVIS"]];


        const xaxis = new THREE.Vector3()
            .subVectors(left_hip, right_hip)
            .normalize();

        const y_tmp = new THREE.Vector3()
            .subVectors(neck, pelvis)
            .normalize();

        const zaxis = new THREE.Vector3()
            .crossVectors(xaxis, y_tmp)
            .normalize();

        // console.log(xaxis, y_tmp, zaxis)

        const yaxis = new THREE.Vector3()
            .crossVectors(zaxis, xaxis)
            .normalize();

        // console.log(xaxis, yaxis, zaxis)

        const m0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1)
        );

        const m1 = new THREE.Matrix4().makeBasis(xaxis, yaxis, zaxis);

        const m = m1.multiply(m0.invert());

        return new THREE.Quaternion().setFromRotationMatrix(m);
    }

    /**
     *
     * @param {{x:number, y:number, z:number}[]} pose3D
     * @returns {THREE.Vector3}
     */
    applyPose2Bone (pose3D) {

        /**
         * the coordinates system used by videopose3d as follows:
         * x-axis: from right to left (negative at right)
         * y-axis: from top to bottom (negative at top)
         * z-axis: from back to front (negative at back)
         * so swap left and eight (already did in `joints_map`), reverse y axis to fit the three.js coordinates system
         */

        this.pose3d = pose3D;

        for (let i in this.pose3d) {
            // this.pose3d[i].x = this.pose3d[i].x;
            this.pose3d[i].y = -this.pose3d[i].y;
        }

        this.rotations["Hips"] = this.#pelvisRotation();

        return

        const [abs_q, chest_q] = this.#torsoRotation();

        this.rotations["Hips"] = abs_q

        const chest_local = new THREE.Quaternion().multiplyQuaternions(
            abs_q.conjugate(),
            chest_q
        );

        this.rotations["Spine2"] = chest_local

        this.#rotateLimb(
            "LeftArm",
            "LeftShoulder",
            "RIGHT_SHOULDER",
            "RIGHT_ELBOW",
            new THREE.Euler(0, 0, 0),
            new THREE.Vector3(0, 1, 0)
        );

        this.#rotateLimb(
            "LeftForeArm",
            "LeftArm",
            "RIGHT_ELBOW",
            "RIGHT_WRIST",
            new THREE.Euler(0, 0, 0),
            new THREE.Vector3(0, 1, 0)
        );

        this.#rotateLimb(
            "RightArm",
            "RightShoulder",
            "LEFT_SHOULDER",
            "LEFT_ELBOW",
            new THREE.Euler(0, 0, 0),
            new THREE.Vector3(0, 1, 0)
        );

        this.#rotateLimb(
            "RightForeArm",
            "RightArm",
            "LEFT_ELBOW",
            "LEFT_WRIST",
            new THREE.Euler(0, 0, 0),
            new THREE.Vector3(0, 1, 0)
        );

        // todo LeftUpLeg and RightUpLeg should have initial rotation if the up vector is (0,-1,0)
        this.#rotateLimb(
            "LeftUpLeg",
            "Hips",
            "RIGHT_HIP",
            "RIGHT_KNEE",
            new THREE.Euler(0, 0, 0),
            new THREE.Vector3(0, -1, 0)
        );

        this.#rotateLimb(
            "LeftLeg",
            "LeftUpLeg",
            "RIGHT_KNEE",
            "RIGHT_ANKLE",
            new THREE.Euler(0, 0, 0),
            new THREE.Vector3(0, 1, 0)
        );


        this.#rotateLimb(
            "RightUpLeg",
            "Hips",
            "LEFT_HIP",
            "LEFT_KNEE",
            new THREE.Euler(0, 0, 0),
            new THREE.Vector3(0, -1, 0)
        );

        this.#rotateLimb(
            "RightLeg",
            "RightUpLeg",
            "LEFT_KNEE",
            "LEFT_ANKLE",
            new THREE.Euler(0, 0, 0),
            new THREE.Vector3(0, 1, 0)
        );

    }

    getRotationsEuler () {
        const eulers = {};
        for (const key in this.rotations) {
            const euler = new THREE.Euler().setFromQuaternion(this.rotations[key]);
            eulers[key] = [euler.x, euler.y, euler.z];
        }
        return eulers;
    }
}