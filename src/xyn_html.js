/**
 * @fileoverview XynHTML is a library for building web applications using a
 * declarative syntax. It is inspired by React and Vue, but with a focus on
 * simplicity and performance.
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

class XynHTML {
    /**
     * @template T
     * @type {Map<() => void | (oldValue: T) => void, int>}
     */
    static subscribers = new Map();

    /**
     * @param {XynElement} xynElement
     * @param {string | HTMLElement} element
     * @returns {() => HTMLElement}
     * @description Creates a mount function for a given XynElement and element name.
     */
    static createMount(xynElement, element) {
        const el = element instanceof HTMLElement ? element : document.querySelector(element);

        if (el) {
            return () => el.appendChild(xynElement.render(el));
        }

        throw new Error(`Element "${el.tagName}" not found`);
    }

    /**
     * @param {XynElement} XynElement
     * @param {string | HTMLElement} element
     * @returns {() => HTMLElement}
     * @description Creates a root mount function for a given XynTag and element name.
     * This will clear the element before mounting the XynTag.
     */
    static createRoot(XynElement, element) {
        const el = element instanceof HTMLElement ? element : document.querySelector(element);

        if (el) {
            el.innerHTML = "";
        }

        return XynHTML.createMount(XynElement, el);
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

                const oldValue = value;
                value = newValue;
                registeredSubscribers.keys().forEach(subscriber => subscriber(oldValue));
            },

            /**
             * @param {() => void | (prevValue: T) => void} subscriber
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

                if (registeredSubscribers.has(subscriber)) {
                    return;
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
     * @returns {{unsubscribeDerived: () => void} extends XynHTML.signal} signal extended with unsubscribeDrived method
     */
    static derived(fn, signals) {
        const derivedSignal = XynHTML.signal(fn());

        return Object.assign(derivedSignal, { unsubscribeDerived: XynHTML.effect(() => derivedSignal.value = fn(), signals) });
    }
}

/**
 * @typedef {object} XynElement
 * @property {() => HTMLElement | (parent: HTMLElement) => HTMLElement} render
 */

/**
 * @class XynTag
 * @implements {XynElement}
 * @description XynTag is a class for creating HTML elements with signals.
 */
class XynTag {
    #name = "";
    /** @type {Map<string, XynHTML.signal<unknown>> | null} */
    props = null;
    /** @type {XynElement[] | null} */
    children = null;
    #classes = "";
    #self = null;
    #update = true;
    /**
     * @template T extends XynHTML.signal
     * @param {string} name
     * @param {Map<string, T> | null} props
     * @param {XynElement[] | null} children
     */
    constructor(name, props = null, children = null) {
        this.#name = name;
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

        if (!this.#update) {
            this.#self.className = this.#classes;
        }
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

        this.#self = document.createElement(this.#name);

        if (this.props) {
            this.props.forEach((key, prop) => {
                effect(() => {
                    this.#self.setAttribute(key, prop.value);
                }, [prop]);
            });
        }

        if (this.children) {
            for (const child of this.children) {
                this.#self.appendChild(child.render(this.#self));
            }
        }

        if (this.#classes) {
            this.#self.className = this.#classes;
        }

        this.#update = false;

        return this.#self;
    }
}

/**
 * @class XynText
 * @implements {XynElement}
 * @description XynText is a class for creating text nodes with signals.
 */
class XynText {
    text = null;
    signals = null;
    el = document.createTextNode("");

    /**
     * @param {TemplateStringArray} text
     * @param {...XynHTML.signal} signals
     * @returns {XynText}
     * @example
     * XynText`Hello, ${name}!`
     */
    create(text, ...signals) {
        this.text = text;
        this.signals = signals;
        return this;
    }

    /**
     * @returns {Text}
     * @example
     * XynText`Hello, ${name}!`.render(document.body)
     * @description
     * Renders the text node to the DOM. If the text node already exists, it will
     * be updated with the new text. If the text node does not exist, it will be
     * created and appended to the parent element.
     */
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
 * @class XynSwitch
 * @implements {XynElement}
 * @description XynSwitch is a class for creating switch cases with signals.
 */
class XynSwitch {
    /**
     * @type {XynHTML.signal<XynElement> | null}
     */
    #switchValue = null;
    /**
     * @type {Map<unknown, XynElement> | null}
     */
    valueMap = null;
    /**
     * @type {XynElement | null}
     */
    #defaultValue = null;

    /**
     * @param {XynHTML.signal} caseValue
     * @param {Map<unknown, XynElement>} valueMap
     * @param {XynElement} defaultValue
     */
    constructor(caseValue, valueMap, defaultValue = { render() { return document.createComment("Placeholder") } }) {
        this.#switchValue = derived(() => {
            return valueMap.get(caseValue.value)?.render() ?? this.#defaultValue.render();
        }, [caseValue]);
        this.valueMap = valueMap;
        this.#defaultValue = defaultValue;
    }

    /**
     * @param {HTMLElement} parent
     * @returns {HTMLElement}
     */
    render(parent) {
        effect((prevValue) => {
            if (prevValue != null) {
                parent.replaceChild(this.#switchValue.value, prevValue);
            }
        }, [this.#switchValue]);

        return this.#switchValue.value;
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
export const createMount = XynHTML.createMount;
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
 * @export @type {(s: TemplateStringArray, ...v: XynHTML.signal[]) => XynText})}
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
/**
 * @export @alias {XynSwitch}
 * @description XynSwitch is a class for creating switch cases with signals.
 * @example Basic XynSwitch usage:
 * import { signal, XynTag, XynSwitch } from "./xyn_html.js";
 * const value = signal(1);
 * const container = new XynTag("div");
 * const switchCase = new XynSwitch(value, new Map[[1, new XynTag("span", null, [text`Case 1`])], [2, new XynTag("span", null, [text`Case 2`])]]);
 * container.children = [switchCase];
 * document.body.appendChild(container.render());
 * value.value = 2; // Updates text to "Case 2"
 * value.value = 3; // Updates text to default case
 */
export { XynSwitch }
