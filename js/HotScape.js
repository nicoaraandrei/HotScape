Physijs.scripts.worker = 'lib/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var renderer, scene, camera, relativeCameraOffset;
var pSun, cSun;
var clock, player, controls;
var ground, obstacle;

var physicsWorld, collisionConfiguration, dispatcher, solver, broadphase;
var rigidBodies = [];
var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();

function init() {
	setupThreeJS();
	setupWorld();
	setupPlayer();

	animate();
}

function setupThreeJS() {
	renderer = new THREE.WebGLRenderer ({antialias: false});
	renderer.setSize (window.innerWidth, window.innerHeight);

	scene = new Physijs.Scene();

	scene.add (new THREE.AxisHelper (10));

	camera = new THREE.PerspectiveCamera (
		120, // FOV
		window.innerWidth / window.innerHeight, // aspect ratio
		0.1, // near
		50 // far
	);
	scene.add (camera);
	camera.lookAt (scene.position);

	relativeCameraOffset = new THREE.Vector3();

	// enable lights
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	// add lights
	pSun = new THREE.DirectionalLight (0xffffbb, 1);
	cSun = new THREE.DirectionalLight (0xffffbb, 0.5);
	pSun.position.set (1, 10, 1);
	cSun.position.set (-1, 10, -1);
	pSun.castShadow = true;
	cSun.castShadow = true;
	scene.add (pSun);
	scene.add (cSun);

	clock = new THREE.Clock();

	document.body.appendChild (renderer.domElement);
}

function setupWorld() {
	pos.set (0, 0, 0);
	quat.setFromAxisAngle (new THREE.Vector3 (0, 0, 0), -90 * Math.PI / 180);
	//ground
	ground = createBox (40, 10, 40, 0, pos, quat, new THREE.MeshLambertMaterial ({color: 0xff0000}), "the ground");
	//obstacle
	pos.set (0, 10, 0);
	quat = new THREE.Quaternion();
	obstacle = createBox (2, 2, 2, 5, pos, quat, new THREE.MeshLambertMaterial({color: 0x0000ff}), "a blue box");
}

function setupPlayer() {
	player = new Player();
	player.name = "Player"; // TODO: name
	scene.add (player);
	//freeze player rotation on X and Z
	player.setAngularFactor (new THREE.Vector3 (0, 1, 0));
	//player.setLinearFactor (new THREE.Vector3 (1, 0, 1));
	changePOV (4);

	controls = new Controls (player);
	controls.moveSpeed = 2;
}

function createBox (sx, sy, sz, mass, pos, quat, material, name) {
	var box = new Physijs.BoxMesh (new THREE.BoxGeometry (sx, sy, sz, 1, 1, 1), material, mass);
	box.position.copy (pos);
	box.quaternion.copy (quat);
	box.name = name || "something";
	box.receiveShadow = true;

	scene.add (box);
	return box;
}

function draw() {
	renderer.render (scene, camera);
}

function animate() {
	draw();
	update();

	player.__dirtyPosition = true;
	player.__dirtyRotation = true;

	scene.simulate();
	requestAnimationFrame (animate);
}

function update() {
	controls.update (clock.getDelta());

	var cameraOffset = relativeCameraOffset.clone();
	player.localToWorld (cameraOffset);

	camera.position.x = cameraOffset.x;
	camera.position.y = cameraOffset.y;
	camera.position.z = cameraOffset.z;

	var eyePos = new THREE.Vector3 (0, 0.5, 0);
	eyePos.add (player.position);
	camera.lookAt (eyePos);
}

function main() {
	init ();
}
