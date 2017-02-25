window.game = window.game || {};
window.game.core = function () {
	_game = {
		bullets: [],
		timeSpeed: 0.1,
		deathReasons: {
			generic: {
				0:	"You died.",
				1:	"That's not how it should end.",
				2:	"Survive.",
				3:	"Take frequent breaks!",
				4:	"It's just a game."
			//	5:	"Rule #1: it's never my fault"
			},
			collision: { // traps, bullets, etc
				0:	"You could've dodged that."
			//	1:	"The * is a spy" // Team Fortress 2
			},
			off: {
					// multidirectional
				0:	"Do a barrel roll!", // Star Fox 64
				1:	"That wasn't flying, that was falling with style!", // Toy Story
				2:	"To infinity and beyond.", // Toy Story
				3:	"Jump up, jump up, and get down!", // House of Pain - Jump Around
				4:	"The knack lies in learning how to throw yourself at the ground and miss.", // The Hitchhiker's Guide to the Galaxy
				5:	"You're going too fast! HotScape should not be played while driving.", // Pokemon GO
				6:	"Next time do a flip.",
				7:	"Next time do a frontflip.",
				8:	"Next time do a backflip.",
					// sky only
				9:	"Kiss the sky!", // Jimi Hendrix - Purple Haze (or Jason Derulo if that's your thing)
				10:	"The sky is the limit!"
			}
		},
		intervals : [],
		//collision filter group - must be power of 2
		GROUP1 : 1, // platform
		GROUP2 : 2, // player
		GROUP3 : 4, // obstacle
		GROUP4 : 8, // trap
		player: {
			model: null,
			mesh: null,
			shape: null,
			body: null,
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
			accelerationX: 0,
			accelerationY: 0,
			rotationAcceleration: 0,
			playerCoords: null,
			cameraCoords: null,
			cameraOffsetH: 240,
			cameraOffsetV: 140,
			controls: null,
			time: Date.now(),

			// Enum for an easier method access to acceleration/rotation
			accelValues: {
				posX: {
					acceleration: "accelerationX",
					speed: "speed",
					speedMax: "speedMax"
				},
				posY: {
					acceleration: "accelerationY",
					speed: "speed",
					speedMax: "speedMax"
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
				run: "shift",
				master: "m", // todo: remove before merging to master
				pause: "p"
			},
			mouseButtons: {
				fire: "leftC",
				dismiss: "rightC"
			},

			create: function() {
				// Create a global physics material for the player which will be used as ContactMaterial for all other objects in the level
				_cannon.playerPhysicsMaterial = new CANNON.Material ("playerMaterial");

				//	// Create a player character based on an imported 3D model that was already loaded as JSON into game.models.player
				//	_game.player.model = _three.createModel (window.game.models.player, 12, [
				// 		new THREE.MeshLambertMaterial ({
				//			color: _static.colors.cyan,
				//			shading: THREE.FlatShading
				//		}),
				// 		new THREE.MeshLambertMaterial ({
				//			color: _static.colors.green,
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
				_game.player.body = new CANNON.Body ({
					mass: _game.player.mass,
					shape: _game.player.shape,
					material: _cannon.createPhysicsMaterial (_cannon.playerPhysicsMaterial, 0, 0)
				});
				_game.player.mesh = _cannon.addVisual (_game.player.body, null, _game.player.model.mesh);

				// Enable shadows
				_game.player.mesh.castShadow = true;
				_game.player.mesh.receiveShadow = false;

				// Spawn location
				_game.player.body.position.set (_static.floorSize - _static.floorHeight, 2 * _static.floorHeight - _static.floorSize, _static.floorHeight * 3 / 2);

				_game.player.body.collisionFilterGroup = _game.GROUP2;
				_game.player.body.collisionFilterMask =  _game.GROUP1;

				_game.player.body.angularFactor.setZero();

				_game.player.body.tag = "player";

				_game.player.controls = new PointerLockControls (_three.camera, _game.player.body);
				_three.scene.add (_game.player.controls.getObject());
				_game.player.controls.enabled = true;

				_game.player.body.postStep = function() {
					// update player's orientation afterwards
					_game.player.updateOrientation();
				};

				// Collision event listener for the jump mechanism
				_game.player.body.addEventListener ("collide", function (event) {
					if (!_game.player.isGrounded) {
						var contact = event.contact;
						var contactNormal = new CANNON.Vec3();

						if (contact.bi.id == _game.player.body.id)
							contact.ni.negate (contactNormal);
						else
							contactNormal.copy (contact.ni);
						_game.player.isGrounded = (contactNormal.dot (new CANNON.Vec3 (0, 0, 1)) > 0);
					}
					_game.player.checkGameOver (event.body.tag);
				});

				//	if (event.with.collisionFilterGroup == _game.GROUP4)
				// 		console.dir (event);
				//	else
				//		console.log (event.with.collisionFilterGroup);
				//	_game.player.body.addEventListener ("intersect", );
			},
			update: function() {
				_game.player.processUserInput();
				_game.player.accelerate();
				_game.player.rotate();
				_game.player.updateCamera();

				_game.player.checkGameOver();
			},
			updateCamera: function() {
				_game.player.controls.update (Date.now() - _game.player.time);
				_game.player.time = Date.now();
			},
			updateAcceleration: function (acc, direction) {
				if (direction === 1) {
					// Forward/right
					if (_game.player[acc] > -_game.player.speedMax) {
						if (_game.player[acc] >= _game.player.speedMax / 2) {
							_game.player[acc] = - _game.player.speedMax / 4;
						} else {
							_game.player[acc] -= _game.player.speed;
						}
					} else {
						_game.player[acc] = - _game.player.speedMax;
					}
				} else {
					// Backward/left
					if (_game.player[acc] < _game.player.speedMax) {
						if (_game.player[acc] <= - _game.player.speedMax / 2) {
							_game.player[acc] = _game.player.speedMax / 4;
						} else {
							_game.player[acc] += _game.player.speed;
						}
					} else {
						_game.player[acc] = _game.player.speedMax;
					}
				}

			},
			processUserInput: function() {
				var kP = _events.keyboard.pressed,
					pl = _game.player,
					cK = pl.controlKeys;

				pl.speed	= pl.defaultSpeed	 * (kP[cK.run] ? 3 : 1);
				pl.speedMax	= pl.defaultSpeedMax * (kP[cK.run] ? 3 : 1);
				_game.timeSpeed = (kP[cK.master] || kP[cK.forward] ? 1 : kP[cK.backward] || kP[cK.left] || kP[cK.right] ? .2 : .1);

				if (kP[cK.forward])	 pl.updateAcceleration ("accelerationX",  1);
				if (kP[cK.backward]) pl.updateAcceleration ("accelerationX", -1);
				if (kP[cK.right])	 pl.updateAcceleration ("accelerationY",  1);
				if (kP[cK.left])	 pl.updateAcceleration ("accelerationY", -1);
				if (kP[cK.reload])	pl.reload();
				if (kP[cK.jump])	pl.jump();
				if (kP[cK.pause])	_ui.pause();
			},
			accelerate: function() {
			    var acc = (_game.player.accelerationX * _game.player.accelerationX + _game.player.accelerationY * _game.player.accelerationY);
			    if (acc > _game.player.speedMax * _game.player.speedMax) {
			    	var magnitude = Math.sqrt (acc);
			    	_game.player.accelerationX *= _game.player.speedMax / magnitude;
			    	_game.player.accelerationY *= _game.player.speedMax / magnitude;
			    }
			    var inputAcceleration = new THREE.Vector3 (_game.player.accelerationX, -_game.player.accelerationY, 0);
				inputAcceleration.applyEuler (_game.player.controls.getEuler());
				// Set actual XYZ velocity by using calculated Cartesian coordinates
				_game.player.body.velocity.set (
					inputAcceleration.x,
					inputAcceleration.y,
					_game.player.body.velocity.z
				);

				// Damping
				if (!_events.keyboard.pressed[_game.player.controlKeys.forward] && !_events.keyboard.pressed[_game.player.controlKeys.backward])
					_game.player.accelerationX *= _game.player.damping;

				if (!_events.keyboard.pressed[_game.player.controlKeys.left] && !_events.keyboard.pressed[_game.player.controlKeys.right])
					_game.player.accelerationY *= _game.player.damping;
			},
			rotate: function() {
				// Rotate player around Z axis
				_cannon.rotateOnAxis (
					_game.player.body,
					new CANNON.Vec3 (0, 0, 1),
					_game.player.rotationAcceleration
				);

				// Damping
				if (!_events.keyboard.pressed[_game.player.controlKeys.left] && !_events.keyboard.pressed[_game.player.controlKeys.right])
					_game.player.rotationAcceleration *= _game.player.rotationDamping;
			},
			jump: function() {
				// Perform a jump if player has collisions and the collision contact is beneath him (ground)
				if (_game.player.isGrounded) {
					_game.player.isGrounded = false;
					_game.player.body.velocity.z = _game.player.jumpHeight;
				}
			},
			reload: function() {
				// reload animation/ reload delay
				_game.player.canFire = true;
			},
			fire: function() {
				var shootVelo = 200;
				if (_game.player.canFire) {
				//	if (_game.bullets.length == 20) {
				//		_three.scene.remove (_game.bullets[0].visualref);
				//		_cannon.world.remove (_game.bullets[0]);
				//		_game.bullets.splice (0, 1);
				//	}
					var x = _game.player.body.position.x;
					var y = _game.player.body.position.y;
					var z = _game.player.body.position.z;
					var bulletShape = new CANNON.Sphere (1);
					var material = new THREE.MeshLambertMaterial ({color: 0xdddddd});

					var shootDirection = new THREE.Vector3();
					var vector = shootDirection;
						shootDirection.set (0, 0, 1);

					vector.unproject (_three.camera);
					var ray = new THREE.Ray (_three.camera.position, vector.sub (_three.camera.position).normalize());
			   	 	shootDirection.x = ray.direction.x;
					shootDirection.y = ray.direction.y;
					shootDirection.z = ray.direction.z;
					// Move the bullet outside the player sphere
					x += shootDirection.x;
					y += shootDirection.y;
					z += shootDirection.z;

					var bullet = _cannon.createBody ({
						shape: bulletShape,
						mass: 200,
						position: new CANNON.Vec3 (x, y, z),
						meshMaterial: material,
						physicsMaterial: _cannon.solidMaterial
					});
					bullet.collisionFilterGroup = _game.GROUP4;
					bullet.collisionFilterMask =  _game.GROUP1;

					bullet.velocity.set (
						shootDirection.x * shootVelo,
						shootDirection.y * shootVelo,
						shootDirection.z * shootVelo
					);
					_game.bullets.push (bullet);
					_game.player.canFire = false;
				}
			},
			updateOrientation: function() {
				// Convert player's Quaternion to Euler radians and save them to _game.player.rotationRadians
				_game.player.rotationRadians = new THREE.Euler().setFromQuaternion (_game.player.body.quaternion);

				// Round angles
				_game.player.rotationAngleX = Math.round (window.game.helpers.radToDeg (_game.player.rotationRadians.x));
				_game.player.rotationAngleY = Math.round (window.game.helpers.radToDeg (_game.player.rotationRadians.y));

				// Prevent player from being upside-down on a slope - this needs improvement
				if ((_cannon.getCollisions (_game.player.body.index) && (
					(_game.player.rotationAngleX >=  90) ||
					(_game.player.rotationAngleX <= -90) ||
					(_game.player.rotationAngleY >=  90) ||
					(_game.player.rotationAngleY <= -90)))) {
					// Reset orientation
					_game.player.body.quaternion.setFromAxisAngle (
						new CANNON.Vec3 (0, 0, 1),
						_game.player.rotationRadians.z
					);
				}
			},
			checkGameOver: function (reason = "") {
				var poz = _game.player.mesh.position.z;
				if (Math.abs (poz) > 800 || reason) {
					var rndR = window.game.helpers.random,
						deRe = _game.deathReasons;
					_liv.deaths++;
					switch (reason) {
						case "trap": case "spikes": case "saw":
						case "bullet":
							if (rndR (0, 1, 1))
								reason = deRe.collision[0];
							else
								reason = deRe.generic[rndR (0, 2, 1)];
						break;
						default:
							if (Math.abs (poz) > 800)
								if (poz < 0)
									if (rndR (0, 5, 1))
										reason = deRe.off[rndR (0, 8, 1)];
									else
										reason = deRe.generic[rndR (0, 2, 1)];
								else // if (poz > 0)
									if (rndR (0, 5, 1))
										reason = deRe.off[rndR (0, 10, 1)];
									else
										reason = deRe.generic[rndR (0, 2, 1)];
						break;
					}
					_ui.replaceText ("reason", reason);
					_ui.fadeIn ("infoboxLost");
					_game.destroy();
				}
			}
		},

		level: {
			platform: {},
			walls: [],
			objects: [],
			traps: [],
			bullets: [],
			create: function() {
				// Create a solid material for all objects in the world
				_cannon.solidMaterial = _cannon.createPhysicsMaterial (new CANNON.Material ("solidMaterial"), 0, 0.1);

				// Add a floor
				_game.level.addWall (0, 0, _static.floorHeight / -2, _static.floorSize, _static.floorSize, _static.floorHeight, _static.colors.dirt);
				_game.level.platform = _game.level.walls[0];
			//	_game.level.platform.collisionFilterGroup = _game.GROUP1;
			//	_game.level.platform.collisionFilterMask =  _game.GROUP1 | _game.GROUP2 | _game.GROUP3 | _game.GROUP4;

				//Add walls
				_game.level.addWall (0, -_static.floorSize, 60, _static.floorSize, _static.floorHeight, 50); // external W
				_game.level.addWall (0,  _static.floorSize, 60, _static.floorSize, _static.floorHeight, 50); // external E
				_game.level.addWall (-_static.floorSize, 0, 60, _static.floorHeight, _static.floorSize, 50); // external N
			//	_game.level.addWall ( _static.floorSize, 0, 60, _static.floorHeight, _static.floorSize, 50); // external S

				//Add traps
				_game.level.addTrap (100,  100,   40, "saw", {towards: 'x'}).patrol (60);
				_game.level.addTrap (-100, -100,  40, "saw", {towards: 'y'}).patrol (60);
				_game.level.addTrap (-180, -200, 150, "spikes");
				_game.level.addTrap (-120, -140, 210, "spikes");
				_game.level.addTrap ( -60,  -80, 270, "spikes");
				_game.level.addTrap(-200, 100, 40, "launcher");
				_game.level.addTrap (200,100,40,"spikes");

				_game.intervals.push(setInterval(function(){
					var t = _game.level.traps;
					for(var i=0;i<t.length;i++)
					{
						if(t[i].body.tag == "launcher")
							t[i].fire();
					}
					}, 1000));
			},
			addWall: function (_pX, _pY, _pZ, _sX, _sY, _sZ, _color = 0xdddddd) { // todo: merge this with 'addTrap'
				if (typeof _pX != "undefined" && typeof _pY != "undefined" && typeof _pZ != "undefined")
					_game.level.walls.push (_cannon.createBody ({
						shape: new CANNON.Box (new CANNON.Vec3 (_sX || 10, _sY || 10, _sZ || 10)),
						mass: 0,
						position: new CANNON.Vec3 (_pX, _pY, _pZ),
						meshMaterial: new THREE.MeshLambertMaterial ({color: _color}),
						physicsMaterial: _cannon.solidMaterial
					}));
			},
			addTrap: function (_pX, _pY, _pZ, _type, params = {}) {
				if (_type && typeof _pX != "undefined" && typeof _pY != "undefined" && typeof _pZ != "undefined") {
					/*	params:
						* : color, wireframe, distance, towards
						spikes : size {x, y, z}, mass
						saw: radius
						todo: change color to texture
							if (typeof params.distance === "undefined") params.distance = 0;
					*/
					var _trap = {}, _position = new CANNON.Vec3 (_pX, _pY, _pZ);
					if (typeof params.color == "undefined") params.color = _static.colors.red;
					if (typeof params.wireframe == "undefined") params.wireframe = false;
					if (typeof params.towards == "undefined") params.towards = 'x';
					switch (_type) {
						default: _type = "spikes"; case "spikes":
							if (typeof params.size === "undefined") params.size = {x: 30, y: 30, z: 30}; else {
								if (typeof params.size.x === "undefined") params.size.x = 30;
								if (typeof params.size.y === "undefined") params.size.y = 30;
								if (typeof params.size.z === "undefined") params.size.z = 30;
							}
							if (typeof params.mass === "undefined") params.mass = 5;
							_trap.model = _three.createModel(window.game.models.spikes, 10, new THREE.MeshLambertMaterial ({
									color: params.color,
									wireframe: params.wireframe
								}));
							_trap.body = _cannon.createBody ({
								shape: new CANNON.Box (_trap.model.halfExtents),
								mass: params.mass,
								position: _position,
								physicsMaterial: _cannon.solidMaterial,
								model: 1
							});
							_trap.mesh = _cannon.addVisual(_trap.body, null, _trap.model.mesh);
						break;

						case "saw":
							if (typeof params.radius === "undefined" || typeof params.diameter === "undefined") params.diameter = 30;
							_trap.model = _three.createModel(window.game.models.saw, 10, new THREE.MeshLambertMaterial ({
									color: params.color,
									wireframe: params.wireframe
								}));
							_trap.body = _cannon.createBody ({
								shape: new CANNON.Cylinder (
									params.diameter || params.radius * 2,
									params.diameter || params.radius * 2,
									2,	// height
									32	// radiusSegments
								),
								mass: 5, // Body without mass can't have velocity; todo: fix this
								position: _position,
								meshMaterial: new THREE.MeshLambertMaterial ({
									color: params.color,
									wireframe: params.wireframe
								}),
								physicsMaterial: _cannon.solidMaterial,
								model: 1
							});
							_trap.mesh = _cannon.addVisual(_trap.body, null, _trap.model.mesh);
							switch (params.towards) {
								case 'x':	_trap.body.quaternion = new CANNON.Quaternion (1, 0, 0, 1); break;
								case 'y':	_trap.body.quaternion = new CANNON.Quaternion (0, 1, 0, 1); break;
								// todo: add X+Y support
							//	case "xy":	_trap.body.quaternion = new CANNON.Quaternion (1, 1, 0, 1); break;
							}
							_trap.body.quaternion.normalize();
						break;

						case "launcher":
							if (typeof params.size === "undefined") params.size = {x: 30, y: 30, z: 30}; else {
									if (typeof params.size.x === "undefined") params.size.x = 30;
									if (typeof params.size.y === "undefined") params.size.y = 30;
									if (typeof params.size.z === "undefined") params.size.z = 30;
								}
							if (typeof params.mass === "undefined") params.mass = 0;
							_trap.body = _cannon.createBody ({
								shape: new CANNON.Box (new CANNON.Vec3 (params.size.x, params.size.y, params.size.z)),
								mass: params.mass,
								position: _position,
								meshMaterial: new THREE.MeshLambertMaterial ({
									color: params.color,
									wireframe: params.wireframe
								}),
								physicsMaterial: _cannon.solidMaterial,
							});
						break;
					}

					_game.level.traps.push (_trap);
					var thisTrap = _game.level.traps[_game.level.traps.length - 1];
					thisTrap.body.tag = _type;
					thisTrap.body.towards = params.towards;

					_trap.fire = function  () {
						var shootVelo = 100;
				//	if (_game.bullets.length == 20) {
				//		_three.scene.remove (_game.bullets[0].visualref);
				//		_cannon.world.remove (_game.bullets[0]);
				//		_game.bullets.splice (0, 1);
				//	}
					var x = _trap.body.position.x;
					var y = _trap.body.position.y;
					var z = _trap.body.position.z;
					var bulletShape = new CANNON.Sphere (10);
					var material = new THREE.MeshLambertMaterial ({color: _static.colors.red});

					var shootDirection = new THREE.Vector3();
					var vector = shootDirection;
						shootDirection.set (1, 0, 0);

					var ray = new THREE.Ray (_trap.position, vector.normalize());
			   	 	shootDirection.x = ray.direction.x;
					shootDirection.y = ray.direction.y;
					shootDirection.z = ray.direction.z;
					// Move the bullet outside the player sphere
					x += shootDirection.x;
					y += shootDirection.y;
					z += shootDirection.z;

					var bullet = _cannon.createBody ({
						shape: bulletShape,
						mass: 200,
						position: new CANNON.Vec3 (x, y, z),
						meshMaterial: material,
						physicsMaterial: _cannon.solidMaterial
					});

					bullet.velocity.set (
						shootDirection.x * shootVelo,
						shootDirection.y * shootVelo,
						shootDirection.z * shootVelo
					);
					bullet.tag = "bullet";
					_game.level.bullets.push (bullet);	
					};
					
					_trap.patrol = function (distance = 0) {
						_trap.body.loc = {
							// todo: preserve Z & X/Y/none
							min: _trap.body.position[_trap.body.towards] - distance / 2,
							max: _trap.body.position[_trap.body.towards] + distance / 2,
							// todo: add X+Y support
							// t[i].towards[0]
							// t[i].towards[1]
							dir: 1
						};
					};


					return _trap;
				}
			},
			animateTraps: function () {
				var t = _game.level.traps;

				for (var i = 0; i < t.length; i++) {if (t[i].body.loc) {
					if(t[i].body.towards) {
					// todo: preserve Z
					t[i].body.velocity.set (0, 0, _cannon.gravity);
					if (t[i].body.position[t[i].body.towards] >= t[i].body.loc.max || t[i].body.position[t[i].body.towards] <= t[i].body.loc.min) {
						t[i].body.position[t[i].body.towards] = t[i].body.loc[(t[i].body.loc.dir > 0 ? "max" : "min")]; // little hack so the trap won't get stuck at min/max
						t[i].body.loc.dir *= -1;
					}
					t[i].body.velocity[t[i].body.towards] = t[i].body.loc.dir * 100; // * _game.timeSpeed * _game.player.speed;
					t[i].body.quaternion.set (0, 0, 0, 1);
					t[i].body.quaternion[t[i].body.towards] = 1;
					// todo: add X+Y support
					// t[i].body.towards[0]
					// t[i].body.towards[1]
					t[i].body.quaternion.normalize();
					}
				}

			}
		}



		},
		init: function (options) {
			// Setup necessary game components (_events, _three, _cannon, _ui, _static)
			_game.initComponents (options);

			_game.player.create();
			_game.level.create();

			_game.step();
			_game.loop();
		},
		destroy: function() {
			// Pause animation frame loop
			window.cancelAnimationFrame (_animationFrameLoop);
			for(var i=0; i<_game.intervals.length;i++) {
				clearInterval(_game.intervals[i]);
			}
			// Destroy THREE.js scene and Cannon.js world and recreate them
			_cannon.destroy();
			_cannon.setup();
			_three.destroy();
			_three.setup();

			// Recreate player and level objects by using initial values which were copied at the first start
			_game.player = window.game.helpers.cloneObject (_gameDefaults.player);
			_game.level = window.game.helpers.cloneObject (_gameDefaults.level);

			// Recreate player and level
			_game.player.create();
			_game.level.create();

			_game.step();
			_game.loop();
		},
		loop: function() {
			// Assign an id to the animation frame loop
			_animationFrameLoop = window.requestAnimationFrame (_game.loop);

			if (!_liv.paused)
				_game.step();

			// Render visual scene
			_three.render();
		},
		step: function() {
				_game.level.animateTraps();
				_cannon.updatePhysics();
				_game.player.update();
		},
		initComponents: function (options) {
			// Reference game components one time
			_events = window.game.events();
			_three = window.game.three();
			_cannon = window.game.cannon();
			_ui = window.game.ui();

			_three.setupLights = function () {
				_three.scene.fog = new THREE.FogExp2 (_static.colors.fog, .001);
				var pSun = new THREE.DirectionalLight (
					_static.colors.sun, // color
					1 // intensity
				);
				pSun.castShadow = true;
				pSun.shadow.mapSize.width = _static.floorSize * 5;
				pSun.shadow.mapSize.height = _static.floorSize * 5;
				pSun.shadow.camera.top = _static.floorSize * 2;
				pSun.shadow.camera.right = _static.floorSize * 2;
				pSun.shadow.camera.left = _static.floorSize * -2;
				pSun.shadow.camera.bottom = _static.floorSize * -2;
				pSun.shadow.camera.near = 1;
				pSun.shadow.camera.fov = _static.floorSize / 3;
				pSun.shadow.camera.far = _static.floorSize * 2;
				pSun.position.set (
					_static.floorSize * 0.4,	// X
					_static.floorSize * 0.4,	// Z
					_static.floorSize		// Y
				);
				_three.scene.add (pSun);
				_three.scene.add (new THREE.CameraHelper (pSun.shadow.camera));

				var cSun = new THREE.HemisphereLight (
					_static.colors.sky,
					_static.colors.dirt,
					.6 // intensity
				);
				cSun.position.set (
					-_static.floorSize,
					-_static.floorSize,
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

			_events.onMouseDown = function() {
				if (_events.mouse.pressed[_game.player.mouseButtons.dismiss])
					_ui.fadeOut ("infoboxLost");
			};
		}
	};

	var _events;
	var _three;
	var _cannon;
	var _ui;
	var _static = window.game.static;
	var _liv = window.game.liv;
	var _animationFrameLoop;
	// Game defaults which will be set one time after first start
	var _gameDefaults = {
		player: window.game.helpers.cloneObject (_game.player),
		level: window.game.helpers.cloneObject (_game.level)
	};

	return _game;
};
