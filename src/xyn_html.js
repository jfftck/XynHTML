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

/**
 * @type {() => void}
 * @description A no-op function.
 * @returns {void}
 */
const NoOp = () => { };
/**
 * @template T
 * @type {Map<() => void | (oldValue: T) => void, int>}
 */
const subscribers = new Map();

/**
 * @typedef {object} XynElement
 * @property {(() => HTMLElement | (parent: HTMLElement) => HTMLElement)} render
 */
/**
 * @typedef Unsubscribe
 * @type {() => void}
 */

/**
 * @class XynCSS
 * @description XynCSS is a class for applying CSS classes and styles to HTML elements with signals.
 * @example
 * const el = document.createElement("div");
 * const css = new XynCSS(el);
 * const show = signal(true);
 * css.classes`show ${show}`;
 * css.styles({ color: signal("red") });
 * document.body.appendChild(el);
 * show.value = false; // Removes 'show' class
 */
class XynCSS {
    /**
     * @type {?HTMLElement}
     */
    #el = null;

    /**
     * @type {?Unsubscribe}
     */
    #unsubscribeClasses = null;

    /**
     * @type {?Unsubscribe}
     */
    #unsubscribeStyles = null;

    /**
     * @param {HTMLElement} el
     * @returns {XynCSS}
     */
    constructor(el) {
        this.#el = el;
    }

    classes(classes, ...conditions) {
        if (this.#unsubscribeClasses) {
            this.#unsubscribeClasses();
            this.#unsubscribeClasses = null;
        }

        /**
         * @type {Unsubscribe[]}
         */
        const unsubscribers = [];
        this.#el.className = classes.filter((c, i) => {
            const toggledClasses = [];

            if (conditions[i] != null) {
                const conditionClasses = c.split(" ");
                conditionClasses.forEach((cc) =>
                    toggledClasses.push([cc, conditions[i]]));
            }

            toggledClasses.forEach(([cc, condition]) => {
                unsubscribers.push(effect(() => {
                    if (condition.value) {
                        this.#el?.classList.add(cc);
                    } else {
                        this.#el?.classList.remove(cc);
                    }
                }, [condition]));
            });

            this.#unsubscribeClasses = () => unsubscribers.forEach(unsubscribe => unsubscribe());

            return conditions[i] ?? true;
        }).join(" ");
    }

    /**
     * @param {Object.<string, (string | XynHTML.signal)>} styles
     */
    styles(styles) {
        if (this.#unsubscribeStyles) {
            this.#unsubscribeStyles();
            this.#unsubscribeStyles = null;
        }

        /**
         * @type {Unsubscribe[]}
         */
        const unsubscribers = [];
        Object.entries(styles).forEach(([s, v]) => {
            unsubscribers.push(effect(() => {
                this.#el.style[s] = typeof v !== "string" ? v?.value : v;
            }, [conditions[i]]));
        });

        this.#unsubscribeStyles = () => unsubscribers.forEach(unsubscribe => unsubscribe());
    }
}

/**
 * @class XynAttributes
 * @description XynAttributes is a class for applying attributes to HTML elements with signals.
 * @example
 * const el = document.createElement("div");
 * const attributes = new XynAttributes(el);
 * const id = signal(1);
 * attributes.set("data-id", id);
 * document.body.appendChild(el);
 * id.value = 2; // Updates 'data-id' attribute
 */
class XynAttributes {
    /**
     * @type {?HTMLElement}
     */
    #el = null;
    /**
     * @type {Map<string, Unsubscribe>}
     */
    #unsubscribe = new Map();

    /**
     * @param {HTMLElement} el
     * @returns {void}
     */
    constructor(el) {
        this.#el = el;
    }

    /**
     * @param {string} name
     * @returns {any}
     */
    get(name) {
        return this.#el.getAttribute(name);
    }

    /**
     * @param {string} name
     * @param {string | XynHTML.signal} value
     * @returns {void}
     */
    set(name, value) {
        if (this.#unsubscribe.has(name)) {
            this.#unsubscribe.get(name)();
            this.#unsubscribe.delete(name);
        }

        if (typeof value !== "string" && Object.hasOwn(value, "value") && Object.hasOwn(value, "subscribe")) {
            this.#unsubscribe.set(name, effect(() => {
                this.#el.setAttribute(name, value.value);
            }, [value]));
            
            return;
        }
        
        this.#el.setAttribute(name, value);
    }
}

