/*
 * Game UI
 *
 * A class for handling the user interface of the gaming providing DOM element management and some helpers
 */
window.game = window.game || {};
window.game.ui = function() {
	var _ui = {
		elements: {
			// Properties for DOM elements are stored here
			infoboxIntro: null,
			infoboxLost: null
		},
		init: function() {
			_ui.getElements();
			_ui.bindEvents();
		},
		destroy: function() {},
		getElements: function() {
			// Store the DOM elements in the elements object to make them accessible in addClass, removeClass and hasClass
			_ui.elements.infoboxIntro = document.querySelector ("#infoboxIntro");
			_ui.elements.infoboxLost = document.querySelector ("#infoboxLost");
		},
		bindEvents: function() {
			_ui.elements.infoboxIntro.addEventListener ("click", _ui.requestLock, false);

			// pause on lost focus
			/* if (!"requestPointerLock" in document.body) _ui.crash(); else {
				document.addEventListener ("pointerlockerror", _ui.pause, false);
				document.addEventListener ("pointerlockchange", _ui.changedLock, false);
			} */
			document.addEventListener ("pointerlockerror", _ui.pause, false);
			document.addEventListener ("mozpointerlockerror", _ui.pause, false);
			document.addEventListener ("webkitpointerlockerror", _ui.pause, false);
			document.addEventListener ("pointerlockchange", _ui.changedLock, false);
			document.addEventListener ("mozpointerlockchange", _ui.changedLock, false);
			document.addEventListener ("webkitpointerlockchange", _ui.changedLock, false);
		},

		replaceText: function (elementId, text = "", parentId, type) {
			if (elementId && text) {
				var parent = document.getElementById (parentId) || document.getElementById (elementId).parentNode;
				var sp1 = document.createElement (type || "span"); // "p"
				sp1.id = elementId;
				sp1.appendChild (document.createTextNode (text));
				parent.replaceChild (sp1, (document.getElementById (elementId)));
			}
		},
		addClass: function (el, _class, reset) {
			// Adds a class to a specified el
			if (reset && _ui.elements[el].getAttribute ("data-classname"))
				_ui.elements[el].className = reset && _ui.elements[el].getAttribute ("data-classname");
			_ui.elements[el].className = _ui.elements[el].className + " " + _class;
		},
		changedLock: function() {
			if (_ui.isPointerLocked()) {
				var _ev = window.game.events();
				_ev.keyboard.pressed = {};
				_ev.mouse.pressed = {};
				_ui.fadeOut ("infoboxIntro");
				window.game.liv.paused = false;
			} else
				_ui.pause();
		},
		requestLock: function (event) {
			var db = document.body;
			if (!db.requestPointerLock) /* _ui.crash(); */
				db.requestPointerLock = (
					db.requestPointerLock ||	//(>2015-09)
					db.mozRequestPointerLock ||	//(<2015-08)
					db.webkitRequestPointerLock	//(<2014-07)
				);
			db.requestPointerLock();
			_ui.changedLock();
		},
		//	black boxes:
			pause: function (b) {window.game.liv.paused = true; _ui.fadeIn ("infoboxIntro"); if (b) _ui.pointerUnlock()},
			isPointerLocked: function() {return (document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement);},
			pointerUnlock: function() {var d = document; d.exitPointerLock = d.exitPointerLock || d.mozExitPointerLock || d.webkitExitPointerLock; d.exitPointerLock();},
		//	DOM-only
			hasClass: function (el, _class) {return _ui.elements[el].className.match (_class);},
			removeClass: function (el, _class) {_ui.elements[el].className = _ui.elements[el].className.replace (new RegExp ("\\s\\b" + _class + "\\b","gi"), "");},
			crash: function (err = 'Browser not supported') {document.write('<html><body><h1 style="text-align: center;">'+err+'</h1></body></html>');document.close();},
			// fade in/out of _ui.elements
			fadeIn: function (el)  {if (!_ui.hasClass (el, "fade-in"))  {_ui.removeClass (el, "fade-out"); _ui.addClass (el, "fade-in"); }},
			fadeOut: function (el) {if (!_ui.hasClass (el, "fade-out")) {_ui.removeClass (el, "fade-in");  _ui.addClass (el, "fade-out");}}
	};

	return _ui;
};
