import * as THREE from 'three';

export default class JointsPosition2Rotation {


    constructor() { }

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
        "RIGHT_HIP": 1,
        "RIGHT_KNEE": 2,
        "RIGHT_ANKLE": 3,
        "LEFT_HIP": 4,
        "LEFT_KNEE": 5,
        "LEFT_ANKLE": 6,
        "SPINE": 7,
        "NECK": 8,
        "nose": 9,
        "top": 10,
        "LEFT_SHOULDER": 11,
        "LEFT_ELBOW": 12,
        "LEFT_WRIST": 13,
        "RIGHT_SHOULDER": 14,
        "RIGHT_ELBOW": 15,
        "RIGHT_WRIST": 16,
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

    limb_joint_pairs = {
        "LeftArm": ["LEFT_SHOULDER", "LEFT_ELBOW"],
        "RightArm": ["RIGHT_SHOULDER", "RIGHT_ELBOW"],
        "LeftForeArm": ["LEFT_ELBOW", "LEFT_WRIST"],
        "RightForeArm": ["RIGHT_ELBOW", "RIGHT_WRIST"],
        "LeftUpLeg": ["LEFT_HIP", "LEFT_KNEE"],
        "RightUpLeg": ["RIGHT_HIP", "RIGHT_KNEE"],
        "LeftLeg": ["LEFT_KNEE", "LEFT_ANKLE"],
        "RightLeg": ["RIGHT_KNEE", "RIGHT_ANKLE"],
    }

    limb_parent = {
        "LeftArm": ["Hips", "Spine2", "LeftShoulder"],
        "RightArm": ["Hips", "Spine2", "RightShoulder"],
        "LeftForeArm": ["Hips", "Spine2", "LeftShoulder", "LeftArm"],
        "RightForeArm": ["Hips", "Spine2", "RightShoulder", "RightArm"],
        "LeftUpLeg": ["Hips"],
        "RightUpLeg": ["Hips"],
        "LeftLeg": ["Hips", "LeftUpLeg"],
        "RightLeg": ["Hips", "RightUpLeg"],
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

        // return spine2_q_world;

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

    #get_limb_world_quaternion (up_vector, target_vector) {
        const angle = up_vector.angleTo(target_vector);

        const axis = new THREE.Vector3().crossVectors(up_vector, target_vector).normalize();

        // console.log(axis, angle * 180 / Math.PI,)

        return new THREE.Quaternion().setFromAxisAngle(axis, angle);
    }

    #get_limb_quaternion (limb_name, up_vector) {
        const limb = this.limb_joint_pairs[limb_name];

        const target_vector = this.#get_joint_world_vector(limb[0], limb[1]);

        for (const parent_bone_name of this.limb_parent[limb_name]) {

            const parent_q = this.rotations[parent_bone_name];

            target_vector.applyQuaternion(parent_q.clone().conjugate());
        }

        const angle = up_vector.angleTo(target_vector);

        const axis = new THREE.Vector3().crossVectors(up_vector, target_vector).normalize();

        return new THREE.Quaternion().setFromAxisAngle(axis, angle);
    }

    /**
     *
     * @param {{x:number, y:number, z:number}[]} pose3D
     * @returns {THREE.Vector3}
     */
    applyPose2Bone (pose3D) {

        this.pose3d = pose3D;

        // afjust the coordinate system from videopose3d to threejs
        for (let i in this.pose3d) {
            this.pose3d[i].y = -this.pose3d[i].y;
            this.pose3d[i].z = -this.pose3d[i].z;
        }

        this.rotations["Hips"] = this.#pelvisRotation();

        this.rotations["Spine2"] = this.#spine2rotation();

        this.rotations["LeftShoulder"] = new THREE.Quaternion(0.4816880226135254, 0.4927692711353302, -0.5889065265655518, 0.4223082959651947);

        this.rotations["RightShoulder"] = new THREE.Quaternion(0.48168784379959106, -0.4927700459957123, 0.588905930519104, 0.42230847477912903);


        this.rotations["LeftArm"] = this.#get_limb_quaternion("LeftArm", new THREE.Vector3(0, 1, 0));
        this.rotations["RightArm"] = this.#get_limb_quaternion("RightArm", new THREE.Vector3(0, 1, 0));

        this.rotations["LeftForeArm"] = this.#get_limb_quaternion("LeftForeArm", new THREE.Vector3(0, 1, 0));
        this.rotations["RightForeArm"] = this.#get_limb_quaternion("RightForeArm", new THREE.Vector3(0, 1, 0));

        const leftUpLeg_local = this.#get_limb_quaternion("LeftUpLeg", new THREE.Vector3(0, -1, 0));
        this.rotations["LeftUpLeg"] = new THREE.Quaternion().multiplyQuaternions(leftUpLeg_local, new THREE.Quaternion(
            0.0019053755095228553,
            0.056365966796875,
            -0.9978452920913696,
            0.03352741152048111
        ));
        const rightUpLeg_local = this.#get_limb_quaternion("RightUpLeg", new THREE.Vector3(0, -1, 0));
        this.rotations["RightUpLeg"] = new THREE.Quaternion().multiplyQuaternions(rightUpLeg_local, new THREE.Quaternion(
            0.0019610640592873096,
            -0.05636449530720711,
            0.9978451728820801,
            0.03352941572666168
        ));

        this.rotations["LeftLeg"] = this.#get_limb_quaternion("LeftLeg", new THREE.Vector3(0, 1, 0));
        this.rotations["RightLeg"] = this.#get_limb_quaternion("RightLeg", new THREE.Vector3(0, 1, 0));
    }

    getRotationsEuler () {
        const eulers = {};
        for (const key in this.rotations) {
            const euler = new THREE.Euler().setFromQuaternion(this.rotations[key], "XYZ");
            eulers[key] = [euler.x, euler.y, euler.z];
        }
        return eulers;
    }

    getRotationsQuaternion () {
        const quaternions = {};
        for (const key in this.rotations) {
            quaternions[key] = [
                this.rotations[key].x,
                this.rotations[key].y,
                this.rotations[key].z,
                this.rotations[key].w
            ];
        }
        return quaternions;
    }
}