! function (window, document, $) {
	"use strict";
	var Typed = function (el, options) {
		var self = this;
		this.el = el;
		this.options = {};
		Object.keys(defaults).forEach(function (key) {
			self.options[key] = defaults[key];
		});
		Object.keys(options).forEach(function (key) {
			self.options[key] = options[key];
		});
		this.isInput = this.el.tagName.toLowerCase() === 'input';
		this.attr = this.options.attr;
		this.showCursor = this.isInput ? false : this.options.showCursor;
		this.elContent = this.attr ? this.el.getAttribute(this.attr) : this.el.textContent;
		this.contentType = this.options.contentType;
		this.typeSpeed = this.options.typeSpeed;
		this.startDelay = this.options.startDelay;
		this.backSpeed = this.options.backSpeed;
		this.backDelay = this.options.backDelay;
		this.fadeOut = this.options.fadeOut;
		this.fadeOutClass = this.options.fadeOutClass;
		this.fadeOutDelay = this.options.fadeOutDelay;
		if ($ && this.options.stringsElement instanceof $) {
			this.stringsElement = this.options.stringsElement[0]
		} else {
			this.stringsElement = this.options.stringsElement;
		}
		this.strings = this.options.strings;
		this.strPos = 0;
		this.arrayPos = 0;
		this.stopNum = 0;
		this.loop = this.options.loop;
		this.loopCount = this.options.loopCount;
		this.curLoop = 0;
		this.stop = false;
		this.cursorChar = this.options.cursorChar;
		this.shuffle = this.options.shuffle;
		this.sequence = [];
		this.build();
	};
	Typed.prototype = {
		constructor: Typed,
		init: function () {
			var self = this;
			self.timeout = setTimeout(function () {
				for (var i = 0; i < self.strings.length; ++i) self.sequence[i] = i;
				if (self.shuffle) self.sequence = self.shuffleArray(self.sequence);
				self.typewrite(self.strings[self.sequence[self.arrayPos]], self.strPos);
			}, self.startDelay);
		},
		build: function () {
			var self = this;
			if (this.showCursor === true) {
				this.cursor = document.createElement('span');
				this.cursor.className = 'typed-cursor';
				this.cursor.innerHTML = this.cursorChar;
				this.el.parentNode && this.el.parentNode.insertBefore(this.cursor, this.el.nextSibling);
			}
			if (this.stringsElement) {
				this.strings = [];
				this.stringsElement.style.display = 'none';
				var strings = Array.prototype.slice.apply(this.stringsElement.children);
				strings.forEach(function (stringElement) {
					self.strings.push(stringElement.innerHTML);
				});
			}
			this.init();
		},
		typewrite: function (curString, curStrPos) {
			if (this.stop === true) {
				return;
			}
			if (this.fadeOut && this.el.classList.contains(this.fadeOutClass)) {
				this.el.classList.remove(this.fadeOutClass);
				this.cursor.classList.remove(this.fadeOutClass);
			}
			var humanize = Math.round(Math.random() * (100 - 30)) + this.typeSpeed;
			var self = this;
			self.timeout = setTimeout(function () {
				var charPause = 0;
				var substr = curString.substr(curStrPos);
				if (substr.charAt(0) === '^') {
					var skip = 1; 
					if (/^\^\d+/.test(substr)) {
						substr = /\d+/.exec(substr)[0];
						skip += substr.length;
						charPause = parseInt(substr);
					}
					curString = curString.substring(0, curStrPos) + curString.substring(curStrPos + skip);
				}
				if (self.contentType === 'html') {
					var curChar = curString.substr(curStrPos).charAt(0);
					if (curChar === '<' || curChar === '&') {
						var tag = '';
						var endTag = '';
						if (curChar === '<') {
							endTag = '>'
						}
						else {
							endTag = ';'
						}
						while (curString.substr(curStrPos + 1).charAt(0) !== endTag) {
							tag += curString.substr(curStrPos).charAt(0);
							curStrPos++;
							if (curStrPos + 1 > curString.length) { break; }
						}
						curStrPos++;
						tag += endTag;
					}
				}
				self.timeout = setTimeout(function () {
					if (curStrPos === curString.length) {
						self.options.onStringTyped(self.arrayPos);
						if (self.arrayPos === self.strings.length - 1) {
							self.options.callback();
							self.curLoop++;
							if (self.loop === false || self.curLoop === self.loopCount)
								return;
						}
						self.timeout = setTimeout(function () {
							self.backspace(curString, curStrPos);
						}, self.backDelay);
					} else {
						if (curStrPos === 0) {
							self.options.preStringTyped(self.arrayPos);
						}
						var nextString = curString.substr(0, curStrPos + 1);
						if (self.attr) {
							self.el.setAttribute(self.attr, nextString);
						} else {
							if (self.isInput) {
								self.el.value = nextString;
							} else if (self.contentType === 'html') {
								self.el.innerHTML = nextString;
							} else {
								self.el.textContent = nextString;
							}
						}
						curStrPos++;
						self.typewrite(curString, curStrPos);
					}
				}, charPause);
			}, humanize);
		},
		backspace: function (curString, curStrPos) {
			var self = this;
			// exit when stopped
			if (this.stop === true) {
				return;
			}
			if (this.fadeOut) {
				this.initFadeOut();
				return;
			}
			var humanize = Math.round(Math.random() * (100 - 30)) + this.backSpeed;
			self.timeout = setTimeout(function () {
				if (self.contentType === 'html') {
					// skip over html tags while backspacing
					if (curString.substr(curStrPos).charAt(0) === '>') {
						var tag = '';
						while (curString.substr(curStrPos - 1).charAt(0) !== '<') {
							tag -= curString.substr(curStrPos).charAt(0);
							curStrPos--;
							if (curStrPos < 0) { break; }
						}
						curStrPos--;
						tag += '<';
					}
				}
				var nextString = curString.substr(0, curStrPos);
				self.replaceText(nextString);
				if (curStrPos > self.stopNum) {
					curStrPos--;
					self.backspace(curString, curStrPos);
				}
				else if (curStrPos <= self.stopNum) {
					self.arrayPos++;
					if (self.arrayPos === self.strings.length) {
						self.arrayPos = 0;
						if (self.shuffle) self.sequence = self.shuffleArray(self.sequence);
						self.init();
					} else
						self.typewrite(self.strings[self.sequence[self.arrayPos]], curStrPos);
				}
			}, humanize);
		},
		initFadeOut: function () {
			self = this;
			this.el.className += ' ' + this.fadeOutClass;
			this.cursor.className += ' ' + this.fadeOutClass;
			return setTimeout(function () {
				self.arrayPos++;
				self.replaceText('');
				if (self.strings.length > self.arrayPos) {
					self.typewrite(self.strings[self.sequence[self.arrayPos]], 0);
				} else {
					self.typewrite(self.strings[0], 0);
					self.arrayPos = 0;
				}
			}, self.fadeOutDelay);
		},
		replaceText: function (str) {
			if (this.attr) {
				this.el.setAttribute(this.attr, str);
			} else {
				if (this.isInput) {
					this.el.value = str;
				} else if (this.contentType === 'html') {
					this.el.innerHTML = str;
				} else {
					this.el.textContent = str;
				}
			}
		},
		shuffleArray: function (array) {
			var tmp, current, top = array.length;
			if (top) while (--top) {
				current = Math.floor(Math.random() * (top + 1));
				tmp = array[current];
				array[current] = array[top];
				array[top] = tmp;
			}
			return array;
		},
		reset: function () {
			var self = this;
			clearInterval(self.timeout);
			var id = this.el.getAttribute('id');
			this.el.textContent = '';
			if (typeof this.cursor !== 'undefined' && typeof this.cursor.parentNode !== 'undefined') {
				this.cursor.parentNode.removeChild(this.cursor);
			}
			this.strPos = 0;
			this.arrayPos = 0;
			this.curLoop = 0;
			// Send the callback
			this.options.resetCallback();
		}
	};
	Typed.new = function (selector, option) {
		var elements = Array.prototype.slice.apply(document.querySelectorAll(selector));
		elements.forEach(function (element) {
			var instance = element._typed,
				options = typeof option == 'object' && option;
			if (instance) { instance.reset(); }
			element._typed = instance = new Typed(element, options);
			if (typeof option == 'string') instance[option]();
		});
	};
	if ($) {
		$.fn.typed = function (option) {
			return this.each(function () {
				var $this = $(this),
					data = $this.data('typed'),
					options = typeof option == 'object' && option;
				if (data) { data.reset(); }
				$this.data('typed', (data = new Typed(this, options)));
				if (typeof option == 'string') data[option]();
			});
		};
	}
	window.Typed = Typed;
	var defaults = {
		strings: ["These are the default values...", "You know what you should do?", "Use your own!", "Have a great day!"],
		stringsElement: null,
		typeSpeed: 0,
		startDelay: 0,
		backSpeed: 0,
		shuffle: false,
		backDelay: 500,
		fadeOut: false,
		fadeOutClass: 'typed-fade-out',
		fadeOutDelay: 500, 
		loop: false,
		loopCount: false,
		showCursor: true,
		cursorChar: " |",
		attr: null,
		contentType: 'html',
		callback: function () { },
		preStringTyped: function () { },
		onStringTyped: function () { },
		resetCallback: function () { }
	};
}(window, document, window.jQuery);
