window.game = window.game || {};
window.game.core = function () {
	_game = {
		timeSpeed: 1.0,
		timeSpeedMax: 1.0,
		timeSpeedMin: 0.1,
		//collision filter group - must be power of 2
		GROUP1 : 1, // platform
		GROUP2 : 2, // player
		GROUP3 : 4, // obstacle
		GROUP4 : 8, // trap
		player: {
			model: null,
			mesh: null,
			shape: null,
			rigidBody: null,
			mass: 3,
			orientationConstraint: null, // HingeConstraint - limit player's air-twisting
			isGrounded: false,
			canFire: true,
			jumpHeight: 38,
			defaultSpeed: 1.5,
			defaultSpeedMax: 45,
			speed: 1.5,
			speedMax: 45,
			rotationSpeed: 0.007,
			rotationSpeedMax: 0.04,
			rotationRadians: new THREE.Vector3 (0, 0, 0),
			rotationAngleX: null,
			rotationAngleY: null,
			damping: 0.9, // Deceleration (0.8~0.98 are recommended)
			rotationDamping: 0.8,
			acceleration: 0,
			rotationAcceleration: 0,
			playerCoords: null,
			cameraCoords: null,
			cameraOffsetH: 240,
			cameraOffsetV: 140,

			// Enum for an easier method access to acceleration/rotation
			playerAccelerationValues: {
				position: {
					acceleration: "acceleration",
					speed: "speed",
					speedMax: "speedMax"
				},
				rotation: {
					acceleration: "rotationAcceleration",
					speed: "rotationSpeed",
					speedMax: "rotationSpeedMax"
				}
			},
			// game.events.*.keyCodes
			controlKeys: {
				forward: "w",
				backward: "s",
				left: "a",
				right: "d",
				jump: "space",
				reload: "r",
				run: "shift"
			},
			mouseButtons: {
				fire: "leftC"/*,
				nothingYet: "middleC"
				*/
			},

			create: function() {
				// Create a global physics material for the player which will be used as ContactMaterial for all other objects in the level
				_cannon.playerPhysicsMaterial = new CANNON.Material ("playerMaterial");

				//	// Create a player character based on an imported 3D model that was already loaded as JSON into game.models.player
				//	_game.player.model = _three.createModel (window.game.models.player, 12, [
				// 		new THREE.MeshLambertMaterial ({
				//			color: window.game.static.colors.cyan,
				//			shading: THREE.FlatShading
				//		}),
				// 		new THREE.MeshLambertMaterial ({
				//			color: window.game.static.colors.green,
				//			shading: THREE.FlatShading
				//		})
				//	]);

				_game.player.model = _three.createModelFromGeometry (
					new THREE.BoxGeometry (10, 40, 10),
					1,
					new THREE.MeshLambertMaterial ({
						color: 0x223355,
						lights: true,
						fog: false
					})
				);

				// Create the shape, mesh and rigid body for the player character and assign the physics material to it
				_game.player.shape = new CANNON.Box (_game.player.model.halfExtents);
				_game.player.rigidBody = new CANNON.RigidBody (
					_game.player.mass,
					_game.player.shape,
					_cannon.createPhysicsMaterial (_cannon.playerPhysicsMaterial)
				);
				_game.player.rigidBody.position.set (0, 0, 50);
				_game.player.mesh = _cannon.addVisual (_game.player.rigidBody, null, _game.player.model.mesh);

				// Enable shadows
				_game.player.mesh.castShadow = true;
				_game.player.mesh.receiveShadow = false;

				//freeze exceeding rotation
				_game.player.rigidBody.inertia.set (0, 0, 0);
				_game.player.rigidBody.invInertia.set (0, 0, 0);

				_game.player.rigidBody.collisionFilterGroup = _game.GROUP1;
				_game.player.rigidBody.collisionFilterMask =  _game.GROUP1;

				// Create a HingeConstraint to limit player's air-twisting - this needs improvement
				_game.player.orientationConstraint = new CANNON.HingeConstraint (
					_game.player.rigidBody,
					new CANNON.Vec3 (0, 0, 0),
					new CANNON.Vec3 (0, 0, 1),
					_game.player.rigidBody,
					new CANNON.Vec3 (0, 0, 1),
					new CANNON.Vec3 (0, 0, 1)
				);
				_cannon.world.addConstraint (_game.player.orientationConstraint);

				_game.player.rigidBody.postStep = function() {
					// Reset player's angularVelocity to limit possible exceeding rotation and
					//_game.player.rigidBody.angularVelocity.z = 0;
					//_game.player.rigidBody.angularVelocity.y = 0;
					//_game.player.rigidBody.angularVelocity.x = 0;
					// update player's orientation afterwards
					_game.player.updateOrientation();
				};

				// Collision event listener for the jump mechanism
				_game.player.rigidBody.addEventListener ("collide", function (event) {
					// Checks if player's is on ground
					if (!_game.player.isGrounded)
						// Ray intersection test to check if player is colliding with an object beneath him
						_game.player.isGrounded = (
							new CANNON.Ray (
								_game.player.mesh.position,
								new CANNON.Vec3 (0, 0, -1)
							).intersectBody (event.contact.bi).length > 0
						);
					if (event.with.tag == "trap")
						_game.player.checkGameOver (true);
				});

				//	if (event.with.collisionFilterGroup == _game.GROUP4)
				// 		console.dir (event);
				//	else
				//		console.log (event.with.collisionFilterGroup);
				//	_game.player.rigidBody.addEventListener ("intersect", );
			},
			update: function() {
				_game.player.processUserInput();
				_game.player.accelerate();
				_game.player.rotate();
				_game.player.updateCamera();

				_game.player.checkGameOver();
			},
			updateCamera: function() {
				// Calculate camera coordinates by using Euler radians from player's last rotation
				_game.player.cameraCoords = window.game.helpers.polarToCartesian (_game.player.cameraOffsetH, _game.player.rotationRadians.z);

				_three.camera.position.x = _game.player.mesh.position.x + _game.player.cameraCoords.x;
				_three.camera.position.y = _game.player.mesh.position.y + _game.player.cameraCoords.y;
				_three.camera.position.z = _game.player.mesh.position.z + _game.player.cameraOffsetV;

				_three.camera.lookAt (_game.player.mesh.position);
			},
			updateAcceleration: function (values, direction) {
				// Distinguish between acceleration/rotation and forward/right (1) and backward/left (-1)
				if (direction === 1) {
					// Forward/right
					if (_game.player[values.acceleration] > -_game.player[values.speedMax]) {
						if (_game.player[values.acceleration] >= _game.player[values.speedMax] / 2) {
							_game.player[values.acceleration] = -(_game.player[values.speedMax] / 4);
						} else {
							_game.player[values.acceleration] -= _game.player[values.speed];
						}
					} else {
						_game.player[values.acceleration] = -_game.player[values.speedMax];
					}
				} else {
					// Backward/left
					if (_game.player[values.acceleration] < _game.player[values.speedMax]) {
						if (_game.player[values.acceleration] <= -(_game.player[values.speedMax] / 2)) {
							_game.player[values.acceleration] = _game.player[values.speedMax] / 4;
						} else {
							_game.player[values.acceleration] += _game.player[values.speed];
						}
					} else {
						_game.player[values.acceleration] = _game.player[values.speedMax];
					}
				}
			},
			processUserInput: function() {
				if (_events.keyboard.pressed[_game.player.controlKeys.forward]) {
					_game.player.updateAcceleration (_game.player.playerAccelerationValues.position,  1);

					// Reset orientation in air
					if (!_cannon.getCollisions (_game.player.rigidBody.index))
						_game.player.rigidBody.quaternion.setFromAxisAngle (
							new CANNON.Vec3 (0, 0, 1),
							_game.player.rotationRadians.z
						);
					if (_game.timeSpeed < _game.timeSpeedMax) {
						_game.timeSpeed += 0.1;
					}
				} else {
					if (_game.timeSpeed > _game.timeSpeedMin + 0.1) {
						_game.timeSpeed -= 0.1;
					}
				}

				if (_events.keyboard.pressed[_game.player.controlKeys.run]) {
					_game.player.speedMax = _game.player.defaultSpeedMax * 3;
					_game.player.speed = _game.player.defaultSpeed * 3;
				} else {
					_game.player.speed = _game.player.defaultSpeed;
					_game.player.speedMax = _game.player.defaultSpeedMax;
				}

				if (_events.keyboard.pressed[_game.player.controlKeys.jump])
					_game.player.jump();

				if (_events.keyboard.pressed[_game.player.controlKeys.backward])
					_game.player.updateAcceleration (_game.player.playerAccelerationValues.position, -1);

				if (_events.keyboard.pressed[_game.player.controlKeys.right])
					_game.player.updateAcceleration (_game.player.playerAccelerationValues.rotation,  1);

				if (_events.keyboard.pressed[_game.player.controlKeys.left])
					_game.player.updateAcceleration (_game.player.playerAccelerationValues.rotation, -1);

				if (_events.mouse.pressed[_game.player.mouseButtons.fire]) {
					_game.player.fire();
				}
			},
			accelerate: function() {
				// Calculate player coordinates by using current acceleration Euler radians from player's last rotation
				_game.player.playerCoords = window.game.helpers.polarToCartesian (
					_game.player.acceleration,
					_game.player.rotationRadians.z
				);

				// Set actual XYZ velocity by using calculated Cartesian coordinates
				_game.player.rigidBody.velocity.set (
					_game.player.playerCoords.x,
					_game.player.playerCoords.y,
					_game.player.rigidBody.velocity.z
				);

				// Damping
				if (!_events.keyboard.pressed[_game.player.controlKeys.forward] && !_events.keyboard.pressed[_game.player.controlKeys.backward])
					_game.player.acceleration *= _game.player.damping;
			},
			rotate: function() {
				// Rotate player around Z axis
				_cannon.rotateOnAxis (
					_game.player.rigidBody,
					new CANNON.Vec3 (0, 0, 1),
					_game.player.rotationAcceleration
				);

				// Damping
				if (!_events.keyboard.pressed[_game.player.controlKeys.left] && !_events.keyboard.pressed[_game.player.controlKeys.right])
					_game.player.rotationAcceleration *= _game.player.rotationDamping;
			},
			jump: function() {
				// Perform a jump if player has collisions and the collision contact is beneath him (ground)
				if (_cannon.getCollisions (_game.player.rigidBody.index) && _game.player.isGrounded) {
					_game.player.isGrounded = false;
					_game.player.rigidBody.velocity.z = _game.player.jumpHeight;
				}
			},
			fire: function() {
				if (_game.player.canFire) {
					_game.player.canFire = false;
					console.log ("bullet fired");
				}
			},
			updateOrientation: function() {
				// Convert player's Quaternion to Euler radians and save them to _game.player.rotationRadians
				_game.player.rotationRadians = new THREE.Euler().setFromQuaternion (_game.player.rigidBody.quaternion);

				// Round angles
				_game.player.rotationAngleX = Math.round (window.game.helpers.radToDeg (_game.player.rotationRadians.x));
				_game.player.rotationAngleY = Math.round (window.game.helpers.radToDeg (_game.player.rotationRadians.y));

				// Prevent player from being upside-down on a slope - this needs improvement
				if ((_cannon.getCollisions (_game.player.rigidBody.index) && (
					(_game.player.rotationAngleX >=  90) ||
					(_game.player.rotationAngleX <= -90) ||
					(_game.player.rotationAngleY >=  90) ||
					(_game.player.rotationAngleY <= -90)))) {
					// Reset orientation
					_game.player.rigidBody.quaternion.setFromAxisAngle (
						new CANNON.Vec3 (0, 0, 1),
						_game.player.rotationRadians.z
					);
				}
			},
			checkGameOver: function (forceGameOver = false) {
				if (_game.player.mesh.position.z <= -800 || forceGameOver) {
					if (!_ui.hasClass ("infoboxLost", "fade-in")) {
						_ui.removeClass ("infoboxLost", "fade-out");
						_ui.fadeIn ("infoboxLost");
					}
					_game.destroy();
				}
			}
		},

		level: {
			platform: {},
			walls: [],
			objects: [],
			traps: [],
			create: function() {
				// Create a solid material for all objects in the world
				_cannon.solidMaterial = _cannon.createPhysicsMaterial (new CANNON.Material ("solidMaterial"), 0, 0.1);

				var floorHeight = 10;

				// Add a floor
				_game.level.platform = _cannon.createRigidBody ({
					shape: new CANNON.Box (new CANNON.Vec3 (
						window.game.static.floorSize,
						window.game.static.floorSize,
						floorHeight
					)),
					mass: 0,
					position: new CANNON.Vec3 (0, 0, -floorHeight/2),
					meshMaterial: new THREE.MeshLambertMaterial ({color: window.game.static.colors.dirt}),
					physicsMaterial: _cannon.solidMaterial
				});
				//_game.level.platform.collisionFilterGroup = _game.GROUP1;
				//_game.level.platform.collisionFilterMask =  _game.GROUP1 | _game.GROUP2 | _game.GROUP3 | _game.GROUP4;


				//Add a wall
				_game.level.walls.push (_cannon.createRigidBody ({
					shape: new CANNON.Box (new CANNON.Vec3 (window.game.static.floorSize, floorHeight, window.game.static.floorSize / 2)),
					mass: 0,
					position: new CANNON.Vec3 (0, window.game.static.floorSize + floorHeight, 0),
					meshMaterial: new THREE.MeshLambertMaterial ({color: window.game.static.colors.green}),
					physicsMaterial: _cannon.solidMaterial
				}));
				//Add some boxes
				_game.level.traps.push (_cannon.createRigidBody ({
					shape: new CANNON.Box (new CANNON.Vec3 (30, 30, 30)),
					mass: 5,
					position: new CANNON.Vec3 (-240, -200, 30 - 1),
					meshMaterial: new THREE.MeshLambertMaterial ({color: window.game.static.colors.red}),
					physicsMaterial: _cannon.solidMaterial
				}));

				_cannon.createRigidBody ({
					shape: new CANNON.Box (new CANNON.Vec3 (30, 30, 30)),
					mass: 5,
					position: new CANNON.Vec3 (-300, -260, 90),
					meshMaterial: new THREE.MeshLambertMaterial ({color: window.game.static.colors.cyan}),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody ({
					shape: new CANNON.Box (new CANNON.Vec3 (30, 30, 30)),
					mass: 5,
					position: new CANNON.Vec3 (-180, -200, 150),
					meshMaterial: new THREE.MeshLambertMaterial ({color: window.game.static.colors.cyan}),
					physicsMaterial: _cannon.solidMaterial
				});

				_game.level.objects.push (_cannon.createRigidBody ({
					shape: new CANNON.Box (new CANNON.Vec3 (30, 30, 30)),
					mass: 5,
					position: new CANNON.Vec3 (-120, -140, 210),
					meshMaterial: new THREE.MeshLambertMaterial ({color: window.game.static.colors.green}),
					physicsMaterial: _cannon.solidMaterial
				}));

				_cannon.createRigidBody ({
					shape: new CANNON.Box (new CANNON.Vec3 (30, 30, 30)),
					mass: 5,
					position: new CANNON.Vec3 (-60, -80, 270),
					meshMaterial: new THREE.MeshLambertMaterial ({color: window.game.static.colors.cyan}),
					physicsMaterial: _cannon.solidMaterial
				});

				_game.level.traps[0].tag = "trap";
				// // Grid Helper
				// var grid = new THREE.GridHelper (floorSize, floorSize / 10);
				// grid.position.z = 0.5;
				// grid.rotation.x = window.game.helpers.degToRad (90);
				// _three.scene.add (grid);
			}
		},
		init: function (options) {
			// Setup necessary game components (_events, _three, _cannon, _ui)
			_game.initComponents (options);

			_game.player.create();
			_game.level.create();

			_game.loop();
		},
		destroy: function() {
			// Pause animation frame loop
			window.cancelAnimationFrame (_animationFrameLoop);

			// Destroy THREE.js scene and Cannon.js world and recreate them
			_cannon.destroy();
			_cannon.setup();
			_three.destroy();
			_three.setup();

			// Recreate player and level objects by using initial values which were copied at the first start
			_game.player = window.game.helpers.cloneObject (_gameDefaults.player);
			_game.level = window.game.helpers.cloneObject (_gameDefaults.level);

			// Create player and level again
			_game.player.create();
			_game.level.create();

			// Continue with the game loop
			_game.loop();
		},
		loop: function() {
			// Assign an id to the animation frame loop
			_animationFrameLoop = window.requestAnimationFrame (_game.loop);

			// Update Cannon.js world and player state
			_cannon.updatePhysics();
			_game.player.update();

			// Render visual scene
			_three.render();
		},
		initComponents: function (options) {
			// Reference game components one time
			_events = window.game.events();
			_three = window.game.three();
			_cannon = window.game.cannon();
			_ui = window.game.ui();

			_three.setupLights = function () {
				_three.scene.fog = new THREE.FogExp2 (window.game.static.colors.fog, .001);
				var pSun = new THREE.DirectionalLight (
					window.game.static.colors.sun, // color
					1 // intensity
				);
				pSun.castShadow = true;
				pSun.shadow.mapSize.width = window.game.static.floorSize * 5;
				pSun.shadow.mapSize.height = window.game.static.floorSize * 5;
				pSun.shadow.camera.top = window.game.static.floorSize * 2;
				pSun.shadow.camera.right = window.game.static.floorSize * 2;
				pSun.shadow.camera.left = window.game.static.floorSize * -2;
				pSun.shadow.camera.bottom = window.game.static.floorSize * -2;
				pSun.shadow.camera.near = 1;
				pSun.shadow.camera.fov = window.game.static.floorSize / 3;
				pSun.shadow.camera.far = window.game.static.floorSize * 2;
				pSun.position.set (
					window.game.static.floorSize * 0.4,	// X
					window.game.static.floorSize * 0.4,	// Z
					window.game.static.floorSize		// Y
				);
				_three.scene.add (pSun);
				_three.scene.add (new THREE.CameraHelper (pSun.shadow.camera));

				var cSun = new THREE.HemisphereLight (
					window.game.static.colors.sky,
					window.game.static.colors.dirt,
					.6 // intensity
				);
				cSun.position.set (
					-window.game.static.floorSize,
					-window.game.static.floorSize,
					0
				);
				_three.scene.add (cSun);
			};

			// Initialize components with options
			_three.init (options);
			_cannon.init (_three);
			_ui.init();
			_events.init();

			// Enable shadows for THREE.js
			_three.renderer.shadowMap.enabled = true;
			_three.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

			_events.onKeyDown = function () {
				if (!_ui.hasClass ("infoboxIntro", "fade-out"))
					_ui.fadeOut ("infoboxIntro");
				if (_ui.hasClass ("infoboxLost", "fade-in")) {
					_ui.removeClass ("infoboxLost","fade-in");
					_ui.fadeOut ("infoboxLost");
				}
			};
		}
	};

	var _events;
	var _three;
	var _cannon;
	var _ui;
	var _animationFrameLoop;
	// Game defaults which will be set one time after first start
	var _gameDefaults = {
		player: window.game.helpers.cloneObject (_game.player),
		level: window.game.helpers.cloneObject (_game.level)
	};

	return _game;
};
