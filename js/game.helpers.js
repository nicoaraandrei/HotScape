/*
 * Game Helpers
 *
 * A collection of useful math and object helpers
 */

window.game = window.game || {};

window.game.helpers = {
	// Convert from polar coordinates to Cartesian coordinates using length and radian
	polarToCartesian: function (vectorLength, vectorDirection) {
		return {
			x: vectorLength * Math.cos (vectorDirection),
			y: vectorLength * Math.sin (vectorDirection)
		};
	},
	radToDeg: function (radians) { // (PI * radian = 180 degrees)
		return radians * (180 / Math.PI);
	},
	degToRad: function (degrees) {
		return degrees * Math.PI / 180;
	},
	random: function (min, max, round) {
		return round ? (Math.floor (Math.random() * (max - min + 1)) + min) : (Math.random() * max) + min;
	},
	cloneObject: function (obj) {
		var copy;

		if (obj === null || typeof obj !== "object")
			return obj;

		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime (obj.getTime());

			return copy;
		}

		if (obj instanceof Array) {
			copy = [];
			for (var i = 0, len = obj.length; i < len; i++)
				copy[i] = window.game.helpers.cloneObject(obj[i]);

			return copy;
		}

		if (obj instanceof Object) {
			copy = {};
			for (var attr in obj)
				if (obj.hasOwnProperty (attr))
					copy[attr] = window.game.helpers.cloneObject (obj[attr]);

			return copy;
		}
	}
};
