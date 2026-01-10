/**
 * @fileoverview XynSignal is a library for creating reactive signals, it is
 * used in XynHTML to render the data to HTML elements. It may also be used
 * independently of XynHTML.
 *
 * @license MIT
 * Copyright (c) 2024 XynHTML
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @typedef {Object} XynChange
 * @template T
 * @property {T} value
 * @property {T} previousValue
 * @description XynChange is a class for storing the values of a change.
 * @example
 * const change = XynChange.create(1, 0);
 * console.log(change.value); // 1
 * console.log(change.previousValue); // 0
 * console.log(change.values); // { value: 1, previousValue: 0 }
 */
class XynChange {
	#value;
	#previousValue;

	constructor(value, previousValue) {
		this.#value = value;
		this.#previousValue = previousValue;
	}

	static create(value, previousValue) {
		return new XynChange(value, previousValue);
	}

	get value() {
		return this.#value;
	}

	get previousValue() {
		return this.#previousValue;
	}

	get values() {
		return { value: this.#value, previousValue: this.#previousValue };
	}
}

/**
 * @typedef {Object} XynCollectionChange
 * @template T
 * @property {int} index
 * @property {T} value
 * @property {T} previousValue
 * @description XynListChange is a class for storing the values of a collection change.
 * @example
 * const change = XynListChange.create(0, 1, 0);
 * console.log(change.index); // 0
 * console.log(change.value); // 1
 * console.log(change.previousValue); // 0
 * console.log(change.values); // { index: 0, value: 1, previousValue: 0 }
 */
class XynCollectionChange {
	#index;
	#value;
	#previousValue;

	constructor(index, value, previousValue) {
		this.#index = index;
		this.#value = value;
		this.#previousValue = previousValue;
	}

	static create(index, value, previousValue) {
		return new XynCollectionChange(index, value, previousValue);
	}

	get index() {
		return this.#index;
	}

	get value() {
		return this.#value;
	}

	get previousValue() {
		return this.#previousValue;
	}

