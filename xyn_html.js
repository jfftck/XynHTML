/**
 * @fileoverview XynHTML is a library for building web applications using a
 * declarative syntax. It is inspired by React and Vue, but with a focus on
 * simplicity and performance.
 */

class XynHTML {
    /**
     * @type {Map<Function, int>}
     */
    static subscribers = new Map();

    /**
     * @template T
     * @param {T} value
     * @returns {{ value: T, subscribe: (subscriber: Function) => string, unsubscribe: (subscriberId: string) => void }}
     */
    static signal(value) {
        /**
         * @type {Map<Function, Function>}
         */
        const registeredSubscribers = new Map();

        return {
            /**
             * @type {T}
             */
            get value() {
                return value;
            },

            set value(newValue) {
                if (newValue === value) {
                    return;
                }

                value = newValue;
                registeredSubscribers.forEach(subscriberId => XynHTML.subscribers.get(subscriberId)[1]());
            },

            /**
             * @param {() => void} subscriber
             * @returns {void}
             */
            subscribe(subscriber) {
                if (typeof subscriber !== "function") {
                    return;
                }

                if (!XynHTML.subscribers.has(subscriber)) {
                    XynHTML.subscribers.set(subscriber, 0);
                }

                XynHTML.subscribers.get(subscriber)++;

                registeredSubscribers.set(subscriber, () => {
                    XynHTML.subscribers.get(subscriber)--;

                    if (XynHTML.subscribers.get(subscriber) < 1) {
                        XynHTML.subscribers.delete(subscriber);
                    }

                    registeredSubscribers.delete(subscriber);
                });
            },

            /**
             * param {() => void} subscriber
             * @returns {void}
             */
            unsubscribe: (subscriber) => {
                if (typeof subscriber !== "function") {
                    return;
                }

                if (registeredSubscribers.has(subscriber)) {
                    registeredSubscribers.get(subscriber)();
                }
            },
        }
    }

    /**
     * @param {() => void} fn
     * @param {XynHTML.signal[]} signals
     * @returns {() => void} unsubscribe
     */
    static effect(fn, signals) {
        for (const signal of signals) {
            signal.subscribe(fn);
        }

        fn();

        return () => {
            signals?.forEach(signal => signal.unsubscribe(fn));
            signals = null;
            fn = null;
        };
    }

    /**
     * @template T
     * @param {() => T} fn
     * @param {XynHTML.signal[]} signals
     * @returns {[XynHTML.signal, () => void)]} signal and unsubscribe
     */
    static derived(fn, signals) {
        const signal = XynHTML.signal(fn());

        return [signal, XynHTML.effect(() => signal.value = fn(), [...signals, signal])];
    }
}

/**
 * @export @alias {XynHTML.signal}
 */
export const signal = XynHTML.signal;
/**
 * @export @alias {XynHTML.effect}
 */
export const effect = XynHTML.effect;
/**
 * @export @alias {XynHTML.derived}
 */
export const derived = XynHTML.derived;
