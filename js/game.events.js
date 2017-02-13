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
				32: "space",
				65: "a",
				68: "d",
				83: "s",
				87: "w"
			},
			pressed: {}, // This object will contain the pressed key states in real-time

			// Methods
			onKeyDown: function (event) {
				_events.keyboard.pressed[_events.keyboard.keyCodes[event.keyCode]] = true;
				_events.onKeyDown();
			},
			onKeyUp: function (event) {
				_events.keyboard.pressed[_events.keyboard.keyCodes[event.keyCode]] = false;
			}
		},

		// Methods
		init: function() {
			document.addEventListener ("keydown", _events.keyboard.onKeyDown, false);
			document.addEventListener ("keyup", _events.keyboard.onKeyUp, false);
		},
		onKeyDown: function() {
			// No specific actions by default
		}
	};

	return _events;
};