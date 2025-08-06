/**
 * @fileoverview XynHTML is a library for building web applications using a
 * declarative syntax. It is inspired by React and Vue, but with a focus on
 * simplicity and performance.
 */

class XynHTML {
    /**
     * @type {Map<string, [int, Function]>}
     */
    static subscribers = new Map();
    /**
     * @type {string | null}
     */
    static subscriberId = null;

    /**
     * @returns {string} randomId
     */
    static randomId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    }

    /**
     * @template T
     * @param {T} value
     * @returns {{ value: T, subscribe: (subscriber: Function) => string, unsubscribe: (subscriberId: string) => void }}
     */
    static signal(value) {
        /**
         * @type {Set<string>}
         */
        const registeredSubscribers = new Set();

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
             * @returns {() => void)} unscribe
             */
            subscribe(subscriber) {
                if (typeof subscriber !== "function") {
                    return;
                }

                if (XynHTML.subscriberId === null) {
                    XynHTML.subscriberId = XynHTML.randomId();
                    registeredSubscribers.add(XynHTML.subscriberId);
                    XynHTML.subscribers.set(XynHTML.subscriberId, [0, subscriber]);
                }

                XynHTML.subscribers.get(XynHTML.subscriberId)[0]++;
                const subscriberId = XynHTML.subscriberId;

                return () => {
                    if (typeof subscriberId !== "string" || !registeredSubscribers.has(subscriberId)) {
                        return;
                    }

                    registeredSubscribers.delete(subscriberId);
                    XynHTML.subscribers.get(subscriberId)[0]--;

                    if (XynHTML.subscribers.get(subscriberId)[0] < 1) {
                        XynHTML.subscribers.delete(subscriberId);
                    }
                }
            }
        }
    }

    /**
     * @param {() => void} fn
     * @param {XynHTML.signal[]} signals
     * @returns {() => void} unsubscribe
     */
    static effect(fn, signals) {
        const unsubscribes = [];
        for (const signal of signals) {
            unsubscribes.push(signal.subscribe(fn));
        }

        fn();
        XynHTML.subscriberId = null;

        return () => unsubscribes.forEach(unsubscribe => unsubscribe());
    }

    /**
     * @template T
     * @param {() => T} fn
     * @param {XynHTML.signal[]} signals
     * @returns {[XynHTML.signal, () => void)]} signal and unsubscribe
     */
    static derived(fn, signals) {
        const signal = XynHTML.signal(fn());

        return [signal, XynHTML.effect(() => signal.value = fn(), signals)];
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
