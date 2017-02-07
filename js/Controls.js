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
}

Controls.prototype = {
	update: function (delta) {
		var actualMoveSpeed = this.moveSpeed * delta;
		if (this.moveForward)	this.object.translateZ (-actualMoveSpeed);
		if (this.moveBackward)	this.object.translateZ ( actualMoveSpeed);
		if (this.moveLeft)		this.object.rotateY ( actualMoveSpeed / 1.5);
		if (this.moveRight)		this.object.rotateY (-actualMoveSpeed / 1.5);
	},
	onKeyDown: function (event) {
		switch (event.keyCode) {
			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;
	
			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;
	
			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;
	
			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;
		}
	},
	onKeyUp: function (event) {
		switch (event.keyCode) {
			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;
	
			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;
	
			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;
	
			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;
		}
	},
};
