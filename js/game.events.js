/*
 * Game Events
 *
 * A basic input system for keyboard controls
 */
window.game = window.game || {};
window.game.events = function() {
	var _events = {
		keyboard: {
			// Will be used in game.core.player.controlKeys
			keyCodes: {
				16: "shift",
				32: "space",
				65: "a",
				68: "d",
				82: "r",
				83: "s",
				87: "w"
			},
			pressed: {}, // will contain the pressed key in real-time
			onKeyDown: function (event) {
				_events.keyboard.pressed[_events.keyboard.keyCodes[event.keyCode]] = true;
			},
			onKeyUp: function (event) {
				_events.keyboard.pressed[_events.keyboard.keyCodes[event.keyCode]] = false;
			}
		},
		mouse: {
			keyCodes: {
				1: "leftC",
				2: "middleC",
				3: "rightC"
			},
			pressed: {},
			onMouseDown: function (event) {
				_events.mouse.pressed[_events.mouse.keyCodes[event.which]] = true;
				_events.onMouseDown();
			},
			onMouseUp: function (event) {
				_events.mouse.pressed[_events.mouse.keyCodes[event.which]] = false;
			},
			onWheel: function (event) {
				// disable zoom by ctrl+wheel // still possible by other means, like ctrl+ +/-
				event.preventDefault();
				//console.log (event);
			}
		},
		init: function() {
			document.addEventListener ("keydown", _events.keyboard.onKeyDown, false);
			document.addEventListener ("keyup", _events.keyboard.onKeyUp, false);
			document.addEventListener ("contextmenu", event => event.preventDefault());
			document.addEventListener ("mousedown", _events.mouse.onMouseDown, false);
			document.addEventListener ("mouseup", _events.mouse.onMouseUp, false);
			document.addEventListener ("wheel", _events.mouse.onWheel, false);
		},
		onMouseDown: function() {}
	};

	return _events;
};
