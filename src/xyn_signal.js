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
    return {
      value: this.#value,
      previousValue: this.#previousValue,
    };
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
  INSERT: Symbol("insert"),
  DELETE: Symbol("delete"),
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

  if (value != null) {
    if (value instanceof Map || value instanceof Set) {
      return createCollectionSignal(value);
    }
    if (Array.isArray(value)) {
      return createListSignal(value);
    }
    if (typeof value === "object" && value !== null) {
      return createObjectSignal(value);
    }
  }
  const subscribers = new Set();

  /**
   * @type {Object}
   * @property {T} value
   * @property {function(function({value: any, previousValue: any}): void): function(): void} subscribe
   * @description Subscribes to the signal and returns a function to unsubscribe.
   * The subscriber function is called with the current value and the previous value.
   * The subscriber function is called immediately with the current value.
   * @example
   * const signal = createSignal(0);
   * const unsubscribe = signal.subscribe(({value, previousValue}) =>
   * console.log(`Value changed from ${previousValue} to ${value}`)
   * );
   */
  const signalProxy = new Proxy(
    {
      value,
      subscribe(subscriber) {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
      },
    },
    {
      get(target, prop) {
        return Reflect.get(target, prop);
      },
      set(target, prop, newValue) {
        if (prop === "value") {
          const previousValue = Reflect.get(target, prop);
          Reflect.set(target, prop, newValue);
          subscribers.forEach((subscriber) =>
            subscriber(XynChange.create(newValue, previousValue)),
          );
          return true;
        }
        return Reflect.set(target, prop, newValue);
      },
      apply(target, thisArg, args) {
        return Reflect.apply(target, thisArg, args);
      },
    },
  );

  return signalProxy;
}

/**
 * @function proxyFactory
 * @param {Object} obj
 * @param {Set<Function>} subscribers
 * @returns {Proxy | Number | String | Boolean | null | undefined | Symbol | BigInt }
 * @description Creates a proxy for the given object that notifies subscribers when the object changes.
 * @example
 * const obj = { a: 1, b: 2 };
 * const subscribers = new Set();
 * const proxy = proxyFactory(obj, subscribers);
 * proxy.a = 3; // Notifies subscribers
 * proxy.b = 4; // Notifies subscribers
 * proxy.c = 5; // Notifies subscribers
 * delete proxy.a; // Notifies subscribers
 * proxy.a = 6; // Notifies subscribers
 * proxy.a = 7; // Notifies subscribers
 */
function proxyFactory(value, subscribers) {
  if (value instanceof Map || value instanceof Set) {
    return createCollectionProxy(value, subscribers);
  } else if (Array.isArray(value)) {
    return createListProxy(value, subscribers);
  } else if (typeof value === "object" && value != null) {
    return createObjectProxy(value, subscribers);
  }
  return value;
}

function createCollectionProxy(collection, subscribers) {
  return new Proxy(collection, {
    get(target, prop) {
      console.debug(`Getting property ${prop} from collection`);
      const value = Reflect.get(target, prop);
      if (typeof value === "function") {
        return (...args) => {
          const prevDeleteValue =
            prop === "delete" ? Reflect.get(target, args[0]) : null;

          const result = value.apply(target, args);
          if (prop === "get") {
            return proxyFactory(result, subscribers);
          }
          if (prop === "set" || prop === "add") {
            subscribers.forEach((subscriber) => {
              subscriber(
                XynCollectionChange.create(
                  args[0],
                  args[1],
                  CollectionValue.INSERT,
                ),
              );
            });
          }
          if (prop === "delete") {
            subscribers.forEach((subscriber) => {
              subscriber(
                XynCollectionChange.create(
                  args[0],
                  CollectionValue.DELETE,
                  prevDeleteValue,
                ),
              );
            });
          }
          if (prop === "clear") {
            subscribers.forEach((subscriber) => {
              subscriber(
                XynCollectionChange.create(
                  CollectionValue.DELETE,
                  CollectionValue.DELETE,
                  CollectionValue.DELETE,
                ),
              );
            });
          }
          return result;
        };
      }

      if (typeof value === "object" && value !== null) {
        return proxyFactory(value, subscribers);
      }

      return value;
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(target);
    },
  });
}

function createListProxy(list, subscribers) {
  return new Proxy(list, {
    get(target, prop) {
      const value = Reflect.get(target, prop);
      if (typeof value === "function") {
        return (...args) => {
          const result = value.apply(target, args);
          const LAST_INDEX = Reflect.get(target, "length") - 1;

          if (prop === "push" || prop === "unshift") {
            subscribers.forEach((subscriber) =>
              subscriber(
                XynCollectionChange.create(
                  prop === "push" ? LAST_INDEX : 0,
                  args[0],
                  CollectionValue.INSERT,
                ),
              ),
            );
          }

          if (prop === "pop" || prop === "shift") {
            subscribers.forEach((subscriber) =>
              subscriber(
                XynCollectionChange.create(
                  prop === "pop" ? LAST_INDEX : 0,
                  CollectionValue.DELETE,
                  result,
                ),
              ),
            );
          }

          if (prop === "splice") {
            const [start, deleteCount, ...items] = args;
            subscribers.forEach((subscriber) =>
              subscriber(
                XynCollectionChange.create([start, deleteCount], items, result),
              ),
            );
          }

          return result;
        };
      }

      if (typeof value === "object" && value !== null) {
        return proxyFactory(value, subscribers);
      }

      return value;
    },
  });
}

function createObjectProxy(obj, subscribers) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        value = value();
      }

      if (typeof value === "object" && value !== null) {
        return proxyFactory(value, subscribers);
      }

      return value;
    },
    set(target, prop, newValue) {
      const previousValue = Reflect.get(target, prop);
      Reflect.set(target, prop, newValue);
      subscribers.forEach((subscriber) =>
        subscriber(XynCollectionChange.create(prop, newValue, previousValue)),
      );
      return true;
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
      return true;
    },
  });
}

function createObjectSignal(obj) {
  const subscribers = new Set();

  return {
    value: createObjectProxy(obj, subscribers),
    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}

function createListSignal(list) {
  const subscribers = new Set();

  return {
    value: createListProxy(list, subscribers),
    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}

function createCollectionSignal(collection) {
  const subscribers = new Set();

  return {
    value: createCollectionProxy(collection, subscribers),
    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}
