function Player (geom, mat, pos) {
	this.geometry = new THREE.BoxGeometry (0.75, 2, 0.5);
	this.material = new THREE.MeshLambertMaterial ({
		color: 0x223355,
		lights: true,
		fog: false
	});

	if (typeof geom !== 'undefined')
		this.geometry = geom;
	if (typeof mat !== 'undefined')
		this.material = mat;
	// avg european male weight: 71
	Physijs.BoxMesh.call (this, this.geometry, this.material, 71);
	if (typeof pos !== 'undefined')
		this.position = pos;
}

Player.prototype = Object.create (Physijs.BoxMesh.prototype);
Player.prototype.constructor = Player;