/**
 * @class XynFragment
 * @implements {XynElement}
 * @description XynFragment is a class for creating document fragments with signals.
 * @example
 * const fragment = new XynFragment([text`Hello, ${name}!`]);
 * document.body.appendChild(fragment.render());
 * name.value = "XynHTML"; // Updates text to "Hello, XynHTML!"
 * fragment.add(text`Welcome to XynHTML!`);
 * document.body.appendChild(fragment.render());
 * name.value = "World"; // Updates text to "Hello, World!"
 * fragment.render(); // Renders the fragment to the DOM
 * fragment.render(); // Does nothing, fragment is already rendered
 * fragment.render(document.body); // Renders the fragment to the DOM again
 * fragment.render(document.body); // Does nothing, fragment is already rendered
 */
class XynFragment {
    /**
     * @type {XynElement[]}
     */
    #children = [];
    /**
     * @type {!DocumentFragment}
     */
    #fragment = null;
    /**
     * @type {boolean}
     */
    #isRendered = false;

    /**
     * @param {XynElement[]} children
     */
    constructor(children) {
        this.#fragment = document.createDocumentFragment();
        if (children) {
            this.#children = children;
        }
    }

    /**
     * @param {XynElement} child
     * @returns {void}
     * @description Adds a child to the end of the fragment.
     */
    add(...child) {
        this.#children.push(...child);
    }

    /**
     * @returns {void}
     * @description Clears the fragment and removes all children.
     */
    clear() {
        this.#children.forEach(child => this.#fragment.removeChild(child));
        this.#children.splice(0, this.#children.length);
    }

    /**
     * @param {XynElement} child
     * @param {int} index
     * @returns {void}
     * @description Inserts a child at the specified index, defaults to the beginning.
     */
    insert(child, index = 0) {
        this.#children.splice(index, 0, child);
        this.#fragment.insertBefore(child.render(), this.#fragment.childNodes[index]);
    }

