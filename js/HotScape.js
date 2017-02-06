var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera (
	120, // FOV
	window.innerWidth / window.innerHeight, // aspect ratio
	0.1, // near
	1000 // far
);
var renderer = new THREE.WebGLRenderer();

function render() {
	requestAnimationFrame (render);
	renderer.render (scene, camera);
}

function changePOV (pers) {
	switch (pers) {
		case 1: // 1st person
			camera.position.set (0, 0, 0);
		break;

		default:
		case 2: // 2nd person / shoulder view
			camera.position.set (0.75, 0.75, 0.75);
		break;

		case 3: // 3rd person
			camera.position.set (2, 1, 2);
		break;
		
		case 4: // bird-ish view
			camera.position.set (1.25, 1.75, 1.75);
		break;
	}
}

var playerGeometry = new THREE.BoxGeometry (0.75, 1.77, 0.5); // width, height, depth
var playerMaterial = new THREE.MeshBasicMaterial ({
	color: 0x223355,
	wireframe: true
});
var player = new THREE.Mesh (playerGeometry, playerMaterial);

function main() {
	renderer.setSize (window.innerWidth, window.innerHeight);
	document.body.appendChild (renderer.domElement);

	scene.add (player);
	changePOV (2);

	render();
}
