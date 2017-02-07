function Player (geom, mat) {
	// public properties
	this.geometry = new THREE.BoxGeometry (1, 1, 1);
	this.material = new THREE.MeshBasicMaterial ({
		color: 0x223355
	});
	this.position;

	if (typeof geom !== 'undefined')
		this.geometry = geom;
	if (typeof mat !== 'undefined')
		this.material = mat;

	THREE.Mesh.call (this, this.geometry, this.material);
}

Player.prototype = Object.create (THREE.Mesh.prototype);
Player.prototype.constructor = Player;

Player.prototype.getMesh = function () {
	return this.playerMesh;
}