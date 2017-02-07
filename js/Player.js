function Player (geom, mat, pos) {
	// public properties
	this.geometry = new THREE.BoxGeometry (1, 1, 1);
	this.material = new THREE.MeshBasicMaterial ({
		color: 0x223355
	});

	if (typeof geom !== 'undefined')
		this.geometry = geom;
	if (typeof mat !== 'undefined')
		this.material = mat;
	if (typeof pos !== 'undefined')
		this.position = pos;

	THREE.Mesh.call (this, this.geometry, this.material);
}

Player.prototype = Object.create (THREE.Mesh.prototype);
Player.prototype.constructor = Player;

Player.prototype.walk = function (direction) {
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
