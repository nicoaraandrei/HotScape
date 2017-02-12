function Wall (geom, mat, pos) {
	this.geometry = new THREE.BoxGeometry (0.5, 2, 10);
	this.material = new THREE.MeshLambertMaterial ({
		color: 0x223355,
		lights: true,
		fog: true
	});

	if (typeof geom !== 'undefined')
		this.geometry = geom;
	if (typeof mat !== 'undefined')
		this.material = mat;
	THREE.Mesh.call (this, this.geometry, this.material);
	if (typeof pos !== 'undefined')
		this.position = pos;
}

Wall.prototype = Object.create (THREE.Mesh.prototype);
Wall.prototype.constructor = Wall;
