function changePOV (pers) {
			player.visibile = true;
	switch (pers) {
		case 1: // 1st person
			player.visibile = false;
			relativeCameraOffset.set (0, 0.75, 0.25);
		break;

		default:
		case 2: // 2nd person / shoulder view
			relativeCameraOffset.set (0.5, 0.75, 0.5);
		break;

		case 3: // 3rd person
			relativeCameraOffset.set (0.75, 1.25, 1.75);
		break;
		
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
}

Controls.prototype = {
	update: function (delta) { // aprox 0.01;
		var actualMoveSpeed = this.moveSpeed * delta;

		if (this.moveForward)
			this.object.translateZ (-actualMoveSpeed);
		if (this.moveBackward)
			this.object.translateZ (actualMoveSpeed);

		if (this.rotateLeft)
			this.object.rotateY (actualMoveSpeed / 1.25);
		if (this.rotateRight)
			this.object.rotateY (-actualMoveSpeed / 1.25);
	},

	onKeyDown: function (event) {
		switch (event.keyCode) {
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
			changePOV (4);
			break;
		}
	},
};