	get values() {
		return {
			value: this.#value,
			previousValue: this.#previousValue,
			index: this.#index,
		};
	}
}

/**
 * @enum {Symbol}
 * @readonly
 * @description CollectionValue is an enum of sentinals for the values of a collection change that don't or didn't exist.
 */
export const CollectionValue = Object.freeze({
	INSERT: new Symbol("insert"),
	DELETE: new Symbol("delete"),
});

/**
 * @template T
 * @param {T} value
 * @returns {{ value: T, subscribe: (subscriber: Function) => void }}
 * @description Creates a signal with the given value.
 * The signal can be subscribed to and will notify subscribers when the value changes.
 * @example
 * const signal = createSignal(0);
 * signal.subscribe(({value, previousValue}) =>
 * console.log(`Value changed from ${previousValue} to ${value}`)
 * );
 */
export function createSignal(value) {
	if (typeof value === "function") {
		value = value();
	}
	if (value instanceof Map || value instanceof Set) {
		return createCollectionSignal(value);
	}
	if (Array.isArray(value)) {
		return createListSignal(value);
	}
	if (typeof value === "object" && value !== null) {
		return createObjectSignal(value);
	}
	const subscribers = new Set();
	const signalProxy = new Proxy(
		{ value },
		{
			get(target, prop) {
				return Reflect.get(target, prop);
			},
			set(target, prop, newValue) {
				if (prop === "value") {
					const previousValue = target.value;
					Reflect.set(target, prop, newValue);
					subscribers.forEach((subscriber) =>
						subscriber(XynChange.create(newValue, previousValue)),
					);
					return true;
				}
			},
		},
	);

	/**
	 * @param {function({value: any, previousValue: any}): void} subscriber
	 * @returns {function(): void}
	 * @description Subscribes to the signal and returns a function to unsubscribe.
	 * The subscriber function is called with the current value and the previous value.
	 * The subscriber function is called immediately with the current value.
	 * @example
	 * const signal = createSignal(0);
	 * const unsubscribe = signal.subscribe(({value, previousValue}) =>
	 * console.log(`Value changed from ${previousValue} to ${value}`)
	 * );
	 */
	function subscribe(subscriber) {
		subscribers.add(subscriber);
		return () => subscribers.delete(subscriber);
	}

	return Object.assign(signalProxy, { subscribe });
}

function createObjectSignal(obj) {
	const subscribers = new Set();
	const signalProxy = new Proxy(obj, {
		set(target, prop, newValue) {
			const previousValue = Reflect.get(target, prop);
			Reflect.set(target, prop, newValue);
			subscribers.forEach((subscriber) =>
				subscriber(
					XynCollectionChange.create(prop, newValue, previousValue),
				),
			);
		},
		deleteProperty(target, prop) {
			const previousValue = Reflect.get(target, prop);
			Reflect.deleteProperty(target, prop);
			subscribers.forEach((subscriber) =>
				subscriber(
					XynCollectionChange.create(
						prop,
						CollectionValue.DELETE,
						previousValue,
					),
				),
			);
		},
	});

	function subscribe(subscriber) {
		subscribers.add(subscriber);
		return () => subscribers.delete(subscriber);
	}

	return Object.assign(signalProxy, { subscribe });
}

function createListSignal(list) {
	const subscribers = new Set();
	const signalProxy = new Proxy(list, {
		get(target, prop, receiver) {
			const value = Reflect.get(target, prop, receiver);
			if (typeof value === "function") {
				return (...args) => {
					const result = value.apply(target, args);
					if (prop === "push" || prop === "unshift") {
						subscribers.forEach((subscriber) =>
							subscriber(
								XynCollectionChange.create(
									args[0],
									result,
									CollectionValue.INSERT,
								),
							),
						);
					} else if (prop === "pop" || prop === "shift") {
						subscribers.forEach((subscriber) =>
							subscriber(
								XynCollectionChange.create(
									target.length,
									CollectionValue.DELETE,
									CollectionValue.DELETE,
								),
							),
						);
					} else if (prop === "splice") {
						subscribers.forEach((subscriber) =>
							subscriber(
								XynCollectionChange.create(
									args[0],
									args[2],
									CollectionValue.DELETE,
								),
							),
						);
					} else {
						subscribers.forEach((subscriber) =>
							subscriber(
								XynCollectionChange.create(
									prop,
									value,
									VALUE_DELETE,
								),
							),
						);
					}
				};
			}
		},
	});

	function subscribe(subscriber) {
		subscribers.add(subscriber);
		return () => subscribers.delete(subscriber);
	}

	return Object.assign(signalProxy, { subscribe });
}

function createCollectionSignal(collection) {
	const subscribers = new Set();
	const signalProxy = new Proxy(collection, {
		get(target, prop, receiver) {
			const value = Reflect.get(target, prop, receiver);

			if (typeof value === "function") {
				return (...args) => {
					const result = value.apply(target, args);
					if (prop === "set" || prop === "add") {
						subscribers.forEach((subscriber) =>
							subscriber(
								XynCollectionChange.create(
									args[0],
									args[1],
									target.get(args[0]),
								),
							),
						);
					} else if (prop === "delete") {
						subscribers.forEach((subscriber) =>
							subscriber(
								XynCollectionChange.create(
									args[0],
									CollectionValue.DELETE,
									target.get(args[0]),
								),
							),
						);
					} else if (prop === "clear") {
						subscribers.forEach((subscriber) =>
							subscriber(
								XynCollectionChange.create(
									target.length,
									CollectionValue.DELETE,
									CollectionValue.DELETE,
								),
							),
						);
					}
					return result;
				};
			}
		},
	});

	function subscribe(subscriber) {
		subscribers.add(subscriber);
		return () => subscribers.delete(subscriber);
	}

	return Object.assign(signalProxy, { subscribe });
}
