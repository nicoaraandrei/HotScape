function changePOV (pers) {
	switch (pers) {
		case 1: // 1st person
			relativeCameraOffset.set (0, 0.75, -0.15);
		break;

		default:
		case 2: // 2nd person / shoulder view
			relativeCameraOffset.set (0.75, 0.75, 0.75);
		break;

		case 3: // 3rd person
			relativeCameraOffset.set (1.75, 1, 1.75);
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
	this.moveSpeed = options.moveSpeed || 100;

	this.domElement.addEventListener ('keydown', this.onKeyDown.bind (this), false);
	this.domElement.addEventListener ('keyup', this.onKeyUp.bind (this), false);

	this.domElement.addEventListener ('contextmenu', event => event.preventDefault());
	this.domElement.addEventListener ('mousedown', this.onMouseDown.bind (this), false);
	this.domElement.addEventListener ('mouseup', this.onMouseUp.bind (this), false);
}

Controls.prototype = {
	update: function (delta) {
		var actualMoveSpeed = this.moveSpeed * delta;

		if (this.moveForward)
			this.object.translateZ (-actualMoveSpeed);
		if (this.moveBackward)
			this.object.translateZ (actualMoveSpeed);

		if (this.rotateLeft)
			this.object.rotateY (actualMoveSpeed / 1.5);
		if (this.rotateRight)
			this.object.rotateY (-actualMoveSpeed / 1.5);
	},

	onKeyDown: function (event) {
		switch (event.keyCode) {
			case 38: /*up*/
			case 87: /*W*/	this.moveForward = true; break;

			case 40: /*down*/
			case 83: /*S*/	this.moveBackward = true; break;

			case 37: /*left*/
			case 65: /*A*/	this.rotateLeft = true; break;

			case 39: /*right*/
			case 68: /*D*/	this.rotateRight = true; break;
		}
	},

	onKeyUp: function (event) {
		switch (event.keyCode) {
			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.rotateLeft = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.rotateRight = false; break;
		}
	},

	onMouseDown: function (event) {
		switch (event.which) {
			case 1: /*left*/
			break;

			case 2: /*mid*/
			break;

			case 3: /*right*/
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
