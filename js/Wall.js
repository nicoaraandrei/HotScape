function Wall (geom, mat, pos) {
	// public properties
	this.geometry = new THREE.BoxGeometry (0.5, 2, 10);
	this.material = new THREE.MeshBasicMaterial ({
		color: 0x223355
	});
	this.position = new THREE.Vector3();

	if (typeof geom !== 'undefined')
		this.geometry = geom;
	if (typeof mat !== 'undefined')
		this.material = mat;
	if (typeof pos !== 'undefined')
		this.position = pos;

	THREE.Mesh.call (this, this.geometry, this.material);
}

Wall.prototype = Object.create (THREE.Mesh.prototype);
Wall.prototype.constructor = Wall;