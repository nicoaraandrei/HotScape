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
				83: "s",
				87: "w"
			},
			pressed: {}, // will contain the pressed key in real-time
			onKeyDown: function (event) {
				_events.keyboard.pressed[_events.keyboard.keyCodes[event.keyCode]] = true;
				_events.onKeyDown();
			},
			onKeyUp: function (event) {
				_events.keyboard.pressed[_events.keyboard.keyCodes[event.keyCode]] = false;
			}
		},

		init: function() {
			document.addEventListener ("keydown", _events.keyboard.onKeyDown, false);
			document.addEventListener ("keyup", _events.keyboard.onKeyUp, false);
			document.addEventListener ("contextmenu", event => event.preventDefault());
			document.addEventListener ("mousedown", _events.keyboard.onMouseDown, false);
			document.addEventListener ("mouseup", _events.keyboard.onMouseUp, false);
		},
		onKeyDown: function() {
		},
		onMouseDown: function (event) {
			switch (event.which) {
				case 1: // left
				break;
				case 2: // middle
				break;
				case 3: // right
				break;
			}
		},
		onMouseUp: function (event) {
			switch (event.which) {
				case 1: // left
				break;
				case 2: // middle
				break;
				case 3: // right
				break;
			}
		}
	};

	return _events;
};