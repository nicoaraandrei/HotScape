function Player (geom, mat, pos) {
	// public properties
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

	Physijs.BoxMesh.call (this, this.geometry, this.material, 50);

	if (typeof pos !== 'undefined')
		this.position = pos;
	this.position.y = 20;
}

Player.prototype = Object.create (Physijs.BoxMesh.prototype);
Player.prototype.constructor = Player;

Player.prototype.walk = function () {
	//
};

Player.prototype.jump = function (distance) {
	/*
	if (this.canJump) {
		distance = distance || this.jumpHeight;
		var thrust = Math.sqrt(Math.abs(2 * distance * this.acceleration.y));
		this.velocity.y += thrust;
		this.canJump = false;
	}
	*/
};

