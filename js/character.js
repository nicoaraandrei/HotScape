function character (size, material) {
	// public properties
	this.playerSize = new THREE.BoxGeometry (1, 1, 1);
	this.playerMaterial = new THREE.MeshBasicMaterial ({
		color: 0x223355
	});
	this.playerPosition;

	if (typeof size !== 'undefined')
		this.playerSize = size;
	if (typeof material !== 'undefined')
		this.playerMaterialaterial = material;

	THREE.Mesh.call (this, this.playerSize, this.playerMaterial);
}

character.prototype = Object.create (THREE.Mesh.prototype);
character.prototype.constructor = character;

character.prototype.getMesh = function () {
	return this.playerMesh;
}