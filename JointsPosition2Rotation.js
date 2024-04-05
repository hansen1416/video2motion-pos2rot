import * as THREE from 'three';

export default class JointsPosition2Rotation {

    // // mediapipe 33 joints mapping to index
    // joints_map = {
    //     "PELVIS": 0,
    //     "LEFT_HIP": 1,
    //     "LEFT_KNEE": 2,
    //     "LEFT_ANKLE": 3,
    //     "RIGHT_HIP": 4,
    //     "RIGHT_KNEE": 5,
    //     "RIGHT_ANKLE": 6,
    //     "SPINE": 7,
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
        "SPINE": 7,
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
        "LeftShoulder": new THREE.Quaternion(0.4816880226135254, 0.4927692711353302, -0.5889065265655518, 0.4223082959651947),
        "LeftArm": new THREE.Quaternion(0, 0, 0, 1),
        "LeftForeArm": new THREE.Quaternion(0, 0, 0, 1),
        "RightShoulder": new THREE.Quaternion(
            0.48168784379959106,
            -0.4927700459957123,
            0.588905930519104,
            0.42230847477912903
        ),
        "RightArm": new THREE.Quaternion(0, 0, 0, 1),
        "RightForeArm": new THREE.Quaternion(0, 0, 0, 1),
        "LeftUpLeg": new THREE.Quaternion(
            0.0019053755095228553,
            0.056365966796875,
            -0.9978452920913696,
            0.03352741152048111
        ),
        "LeftLeg": new THREE.Quaternion(0, 0, 0, 1),
        "RightUpLeg": new THREE.Quaternion(
            0.0019610640592873096,
            -0.05636449530720711,
            0.9978451728820801,
            0.03352941572666168
        ),
        "RightLeg": new THREE.Quaternion(0, 0, 0, 1),
    }

    /**
     * left shoulder
     * {
    "isEuler": true,
    "_x": 1.5198795050922367,
    "_y": -0.15171872670981498,
    "_z": -1.753153402330732,
    "_order": "XYZ"
    }

    right shoulder 
    {
        "isEuler": true,
        "_x": 1.5198807179038891,
        "_y": 0.1517170924223086,
        "_z": 1.7531534740480517,
        "_order": "XYZ"
    }

    left thigh
    {
        "isEuler": true,
        "_x": 0.11285620724473742,
        "_y": -0.00002293003459195574,
        "_z": -3.074417015377089,
        "_order": "XYZ"
    }

    right thigh
    {
        "isEuler": true,
        "_x": 0.11285700531116258,
        "_y": 0.000133939420187595,
        "_z": 3.0744067204304533,
        "_order": "XYZ"
    }
     */

    /**
     *
     */
    constructor() { }




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

        // process.exit(0)

        const m0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1)
        );

        const m1 = new THREE.Matrix4().makeBasis(xaxis, yaxis, zaxis);

        const m = m1.multiply(m0.invert());
        // const m = m0.invert().multiply(m1);

        return new THREE.Quaternion().setFromRotationMatrix(m);
    }

    #spine2rotation () {
        const left_shoulder = this.pose3d[this.joints_map["LEFT_SHOULDER"]];
        const right_shoulder = this.pose3d[this.joints_map["RIGHT_SHOULDER"]];
        const neck = this.pose3d[this.joints_map["NECK"]];
        const spine = this.pose3d[this.joints_map["SPINE"]];

        const xaxis = new THREE.Vector3()
            .subVectors(left_shoulder, right_shoulder)
            .normalize();

        const y_tmp = new THREE.Vector3()
            .subVectors(neck, spine)
            .normalize();

        const zaxis = new THREE.Vector3()
            .crossVectors(xaxis, y_tmp)
            .normalize();

        const yaxis = new THREE.Vector3()
            .crossVectors(zaxis, xaxis)
            .normalize();

        const m0 = new THREE.Matrix4().makeBasis(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1)
        );

        const m1 = new THREE.Matrix4().makeBasis(xaxis, yaxis, zaxis);

        const m = m1.multiply(m0.invert());

        // need to reduct pelvis rotation
        const spine2_q_world = new THREE.Quaternion().setFromRotationMatrix(m);

        //  spine2_q_local * pelvis_q_local  = spine2_q_world
        //  spine2_q_local = spine2_q_world * pelvis_q_local.conjugate()

        return new THREE.Quaternion().multiplyQuaternions(
            spine2_q_world,
            this.rotations["Hips"].clone().conjugate()
        );
    }

    #get_joint_world_vector (start_joint_name, end_joint_name) {
        const start_joint =
            this.pose3d[this.joints_map[start_joint_name]];
        const end_joint =
            this.pose3d[this.joints_map[end_joint_name]];

        return new THREE.Vector3(
            end_joint.x - start_joint.x,
            end_joint.y - start_joint.y,
            end_joint.z - start_joint.z
        ).normalize();
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
            this.pose3d[i].z = -this.pose3d[i].z;
        }

        this.rotations["Hips"] = this.#pelvisRotation();

        this.rotations["Spine2"] = this.#spine2rotation();

        return

        this.rotations["LeftShoulder"] = new THREE.Quaternion(
            0.4816880226135254, 0.4927692711353302, -0.5889065265655518, 0.4223082959651947);

        this.rotations["RightShoulder"] = new THREE.Quaternion(
            0.48168784379959106, -0.4927700459957123, 0.588905930519104, 0.42230847477912903)

        // this.rotations store the local rotation of each bone

        const left_arm_world_vector = this.#get_joint_world_vector("LEFT_SHOULDER", "LEFT_ELBOW");
        const right_arm_world_vector = this.#get_joint_world_vector("RIGHT_SHOULDER", "RIGHT_ELBOW");

        console.log(left_arm_world_vector, right_arm_world_vector)

        process.exit(0)


        return

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

        return

        // todo LeftUpLeg and RightUpLeg should have initial rotation if the up vector is (0,-1,0)
        this.#rotateLimb(
            "LeftUpLeg",
            "Hips",
            "RIGHT_HIP",
            "RIGHT_KNEE",
            new THREE.Euler(0.11285620724473742,
                -0.00002293003459195574,
                -3.074417015377089),
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
            new THREE.Euler(
                0.11285700531116258,
                0.000133939420187595,
                3.0744067204304533,
            ),
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