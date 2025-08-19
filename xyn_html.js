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

    static createRoot(XynTag, elementName) {
        const el = document.querySelector(elementName);

        if (el) {
            return () => el.appendChild(XynTag.render());
        }

        throw new Error(`Element "${elementName}" not found`);
    }

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
                registeredSubscribers.keys().forEach(subscriber => subscriber());
            },

            /**
             * @param {() => void} subscriber
             * @param {int} count @default 1
             * @returns {void}
             */
            subscribe(subscriber, count = 1) {
                if (typeof subscriber !== "function") {
                    return;
                }

                if (count === 1) {
                    subscriber();
                }

                if (!XynHTML.subscribers.has(subscriber)) {
                    XynHTML.subscribers.set(subscriber, 0);
                }

                XynHTML.subscribers.set(subscriber, XynHTML.subscribers.get(subscriber) + 1);

                registeredSubscribers.set(subscriber, () => {
                    XynHTML.subscribers.set(subscriber, XynHTML.subscribers.get(subscriber) - 1);

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
        let count = signals.length;
        for (const signal of signals) {
            signal.subscribe(fn, count--);
        }

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

        return [signal, XynHTML.effect(() => signal.value = fn(), signals)];
    }
}

class XynTag {
    name = "";
    props = null;
    children = null;
    #classes = "";
    #self = null;
    #update = true;
    /**
     * @template T extends XynHTML.signal
     * @param {string} name
     * @param {Map<string, T> | null} props
     * @param {XynTag[] | null} children
     */
    constructor(name, props = null, children = null) {
        this.name = name;
        this.props = props;
        this.children = children;
    }

    /**
     * @param {string[]} classes
     * @param {XynHTML.signal[]} conditions
     * @returns void
     * @example
     * XynTag().css`show ${show} alert ${alert}`
     */
    css(classes, ...conditions) {
        if (conditions.length === 0) {
            this.#classes = classes.join(" ");
        }

        this.#classes = classes.filter((c, i) => {
            const toggledClasses = [];

            if (conditions[i] != null) {
                const conditionClasses = c.split(" ");
                conditionClasses.forEach((cc) =>
                    toggledClasses.push([cc, conditions[i]]));
            }

            toggledClasses.forEach(([cc, condition]) => {
                effect(() => {
                    if (condition.value) {
                        this.#self.classList.add(cc);
                    } else {
                        this.#self.classList.remove(cc);
                    }
                }, [condition]);
            });

            return conditions[i] ?? true;
        }).join(" ");
    }

    /**
     * @returns {HTMLElement}
     */
    render() {
        if (this.#self) {
            if (!this.#update) {
                return this.#self;
            }

            for (const child of this.children) {
                child.render();
            }
        }

        this.#self = document.createElement(this.name);

        if (this.props) {
            this.props.forEach((key, prop) => {
                effect(() => {
                    this.#self.setAttribute(key, prop.value);
                }, [prop]);
            });
        }

        if (this.children) {
            for (const child of this.children) {
                this.#self.appendChild(child.render());
            }
        }

        if (this.#classes) {
            this.#self.className = this.#classes;
        }

        this.#update = false;

        return this.#self;
    }
}

class XynText {
    text = null;
    signals = null;
    el = document.createTextNode("");

    /**
     * @param {string[]} text
     * @param {XynHTML.signal[]} signals
     * @returns {XynText}
     * @example
     * XynText`Hello, ${name}!`
     */
    create(text, ...signals) {
        this.text = text;
        this.signals = signals;
        return this;
    }

    render() {
        effect(() => {
            let textContent = "";

            this.text.forEach((text, i) => {
                textContent += text + (this.signals[i]?.value ?? "");
            });

            this.el.textContent = textContent;
        }, this.signals);

        return this.el;
    }
}

/**
 * @export @alias {XynHTML}
 * @description XynHTML is a library for building web applications using a
 * declarative syntax. It is inspired by React and Vue, but with a focus on
 * simplicity and performance.
 * 
 * @example Basic usage with signals and effects:
 * import { signal, effect, XynTag, text } from "./xyn_html.js";
 * 
 * const counter = signal(0);
 * const increment = () => counter.value++;
 * 
 * const button = new XynTag("button");
 * button.children = [text`Count: ${counter}`];
 * 
 * const buttonElement = button.render();
 * buttonElement.onclick = increment;
 * document.body.appendChild(buttonElement);
 * 
 * @example Creating reactive components:
 * const message = signal("Hello");
 * const container = new XynTag("div");
 * const paragraph = new XynTag("p");
 * paragraph.children = [text`${message}`];
 * container.children = [paragraph];
 * document.body.appendChild(container.render());
 */
export default XynHTML;
/**
 * @export @alias {XynHTML.createRoot}
 */
export const createRoot = XynHTML.createRoot;
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
/**
 * @export @alias {XynTag}
 * @description XynTag is a class for creating HTML elements with signals.
 * @example Basic XynTag usage:
 * import { XynTag, signal, text } from "./xyn_html.js";
 * 
 * const show = signal(true);
 * const container = new XynTag("div");
 * const span = new XynTag("span");
 * span.children = [text`Hello World`];
 * container.children = [span];
 * 
 * // Apply conditional CSS classes
 * span.css`show ${show}`;
 * 
 * document.body.appendChild(container.render());
 * show.value = false; // Removes 'show' class
 */
export { XynTag }
/**
 * @export @alias {XynText}
 * @description XynText is a class for creating text nodes with signals.
 * @example Basic XynText usage:
 * import { signal, XynTag, text } from "./xyn_html.js";
 * 
 * const name = signal("World");
 * const container = new XynTag("div");
 * container.children = [text`Hello, ${name}!`];
 * 
 * document.body.appendChild(container.render());
 * name.value = "XynHTML"; // Updates text to "Hello, XynHTML!"
 */
export const text = (s, ...v) => new XynText().create(s, ...v);
