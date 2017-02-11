var shift = false;
var airborne = true;
var lastPOV, currPOV;

function changePOV (pers) {
	lastPOV = currPOV;
	currPOV = pers;
	player.visible = true;
	switch (pers) {
		case 1: // 1st person
			player.visible = false;
			relativeCameraOffset.set (0, 0.75, 0.25);
		break;

		case 2: // 2nd person / shoulder view
			relativeCameraOffset.set (0.5, 1, 0.5);
		break;

		case 3: // 3rd person
			relativeCameraOffset.set (0.75, 1.25, 1.5);
		break;
		
		default: currPOV = 4;
		case 4: // bird-ish view
			relativeCameraOffset.set (1, 1.5, 1.75);
		break;
	}
}

function Controls (object, options) {
	this.object = object;
	options = options || {};
	this.domElement = options.domElement || document;
	this.moveSpeed = options.moveSpeed || 250; // avg walking speed = 2.5 m/s

	this.domElement.addEventListener ('keydown', this.onKeyDown.bind (this), false);
	this.domElement.addEventListener ('keyup', this.onKeyUp.bind (this), false);

	this.domElement.addEventListener ('contextmenu', event => event.preventDefault());
	this.domElement.addEventListener ('mousedown', this.onMouseDown.bind (this), false);
	this.domElement.addEventListener ('mouseup', this.onMouseUp.bind (this), false);

	this.object.addEventListener ('collision', function (other_object) {
		if (object.position.y - object._physijs.height / 2 + 0.1 >= other_object.position.y + other_object._physijs.height / 2) {
			console.log (object.name + " touched " + other_object.name + " from above");
			airborne = false;
		}
	});
}

Controls.prototype = {
	update: function (delta) { // aprox 0.01;
		var actualMoveSpeed = this.moveSpeed * delta;

		if (this.moveForward)
			this.object.translateZ (-actualMoveSpeed);
		if (this.moveBackward)
			this.object.translateZ (actualMoveSpeed);

		if (this.rotateLeft)
			this.object.rotateY (actualMoveSpeed / 1.3);
		if (this.rotateRight)
			this.object.rotateY (-actualMoveSpeed / 1.3);

		if (this.jump) {
			if(!airborne) {
				this.object.applyCentralImpulse (new THREE.Vector3 (0, 100, 0));
				airborne = true;
			}
		}
	},

	onKeyDown: function (event) {
		switch (event.keyCode) {
			case 16: // Shift
				shift = true;
			break;

			case 32: // Space
				this.jump = true;
			break;

			case 38: // Up
			case 87: // W
				this.moveForward = true;
			break;

			case 40: // Down
			case 83: // S
				this.moveBackward = true;
			break;

			case 37: // Left
			case 65: // A
				this.rotateLeft = true;
			break;

			case 39: // Right
			case 68: // D
				this.rotateRight = true;
			break;
		}
	},

	onKeyUp: function (event) {
		switch (event.keyCode) {
			case 16: // Shift
				shift = false;
			break;

			case 32: // Space
				this.jump = false;
			break;

			case 38: // Up
			case 87: // W
				this.moveForward = false;
			break;

			case 40: // Down
			case 83: // S
				this.moveBackward = false;
			break;

			case 37: // Left
			case 65: // A
				this.rotateLeft = false;
			break;

			case 39: // Right
			case 68: // D
				this.rotateRight = false;
			break;
		}
	},

	onMouseDown: function (event) {
		switch (event.which) {
			case 1: // Left
			break;

			case 2: // Middle
				// prevent scroll
				event.preventDefault();
			break;

			case 3: // Right
				changePOV (1);
			break;
		}
	},

	onMouseUp: function (event) {
		switch (event.which) {
			case 1: /*left*/
			break;

			case 2: /*mid*/
			break;

			case 3: /*right*/
				changePOV (lastPOV);
			break;
		}
	},
};
