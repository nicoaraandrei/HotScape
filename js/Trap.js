function Trap (geom, mat, pos) {
	this.geometry = new THREE.BoxGeometry (1, 1, 1);
	this.material = new THREE.MeshLambertMaterial ({
		color: 0x223355,
		lights: true,
		fog: true
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

Trap.prototype = Object.create (THREE.Mesh.prototype);
Trap.prototype.constructor = Trap;
