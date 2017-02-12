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
var ah = new THREE.AxisHelper (0.3);

function init() {
	setupThreeJS();
	setupWorld();
	setupPlayer();

	animate();
}

function setupLights() {
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	cSun = new THREE.AmbientLight (0xffffbb, .25);
	pSun = new THREE.DirectionalLight (0xffffbb, 1);
	pSun.position.set (40, 40, -30);
	pSun.castShadow = true;
	pSun.shadow.camera.top = 50;
	pSun.shadow.camera.right = 50;
	pSun.shadow.camera.left = -50;
	pSun.shadow.camera.bottom = -50;

	scene.add (cSun);
	scene.add (pSun);
	scene.add (new THREE.CameraHelper (pSun.shadow.camera));
}

function setupThreeJS() {
	renderer = new THREE.WebGLRenderer ({antialias: false});
	renderer.setSize (window.innerWidth, window.innerHeight);
	document.body.appendChild (renderer.domElement);

	scene = new Physijs.Scene();
	scene.add (ah);

	camera = new THREE.PerspectiveCamera (
		120, // FOV
		window.innerWidth / window.innerHeight, // aspect ratio
		0.1, // near
		50 // far
	);
	scene.add (camera);
	camera.lookAt (scene.position);
	relativeCameraOffset = new THREE.Vector3();
	setupLights();

	clock = new THREE.Clock();
}

function setupWorld() {
	pos.set (0, 0, 0);
	quat.setFromAxisAngle (new THREE.Vector3 (0, 0, 0), -90 * Math.PI / 180);
	//ground
	ground = createBox (40, 10, 40, 0, pos, quat, new THREE.MeshLambertMaterial ({color: 0xff0000}), "the ground");
	//obstacle
	pos.set (0, 6, 0);
	quat = new THREE.Quaternion();
	obstacle = createBox (1, 1, 1, 5, pos, quat, new THREE.MeshLambertMaterial ({color: 0x0000ff}), "a blue box");
}

function setupPlayer() {
	player = new Player();
	player.receiveShadow = true;
	player.castShadow = true;
	player.position.y = 10;
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
	box.castShadow = true;

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
	camera.position.copy (cameraOffset);

	var aim	= new THREE.Vector3 (-4, 1, -3);
	aim.multiplyVectors (aim, player.getWorldDirection());
	aim.add (player.position);
	aim.addVectors (aim, new THREE.Vector3 (0, 0.7, 0));
	camera.lookAt (aim);
	ah.position.copy (aim);
	ah.rotation.copy (player.rotation);
}

function main() {
	init ();
}
