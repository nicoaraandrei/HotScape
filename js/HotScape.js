var scene, camera, renderer, relativeCameraOffset;
var clock, player, controls;

var physicsWorld, collisionConfiguration, dispatcher, solver, broadphase;
var rigidBodies = [];
var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();;

function init() {
	setupThreeJS();
	setupPhysics();
	setupWorld();

	animate();
}

function setupThreeJS() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera (
		120, // FOV
		window.innerWidth / window.innerHeight, // aspect ratio
		0.1, // near
		50 // far
	);
	scene.add (camera);
	camera.lookAt (scene.position);

	relativeCameraOffset = new THREE.Vector3();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize (window.innerWidth, window.innerHeight);

	clock = new THREE.Clock();

	document.body.appendChild (renderer.domElement);
}

function setupWorld() {
	pos.set (0, -2.0, 0);
	quat.setFromAxisAngle (new THREE.Vector3 (0, 0, 0), -90 * Math.PI / 180);
	var platform = createPlatform (40, 1, 40, 0, pos, quat, new THREE.MeshBasicMaterial ({color: 0xff0000}));

	player = new Player();
	scene.add (player);

	changePOV (4);

	controls = new Controls (player);
	controls.moveSpeed = 2;
}

function setupPhysics() {
	collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
	dispatcher = new Ammo.btCollisionDispatcher (collisionConfiguration);
	broadphase = new Ammo.btDbvtBroadphase();
	solver = new Ammo.btSequentialImpulseConstraintSolver();
	softBodySolver = new Ammo.btDefaultSoftBodySolver();
	physicsWorld = new Ammo.btSoftRigidDynamicsWorld (dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
	physicsWorld.setGravity (new Ammo.btVector3 (0, -10, 0));
	physicsWorld.getWorldInfo().set_m_gravity (new Ammo.btVector3 (0, -10, 0));
}

function createPlatform (sx, sy, sz, mass, pos, quat, material) {
	var platform = new THREE.Mesh (new THREE.BoxGeometry (sx, sy, sz, 1, 1, 1), material);
	platform.position.copy (pos);
	platform.quaternion.copy (quat);

	var shape = new Ammo.btBoxShape (new Ammo.btVector3 (sx * 0.5, sy * 0.5, sz * 0.5));
	shape.setMargin (0.05);
	var mass = 0;

	createRigidBody (platform, shape, mass, platform.position, platform.quaternion);

	scene.add (platform);
}

function createRigidBody (threeObject, physicsShape, mass, pos, quat) {

	var transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin (new Ammo.btVector3 (pos.x, pos.y, pos.z));
	transform.setRotation (new Ammo.btQuaternion (quat.x, quat.y, quat.z, quat.w));
	var motionState = new Ammo.btDefaultMotionState (transform);

	var localInertia = new Ammo.btVector3 (0, 0, 0);
	physicsShape.calculateLocalInertia(mass, localInertia);

	var rbInfo = new Ammo.btRigidBodyConstructionInfo (mass, motionState, physicsShape, localInertia);
	var body = new Ammo.btRigidBody (rbInfo);

	threeObject.userData.physicsBody = body;

	if (mass > 0) {
		rigidBodies.push (threeObject);
		body.setActivationState (4);
	}

	physicsWorld.addRigidBody (body);

	return body;
}

function draw() {
	renderer.render (scene, camera);
}

function animate() {
	draw();
	update();
	requestAnimationFrame (animate);
}

function update() {
	controls.update (clock.getDelta());

	var cameraOffset = relativeCameraOffset.clone();
	player.localToWorld (cameraOffset);

	camera.position.x = cameraOffset.x;
	camera.position.y = cameraOffset.y;
	camera.position.z = cameraOffset.z;

	var eyesTo = new THREE.Vector3 (0, 0.5, 0);
	eyesTo.add (player.position);
	camera.lookAt (eyesTo);
}

function main() {
	init ();
}
