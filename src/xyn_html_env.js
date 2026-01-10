export class ServerDom {
	createElement(tagName) {
		return {
			tagName,
			attributes: {},
			children: [],
			appendChild(child) {
				this.children.push(child);
			},
			setAttribute(name, value) {
				this.attributes[name] = value;
			},
			getAttribute(name) {
				return this.attributes[name];
			},
			removeAttribute(name) {
				delete this.attributes[name];
			},
			style: {},
			classList: {
				add(className) {
					this.classes.push(className);
				},
				remove(className) {
					this.classes = this.classes.filter((c) => c !== className);
				},
				classes: [],
			},
			addEventListener(eventName, handler) {
				this.eventListeners[eventName] = handler;
			},
			removeEventListener(eventName) {
				delete this.eventListeners[eventName];
			},
			eventListeners: {},
			render() {
				const attributes = Object.entries(this.attributes)
					.map(([name, value]) => `${name}="${value}"`)
					.join(" ");
				const children = this.children
					.map((child) => child.render())
					.join("");
				return `<${this.tagName}${attributes ? " " + attributes : ""}>${children}</${this.tagName}>`;
			},
		};
	}

	createTextNode(text) {
		return {
			text,
			render() {
				return this.text;
			},
		};
	}

	createDocumentFragment() {
		return {
			children: [],
			appendChild(child) {
				this.children.push(child);
			},
			render() {
				return this.children.map((child) => child.render()).join("");
			},
		};
	}
}

export class TestingDom {
	createElement(tagName) {
		return {
			tagName,
			attributes: {},
			children: [],
			appendChild(child) {
				this.children.push(child);
			},
			setAttribute(name, value) {
				this.attributes[name] = value;
			},
			getAttribute(name) {
				return this.attributes[name];
			},
			removeAttribute(name) {
				delete this.attributes[name];
			},
			style: {},
			classList: {
				add(className) {
					this.classes.push(className);
				},
				remove(className) {
					this.classes = this.classes.filter((c) => c !== className);
				},
				classes: [],
			},
			addEventListener(eventName, handler) {
				this.eventListeners[eventName] = handler;
			},
			removeEventListener(eventName) {
				delete this.eventListeners[eventName];
			},
			eventListeners: {},
			domAssert() {
				const attributes = Object.entries(this.attributes)
					.map(([name, value]) => `${name}="${value}"`)
					.join(" ");
				const children = this.children
					.map((child) => child.render())
					.join("");
				return `<${this.tagName}${attributes ? " " + attributes : ""}>${children}</${this.tagName}>`;
			},
		};
	}
}