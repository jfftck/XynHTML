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
 * @class Option
 * @template T
 * @property {Option} None
 * @property {function(value: T): Option} Some
 * @function get
 * @returns {T | Option}
 * @function map
 * @param {function(value: T): T} fn
 * @returns {Option}
 * @description Option is a class for creating optional values.
 * It is used to represent values that may or may not exist.
 * @example
 * const option = Option.Some(5);
 * const value = option.get(); // 5
 * const mapped = option.map((value) => value * 2); // Option.Some(10)
 * const none = Option.None;
 * const value = none.get(); // Option.None
 * const mapped = none.map((value) => value * 2); // Option.None
 * @see https://en.wikipedia.org/wiki/Option_type
 */
export class Option {
  static #none;
  static get None() {
    return this.#none ?? (this.#none = new None());
  }
  static Some(value) {
    return new Some(value);
  }
}

class None extends Option {
  get() {
    return this;
  }

  map(_) {
    return this;
  }
}

class Some extends Option {
  #value = null;

  constructor(value) {
    super();
    this.#value = value;
  }

  get() {
    return this.#value;
  }

  map(fn) {
    return Option.Some(fn(this.#value));
  }
}

/**
 * @template T
 * @param {T} value
 * @returns {{ value: T, get: () => T, set: (T) => void, subscribe: (subscriber: Function) => void } | { get: (key: string, defaultValue: any) => any, set: (key: string, value: any) => void, delete: (key: string) => void, subscribe: (subscriber: Function) => void} | { get: (index: number) => any, set: (index: number, value: any) => void, push: (...items: any[]) => void, pop: () => any, shift: () => any, unshift: (...items: any[]) => void, splice: (start: number, deleteCount: number, ...items: any[]) => any[], reverse: () => void, sort: (compareFn: Function) => void, fill: (value: any, start: number, end: number) => void, copyWithin: (target: number, start: number, end: number) => void, length: number, subscribe: (subscriber: Function) => void } | { get: (key: any) => any, set: (key: any, value: any) => void, delete: (key: any) => void, clear: () => void, subscribe: (subscriber: Function) }}
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
    if (value instanceof Map) {
      return createMapSignal(value);
    }
    if (value instanceof Set) {
      return createSetSignal(value);
    }
    if (Array.isArray(value)) {
      return createListSignal(value);
    }
    if (typeof value === "object" && value !== null) {
      return createObjectSignal(value);
    }
  }
  const subscribers = new Set();
  let sub = Option.None;

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
      get() {
        return this.value;
      },
      set(newValue) {
        this.value = newValue;
      },
      subscribe(subscriber) {
        sub = Option.Some(subscriber);
        subscriber();
        sub = Option.None;

        return () => subscribers.delete(subscriber);
      },
    },
    {
      get(target, prop) {
        sub.map((subscriber) => subscribers.add(subscriber));
        return Reflect.get(target, prop);
      },
      set(target, prop, newValue) {
        if (prop === "value") {
          Reflect.set(target, prop, newValue);

          subscribers.forEach((subscriber) => subscriber());

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
function proxyFactory(value, subscribers, sub) {
  if (value instanceof Map || value instanceof Set) {
    return createCollectionProxy(value, subscribers, sub);
  } else if (Array.isArray(value)) {
    return createListProxy(value, subscribers, sub);
  } else if (typeof value === "object" && value != null) {
    return createObjectProxy(value, subscribers, sub);
  } else if (typeof value === "symbol") {
    return String(value);
  }
  return value;
}

/**
 * Mutating methods for Map, Set, and Array.
 */
const COLLECTION_METHODS = ["set", "add", "delete", "clear"];
const LIST_METHODS = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "reverse",
  "sort",
  "fill",
  "copyWithin",
];

function createCollectionProxy(collection, subscribers, sub) {
  return new Proxy(collection, {
    get(target, prop) {
      sub.current.map((subscriber) => subscribers.add(subscriber));

      const value = Reflect.get(target, prop);

      if (typeof value === "function") {
        return (...args) => {
          const result = value.apply(target, args);

          if (prop === "get") {
            return proxyFactory(result, subscribers, sub);
          }
          if (COLLECTION_METHODS.includes(prop)) {
            subscribers.forEach((subscriber) => {
              subscriber();
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
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(target);
    },
  });
}

function createListProxy(list, subscribers, sub) {
  return new Proxy(list, {
    get(target, prop) {
      sub.current.map((subscriber) => subscribers.add(subscriber));

      const value = Reflect.get(target, prop);
      if (typeof value === "function") {
        return (...args) => {
          const result = value.apply(target, args);

          if (LIST_METHODS.includes(prop)) {
            subscribers.forEach((subscriber) => subscriber());
          }

          return result;
        };
      }

      const result =
        (prop !== "value" &&
          typeof value === "function" &&
          value.apply(target, prop)) ||
        value;

      if (typeof result === "object" && result !== null) {
        return proxyFactory(result, subscribers, sub);
      }

      return result;
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(target);
    },
  });
}

function createObjectProxy(obj, subscribers, sub) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        value = value();
      }

      sub.current.map((subscriber) => subscribers.add(subscriber));

      if (typeof value === "object" && value !== null) {
        return proxyFactory(value, subscribers, sub);
      }

      return value;
    },
    set(target, prop, newValue) {
      Reflect.set(target, prop, newValue);
      subscribers.forEach((subscriber) => subscriber());
      return true;
    },
    deleteProperty(target, prop) {
      if (typeof prop === "symbol") {
        prop = prop.description || prop.toString();
      }
      Reflect.deleteProperty(target, prop);
      subscribers.forEach((subscriber) => subscriber());
      return true;
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(target);
    },
  });
}

function createObjectSignal(obj) {
  const subscribers = new Set();
  let sub = { current: Option.None };
  const proxy = createObjectProxy(obj, subscribers, sub);

  return {
    get(key, defaultValue = null) {
      return proxy[key] ?? defaultValue;
    },
    set(key, value) {
      proxy[key] = value;
    },
    delete(key) {
      delete proxy[key];
    },
    get [Symbol.iterator]() {
      return proxy[Symbol.iterator];
    },
    get [Symbol.toStringTag]() {
      return proxy[Symbol.toStringTag];
    },
    get hasOwnProperty() {
      return proxy.hasOwnProperty;
    },
    get isPrototypeOf() {
      return proxy.isPrototypeOf;
    },
    get propertyIsEnumerable() {
      return proxy.propertyIsEnumerable;
    },
    get toLocaleString() {
      return proxy.toLocaleString;
    },
    get toString() {
      return proxy.toString;
    },
    get valueOf() {
      return proxy.valueOf;
    },
    get entries() {
      return () => Object.entries(proxy);
    },
    get keys() {
      return () => Object.keys(proxy);
    },
    get values() {
      return () => Object.values(proxy);
    },
    get forEach() {
      return (callback) => {
        Object.entries(proxy).forEach(([key, value]) => callback(value, key));
      };
    },
    get map() {
      return (callback) => {
        return Object.entries(proxy).reduce((acc, [key, value]) => {
          acc[key] = callback(value, key);
          return acc;
        }, {});
      };
    },
    get filter() {
      return (callback) => {
        return Object.entries(proxy).reduce((acc, [key, value]) => {
          if (callback(value, key)) {
            acc[key] = value;
          }
          return acc;
        }, {});
      };
    },
    get reduce() {
      return (callback, initialValue) => {
        return Object.entries(proxy).reduce((acc, [key, value]) => {
          return callback(acc, value, key);
        }, initialValue);
      };
    },
    get reduceRight() {
      return (callback, initialValue) => {
        return Object.entries(proxy).reduceRight((acc, [key, value]) => {
          return callback(acc, value, key);
        }, initialValue);
      };
    },
    groupBy(callback) {
      if (!Object.groupBy) {
        const groups = {};
        for (const value of proxy) {
          const groupName = callback(value);
          if (!Object.hasOwn(groups, groupName)) {
            groups[groupName] = [];
          }
          groups[groupName].push(value);
        }
        return groups;
      }
      return Object.groupBy(proxy, callback);
    },
    groupByToMap(callback) {
      if (!Map.groupBy) {
        const groups = new Map();
        for (const value of proxy) {
          const groupName = callback(value);
          if (!groups.has(groupName)) {
            groups.set(groupName, []);
          }
          groups.get(groupName).push(value);
        }
        return groups;
      }
      return Map.groupBy(proxy, callback);
    },
    subscribe(subscriber) {
      sub.current = Option.Some(subscriber);
      subscriber();
      sub.current = Option.None;

      return () => subscribers.delete(subscriber);
    },
  };
}

function createListSignal(list) {
  const subscribers = new Set();
  let sub = { current: Option.None };
  const proxy = createListProxy(list, subscribers, sub);

  return {
    get(index) {
      return proxy[index];
    },
    set(index, value) {
      proxy[index] = value;
    },
    push(...items) {
      proxy.push(...items);
    },
    pop() {
      return proxy.pop();
    },
    shift() {
      return proxy.shift();
    },
    unshift(...items) {
      proxy.unshift(...items);
    },
    splice(start, deleteCount, ...items) {
      return proxy.splice(start, deleteCount, ...items);
    },
    reverse() {
      proxy.reverse();
    },
    sort(compareFn) {
      proxy.sort(compareFn);
    },
    fill(value, start, end) {
      proxy.fill(value, start, end);
    },
    copyWithin(target, start, end) {
      proxy.copyWithin(target, start, end);
    },
    get entries() {
      return proxy.entries();
    },
    get keys() {
      return proxy.keys();
    },
    get values() {
      return proxy.values();
    },
    forEach(callback) {
      proxy.forEach(callback);
    },
    get map() {
      return proxy.map;
    },
    get filter() {
      return proxy.filter;
    },
    get reduce() {
      return proxy.reduce;
    },
    get reduceRight() {
      return proxy.reduceRight;
    },
    get every() {
      return proxy.every;
    },
    get some() {
      return proxy.some;
    },
    get find() {
      return proxy.find;
    },
    get findIndex() {
      return proxy.findIndex;
    },
    get includes() {
      return proxy.includes;
    },
    get indexOf() {
      return proxy.indexOf;
    },
    get lastIndexOf() {
      return proxy.lastIndexOf;
    },
    get join() {
      return proxy.join;
    },
    get slice() {
      return proxy.slice;
    },
    get concat() {
      return proxy.concat;
    },
    get flat() {
      return proxy.flat;
    },
    get flatMap() {
      return proxy.flatMap;
    },
    get toString() {
      return proxy.toString;
    },
    get toLocaleString() {
      return proxy.toLocaleString;
    },
    get toReversed() {
      return proxy.toReversed;
    },
    get toSorted() {
      return proxy.toSorted;
    },
    get toSpliced() {
      return proxy.toSpliced;
    },
    get at() {
      return proxy.at;
    },
    groupBy(callback) {
      if (!Object.groupBy) {
        const groups = {};
        for (const value of proxy) {
          const groupName = callback(value);
          if (!Object.hasOwn(groups, groupName)) {
            groups[groupName] = [];
          }
          groups[groupName].push(value);
        }
        return groups;
      }
      return Object.groupBy(proxy, callback);
    },
    groupByToMap(callback) {
      if (!Map.groupBy) {
        const groups = new Map();
        for (const value of proxy) {
          const groupName = callback(value);
          if (!groups.has(groupName)) {
            groups.set(groupName, []);
          }
          groups.get(groupName).push(value);
        }
        return groups;
      }
      return Map.groupBy(proxy, callback);
    },
    get [Symbol.unscopables]() {
      return proxy[Symbol.unscopables];
    },
    get length() {
      return proxy.length;
    },
    set length(value) {
      proxy.length = value;
    },
    get [Symbol.iterator]() {
      return proxy[Symbol.iterator];
    },
    get [Symbol.toStringTag]() {
      return proxy[Symbol.toStringTag];
    },
    subscribe(subscriber) {
      sub.current = Option.Some(subscriber);
      subscriber();
      sub.current = Option.None;

      return () => subscribers.delete(subscriber);
    },
  };
}

function createSetSignal(set) {
  const subscribers = new Set();
  let sub = { current: Option.None };
  const proxy = createCollectionProxy(set, subscribers, sub);

  return {
    add(value) {
      proxy.add(value);
    },
    delete(value) {
      proxy.delete(value);
    },
    has(value) {
      return proxy.has(value);
    },
    clear() {
      proxy.clear();
    },
    get size() {
      return proxy.size;
    },
    get entries() {
      return proxy.entries;
    },
    get keys() {
      return proxy.keys;
    },
    get values() {
      return proxy.values;
    },
    forEach(callback) {
      proxy.forEach(callback);
    },
    get difference() {
      return proxy.difference;
    },
    get intersection() {
      return proxy.intersection;
    },
    get isDisjointFrom() {
      return proxy.isDisjointFrom;
    },
    get isSubsetOf() {
      return proxy.isSubsetOf;
    },
    get isSupersetOf() {
      return proxy.isSupersetOf;
    },
    get symmetricDifference() {
      return proxy.symmetricDifference;
    },
    get union() {
      return proxy.union;
    },
    groupBy(callback) {
      if (!Object.groupBy) {
        const groups = {};
        for (const value of proxy) {
          const groupName = callback(value);
          if (!Object.hasOwn(groups, groupName)) {
            groups[groupName] = [];
          }
          groups[groupName].push(value);
        }
        return groups;
      }

      return Object.groupBy(proxy, callback);
    },
    groupByToMap(callback) {
      if (!Map.groupBy) {
        const groups = new Map();
        for (const value of proxy) {
          const groupName = callback(value);
          if (!groups.has(groupName)) {
            groups.set(groupName, []);
          }
          groups.get(groupName).push(value);
        }
        return groups;
      }

      return Map.groupBy(proxy, callback);
    },
    get [Symbol.iterator]() {
      return proxy[Symbol.iterator];
    },
    get [Symbol.toStringTag]() {
      return proxy[Symbol.toStringTag];
    },
    subscribe(subscriber) {
      sub.current = Option.Some(subscriber);
      subscriber();
    },
  };
}

function createMapSignal(map) {
  const subscribers = new Set();
  let sub = { current: Option.None };
  const proxy = createCollectionProxy(map, subscribers, sub);

  return {
    get(key) {
      return proxy.get(key);
    },
    set(key, value) {
      proxy.set(key, value);
    },
    delete(key) {
      proxy.delete(key);
    },
    has(key) {
      return proxy.has(key);
    },
    get size() {
      return proxy.size;
    },
    get entries() {
      return proxy.entries;
    },
    get keys() {
      return proxy.keys;
    },
    get values() {
      return proxy.values;
    },
    forEach(callback) {
      proxy.forEach(callback);
    },
    groupBy(callback) {
      if (!Object.groupBy) {
        const groups = {};
        for (const value of proxy) {
          const groupName = callback(value);
          if (!Object.hasOwn(groups, groupName)) {
            groups[groupName] = [];
          }
          groups[groupName].push(value);
        }
        return groups;
      }
      return Object.groupBy(proxy, callback);
    },
    groupByToMap(callback) {
      if (!Map.groupBy) {
        const groups = new Map();
        for (const value of proxy) {
          const groupName = callback(value);
          if (!groups.has(groupName)) {
            groups.set(groupName, []);
          }
          groups.get(groupName).push(value);
        }
        return groups;
      }
      return Map.groupBy(proxy, callback);
    },
    get getOrInsert() {
      return proxy.getOrInsert;
    },
    get getOrInsertComputed() {
      return proxy.getOrInsertComputed;
    },
    get [Symbol.iterator]() {
      return proxy[Symbol.iterator];
    },
    get [Symbol.toStringTag]() {
      return proxy[Symbol.toStringTag];
    },
    clear() {
      proxy.clear();
    },
    subscribe(subscriber) {
      sub.current = Option.Some(subscriber);
      subscriber();
      sub.current = Option.None;

      return () => subscribers.delete(subscriber);
    },
  };
}

/**
 * @typedef {Object} Watch
 * @property {function(Object): Watch} watch
 * @property {function(function({value: any, previousValue: any}): void): function(): void} effect
 * @property {function(function(...any): any): {signal: Object, unsubscribe: function(): void}} derived
 */

/**
 * @function watch
 * @param {Object} signal
 * @returns {Watch}
 * @description Watches the given signal and returns an object with methods to watch other signals and create effects.
 * The effect method takes a subscriber function and returns a function to unsubscribe.
 * The derived method takes a function and returns a signal and a function to unsubscribe.
 * @example
 * const signal = createSignal(0);
 * const signal2 = createSignal(1);
 * const unsubscribe = watch(signal)
 * .watch(signal2)
 * .effect(({value, previousValue}) => console.log(`Value changed from ${previousValue} to ${value}`));
 */
export function watch(signal) {
  const signals = new Set();

  const watchers = (sig) => {
    if (sig && typeof sig.subscribe === "function") {
      signals.add(sig);
    }
    return {
      watch(s) {
        return watchers(s);
      },
      effect(subscriber) {
        const unsubscribers = Array.from(signals.keys()).map((s) =>
          s.subscribe(subscriber),
        );

        return () => {
          unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
      },
      derived(fn, wrappingFn = (fn) => (change) => fn(change)) {
        const derivedSignal = createSignal(fn());
        const unsubscribers = Array.from(signals.keys()).map((s) =>
          s.subscribe(
            wrappingFn((change) => {
              derivedSignal.value = fn(change);
            }),
          ),
        );

        return {
          signal: derivedSignal,
          unsubscribe: () =>
            unsubscribers.forEach((unsubscribe) => unsubscribe()),
        };
      },
    };
  };

  return watchers(signal);
}

/**
 * @typedef {Object} Timing
 * @property {function(function(...any): void): function(...any): void} debounce
 * @property {function(function(...any): void): function(...any): void} throttle
 * @property {function(function(...any): void): function(...any): void} delay
 * @description Timing is an object with methods to debounce, throttle, and delay functions.
 */

/**
 * @function timing
 * @param {int} delay
 * @returns {Timing}
 * @description Returns an object with methods to debounce, throttle, and delay functions.
 * The debounce method takes a function and returns a function that will only call the given function after the given delay.
 * The throttle method takes a function and returns a function that will only call the given function once per delay.
 * The delay method takes a function and returns a function that will call the given function after the given delay.
 * @example
 * const debounced = timing(100).debounce(() => console.log("debounced"));
 * const throttled = timing(100).throttle(() => console.log("throttled"));
 * const delayed = timing(100).delay(() => console.log("delayed"));
 * debounced(); // Will log "debounced" after 100ms
 * throttled(); // Will log "throttled" immediately
 * throttled(); // Will not log "throttled" again until 100ms have passed
 * delayed(); // Will log "delayed" after 100ms
 * debounced(); // Will not log "debounced" again until 100ms have passed
 */
export function timing(delay) {
  return {
    debounce(fn) {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(fn, delay, ...args);
      };
    },
    throttle(fn) {
      let lastCall = 0;
      return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          fn(...args);
        }
      };
    },
    delay(fn) {
      return (...args) => {
        setTimeout(fn, delay, ...args);
      };
    },
  };
}
