/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */
 var PointerLockControls = function (camera, cannonBody) {
	var PI_2 = Math.PI / 2;
	var eyeYPos = 2; // eyes are 2 meters above the ground
	var velocityFactor = 0.2;
	var jumpVelocity = 20;
	var scope = this;
	var pitchObject = new THREE.Object3D();
	pitchObject.add (camera);
	pitchObject.rotation.x += PI_2;
	var yawObject = new THREE.Object3D();
	yawObject.rotation.z += PI_2;
	yawObject.add (pitchObject);
	var quat = new THREE.Quaternion();
	var velocity = cannonBody.velocity;

	var onMouseMove = function (event) {
		if (!scope.enabled || window.game.liv.paused) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		yawObject.rotation.z -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max (0, Math.min (Math.PI, pitchObject.rotation.x));
	};

	document.addEventListener ('mousemove', onMouseMove, false);

	this.enabled = false;

	this.getObject = function () {
		return yawObject;
	};

	this.getDirection = function (targetVec){
		targetVec.set (0, 0, -1);
		quat.multiplyVector3 (targetVec);
	}

	this.getEuler = function() {
		return euler;
	}

	// Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
	var inputVelocity = new THREE.Vector3();
	var euler = new THREE.Euler();
	this.update = function (delta) {
		if (!scope.enabled) return;

		euler.order = "XYZ";
		// Convert velocity to world coordinates
		euler.x = pitchObject.rotation.x - PI_2;
		euler.z = yawObject.rotation.z - PI_2;

		yawObject.position.copy (cannonBody.position);
	};
};
