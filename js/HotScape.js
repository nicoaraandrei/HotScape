var scene, camera, renderer, clock, controls;
var player;

function init() {
	setupThreeJS();
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
	renderer = new THREE.WebGLRenderer();
	renderer.setSize (window.innerWidth, window.innerHeight);

	clock = new THREE.Clock();

	document.body.appendChild (renderer.domElement);
}

function setupWorld() {
	setupPlatform();

  	var playerGeometry = new THREE.BoxGeometry (0.75, 2, 0.5); // width, height, depth
	var playerMaterial = new THREE.MeshBasicMaterial ({
		color: 0x223355
	});
	player = new THREE.Mesh (playerGeometry, playerMaterial);
	scene.add (player);

	controls = new KeyboardControls (player);
	controls.moveSpeed = 2;
}

function setupPlatform() {
	var platformGeometry = new THREE.PlaneGeometry (10, 30);
	var platformMaterial = new THREE.MeshBasicMaterial ({
		color: 0xff0000
	});
	var platform = new THREE.Mesh (platformGeometry, platformMaterial);

	platform.translateY (-2.0);
	platform.rotation.x = -90 * Math.PI / 180;

	scene.add (platform);
}

function draw() {
	renderer.render (scene,camera);
}

function animate() {
	draw();
	update();
	requestAnimationFrame (animate);
}

function update() {
	controls.update (clock.getDelta());

	var relativeCameraOffset = new THREE.Vector3 (0, 0.3, 2);
	var cameraOffset = player.localToWorld (relativeCameraOffset);

	camera.position.x = cameraOffset.x;
	camera.position.y = cameraOffset.y;
	camera.position.z = cameraOffset.z;

	camera.lookAt (player.position);
}

function main() {
	init ();
}
