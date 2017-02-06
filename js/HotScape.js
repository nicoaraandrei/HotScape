var scene, camera, renderer;
var playerGeometry, playerMaterial, player;

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera (
		120, // FOV
		window.innerWidth / window.innerHeight, // aspect ratio
		0.1, // near
		50 // far
	);
	renderer = new THREE.WebGLRenderer();

	playerGeometry = new THREE.BoxGeometry (0.75, 1.77, 0.5); // width, height, depth
	playerMaterial = new THREE.MeshBasicMaterial ({
		color: 0x223355,
		wireframe: true
	});
	player = new THREE.Mesh (playerGeometry, playerMaterial);
}

function render() {
	requestAnimationFrame (render);
	renderer.render (scene, camera);
}

function changePOV (pers) {
	switch (pers) {
		case 1: // 1st person
			camera.position.set (0, 0.75, -0.15);
		break;

		default:
		case 2: // 2nd person / shoulder view
			camera.position.set (0.75, 0.75, 0.75);
		break;

		case 3: // 3rd person
			camera.position.set (2, 1, 1.75);
		break;
		
		case 4: // bird-ish view
			camera.position.set (1, 1.5, 1.75);
		break;
	}
}

function main() {
	init ();

	renderer.setSize (window.innerWidth, window.innerHeight);
	document.body.appendChild (renderer.domElement);

	scene.add (player);
	changePOV (2);

	render();
}