    /**
     * @param {XynElement} child
     * @returns {void}
     * @description Removes a child from the fragment.
     */
    remove(child) {
        const c = (this.#children.splice(this.#children.indexOf(child), 1))[0].render();
        this.#fragment.removeChild(c);
    }

    /**
     * @param {?HTMLElement} parent
     * @returns {DocumentFragment}
     */
    render(parent = null) {
        for (const child of this.#children) {
            this.#fragment.appendChild(child.render());
        }

        if (parent && !this.#isRendered) {
            parent.appendChild(this.#fragment);
            this.#isRendered = true;
        }

        return this.#fragment;
    }
}

class XynEvent {
    /**
     * @type {!HTMLElement}
     */
    #el = null;
    /**
     * @type {!string}
     */
    #eventName = null;
    /**
     * @type {!function(): void}
     */
    #func = null;
    /**
     * @type {boolean}
     */
    #isOn = false;
    
    /**
     * @param {HTMLElement} el
     * @param {string} eventName
     * @param {function(): void} func
     */
    constructor(el, eventName, func) {
        this.#el = el;
        this.#eventName = eventName;
        this.#func = func;

        this.on();
    }

    /**
     * @returns {void}
     */
    on() {
        if (this.#isOn) {
            return;
        }
        
        this.#el.addEventListener(this.#eventName, this.#func);
        this.#isOn = true;
    }

    /**
     * @returns {void}
     */
    off() {
        this.#el.removeEventListener(this.#eventName, this.#func);
        this.#isOn = false;
    }

    /**
     * @returns {void}
     */
    toggle() {
        this.#isOn ? this.off() : this.on();
    }

    /**
     * @param {XynHTML.signal<boolean>} watched
     * @returns {void}
     */
    watch(watched) {
        effect(() => watched.value ? this.on() : this.off(), [watched]);
    }
}

/**
 * @class XynTag
 * @implements {XynElement}
 * @description XynTag is a class for creating HTML elements with signals.
 */
class XynTag {
    /** @type {?XynAttributes} */
    #attributes = null;
    /** @type {?XynFragment} */
    #children = null;
    /** @type {?XynCSS} */
    #css = null;
    /** @type {?HTMLElement} */
    #self = null;
    /**
     * @param {string} name
     * @param {?XynFragment} children
     * returns {XynTag}
     */
    constructor(name, children = null) {
        this.#self = document.createElement(name);
        this.#children = children;
    }

    /**
     * @readonly
     * @type {XynAttributes}
     * @example
     * XynTag().attributes.set("data-id", id)
     */
    get attributes() {
        if (!this.#attributes) {
            this.#attributes = new XynAttributes(this.#self);
        }

        return this.#attributes;
    }

    get children() {
        if (!this.#children) {
            this.#children = new XynFragment();
        }

        return this.#children;
    }

    /**
     * @readonly
     * @type {XynCSS}
     * @example
     * XynTag().css.classes`show ${show} alert ${alert}`
     */
    get css() {
        if (!this.#css) {
            this.#css = new XynCSS(this.#self);
        }

        return this.#css;
    }

    /**
     * @method event
     * @param {string} eventName
     * @param {function(): void} func
     * @returns {function(): void}
     * @description Adds an event listener to the element. Returns a function to remove the event listener.
     * @example
     * const event = XynTag().event("click", () => console.log("clicked"));
     * event.off(); // Removes the event listener
     * event.on(); // Adds the event listener back
     * event.toggle(); // Toggles the event listener
     * event.watch(show); // Watches a signal and toggles the event listener based on the signal's value
     */
    event(eventName, func) {
        return new XynEvent(this.#self, eventName, func);
    }

    /**
     * @returns {HTMLElement}
     */
    render() {
        if (this.#children) {
            this.#children.render(this.#self);
        }

        return this.#self;
    }
}

/**
 * @class XynText
 * @implements {XynElement}
 * @description XynText is a class for creating text nodes with signals.
 */
class XynText {
    /**
     * @type {?TemplateStringArray}
     */
    text = null;
    /**
     * @type {?XynHTML.signal[]}
     */
    signals = null;
    /**
     * @type {TextNode}
     */
    #el = document.createTextNode("");

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
     * XynText`Hello, ${name}!`.render()
     * @description
     * Renders the text node to the DOM. If the text node already exists, it will
     * be updated with the new text. If the text node does not exist, it will be
     * created and appended to the parent element.
     */
    render() {
        effect(() => this.#el.textContent = this.text.map(
                   (text, i) => text + (this.signals[i]?.value ?? "")
               ).join(""), this.signals);

        return this.#el;
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
            if (parent && prevValue != null) {
                parent.replaceChild(this.#switchValue.value, prevValue);
            }
        }, [this.#switchValue]);

        return this.#switchValue.value;
    }
}

/**
 * @class XynHTML
 * @description XynHTML is a library for building web applications using a
 * declarative syntax. It is inspired by React and Vue, but with a focus on
 * simplicity and performance.
 * @example
 * import { XynHTML, XynTag, text } from "./xyn_html.js";
 *  const counter = XynHTML.signal(0);
 *  const increment = () => counter.value++;
 *  const button = new XynTag("button");
 *  button.children = [text`Count: ${counter}`];
 *  const buttonElement = button.render();
 *  buttonElement.onclick = increment;
 *  document.body.appendChild(buttonElement);
 */
class XynHTML {
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

                if (!subscribers.has(subscriber)) {
                    subscribers.set(subscriber, 0);
                }

                subscribers.set(subscriber, subscribers.get(subscriber) + 1);

                registeredSubscribers.set(subscriber, () => {
                    subscribers.set(subscriber, subscribers.get(subscriber) - 1);

                    if (subscribers.get(subscriber) < 1) {
                        subscribers.delete(subscriber);
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
     * @returns {Unsubscribe} unsubscribe
     */
    static effect(fn, signals) {
        let count = signals.length;

        if (count < 1) {
            fn();
            return NoOp;
        }

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

    /**
     * @alias XynTag
     */
    static XynTag = XynTag;
    /**
     * @alias XynText
     * @param {TemplateStringArray} s
     * @param {...XynHTML.signal} v
     * @returns {XynText}
     * @description XynText is a class for creating text nodes with signals.
     * @example
     * XynText`Hello, ${name}!`
     */
    static text = (s, ...v) => new XynText().create(s, ...v);
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
 * @export @alias {XynHTML.createMount}
 */
export const createMount = XynHTML.createMount;
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
 * @export @alias {XynFragment}
 * @description XynFragment is a class for creating document fragments with signals.
 * @example Basic XynFragment usage:
 * import { XynFragment, signal, text } from "./xyn_html.js";
 * const name = signal("World");
 * const fragment = new XynFragment([text`Hello, ${name}!`]);
 * document.body.appendChild(fragment.render());
 * name.value = "XynHTML"; // Updates text to "Hello, XynHTML!"
 * fragment.add(text`Welcome to XynHTML!`);
 * document.body.appendChild(fragment.render());
 * name.value = "World"; // Updates text to "Hello, World!"
 * fragment.render(); // Renders the fragment to the DOM
 * fragment.render(); // Does nothing, fragment is already rendered
 * fragment.render(document.body); // Renders the fragment to the DOM again
 * fragment.render(document.body); // Does nothing, fragment is already rendered
 */
export { XynFragment };
/**
 * @export @alias {XynFragment}
 * @description fragment is a function for creating document fragments with signals.
 * @param {...XynElement} children
 * @returns {XynFragment}
 * @example fragment(text`Hello, ${name}!`)
 */
export const fragment = (...children) => new XynFragment(children);
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
export { XynTag };
/**
 * @export @alias {XynTag}
 * @description t is a function for creating HTML elements with signals.
 * @param {TemplateStringArry} t
 * @param {...XynHTML.signal} _
 * @returns {XynTag}
 * @example t`div`
 */
export const t = (t) => new XynTag(t[0]);
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
export const text = XynHTML.text;
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
