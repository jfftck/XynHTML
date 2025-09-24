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
 * @type {Map<function([T]): void, int>}
 */
const subscribers = new Map();

/**
 * @function uuidv4
 * @returns {string}
 */
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

/**
 * @class XynElement
 * @property {(() => HTMLElement | (parent: HTMLElement) => HTMLElement)} render
 */
class XynElement {
    render() {
        throw new Error("Method 'render()' must be implemented.");
    }
}

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
 * const color = signal("red");
 * css.classes`show ${show}`;
 * css.styles({ color });
 * document.body.appendChild(el);
 * color.value = "blue"; // Updates 'color' style
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

    /**
     * @param {TemplateStringArray} classes
     * @param {...XynSignal<(boolean | string)>} conditions
     * @returns {void}
     * @description Applies CSS classes to the element based on conditions.
     * @example
     * const el = document.createElement("div");
     * const css = new XynCSS(el);
     * const show = signal(true);
     * css.classes`show ${show}`;
     * document.body.appendChild(el);
     * show.value = false; // Removes 'show' class
     */
    classes(classes, ...conditions) {
        if (this.#unsubscribeClasses) {
            this.#unsubscribeClasses();
            this.#unsubscribeClasses = null;
        }

        /**
         * @type {Unsubscribe[]}
         */
        const unsubscribers = [];
        const addionalClasses = [];
        this.#el.className = classes.filter((c, i) => {
            const toggledClasses = [];

            switch (typeof conditions[i]?.value) {
                case "boolean":
                    const conditionClasses = c.trim().split(" ");
                    conditionClasses.forEach((cc) =>
                        toggledClasses.push([cc, conditions[i]]));

                    toggledClasses.forEach(([cc, condition]) => {
                        unsubscribers.push(effect(() => {
                            if (condition.value) {
                                this.#el?.classList.add(cc);
                            } else {
                                this.#el?.classList.remove(cc);
                            }
                        }, [condition]));
                    });

                    return conditions[i] ?? true;
                case "string":
                    unsubscribers.push(effect((preValue) => {
                        this.#el.classList.remove(preValue);
                        this.#el.classList.add(conditions[i].value);
                    }, [conditions[i]]));
                    addionalClasses.push(conditions[i].value);
                default:
                    if (c.trim() === "") {
                        return false;
                    }

                    return true;
            }

        }).join(" ") + " " + addionalClasses.join(" ").trim();
        this.#unsubscribeClasses = () => unsubscribers.forEach(unsubscribe => unsubscribe());
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
            if (v instanceof XynSignal) {
                unsubscribers.push(effect(() => {
                    this.#el.style[s] = v.value;
                }, [v]));

                return;
            }

            this.#el.style[s] = v;
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
class XynFragment extends XynElement {
    /**
     * @type {XynElement[]}
     */
    #children = [];
    /**
     * @type {!DocumentFragment}
     */
    #fragment = null;

    /**
     * @param {XynElement[]} children
     */
    constructor(children) {
        super();
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
        this.#children.replaceChildren();
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
     * @overrides
     * @param {?HTMLElement} parent
     * @returns {DocumentFragment}
     */
    render() {
        for (const child of this.#children) {
            this.#fragment.appendChild(child.render());
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
     * @type {?(Object | boolean)}
     */
    #options = null;
    /**
     * @type {boolean}
     */
    #isOn = false;

    /**
     * @param {HTMLElement} el
     * @param {string} eventName
     * @param {function(): void} func
     * @param {?(Object | boolean)} options
     * @returns {XynEvent}
     */
    constructor(el, eventName, func, options) {
        this.#el = el;
        this.#eventName = eventName;
        this.#func = func;
        this.#options = options;

        this.on();
    }

    /**
     * @returns {void}
     */
    on() {
        if (this.#isOn) {
            return;
        }

        this.#el.addEventListener(this.#eventName, this.#func, this.#options);
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
class XynTag extends XynElement {
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
     * @param {...(XynElement | Object.<string, any>)} childrenOrAttributes
     * returns {XynTag}
     */
    constructor(name, ...childrenOrAttributes) {
        super();
        this.#self = document.createElement(name);
        if (childrenOrAttributes.length > 0) {
            for (const childOrAttribute of childrenOrAttributes) {
                if (childOrAttribute instanceof XynElement) {
                    this.children.add(childOrAttribute);
                } else if (typeof childOrAttribute === "object" && !Array.isArray(childOrAttribute)) {
                    for (const [key, value] of Object.entries(childOrAttribute)) {
                        this.attributes.set(key, value);
                    }
                } else {
                    console.warn("Invalid child or attribute:", childOrAttribute);
                }
            }
        }
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
     * @param {?(Object | boolean)} options
     * @returns {function(): void}
     * @description Adds an event listener to the element. Returns a function to remove the event listener.
     * @example
     * const event = XynTag().event("click", () => console.log("clicked"));
     * event.off(); // Removes the event listener
     * event.on(); // Adds the event listener back
     * event.toggle(); // Toggles the event listener
     * event.watch(show); // Watches a signal and toggles the event listener based on the signal's value
     */
    event(eventName, func, options) {
        return new XynEvent(this.#self, eventName, func, options);
    }

    /**
     * @overrides
     * @returns {HTMLElement}
     */
    render() {
        if (this.#children) {
            this.#self.appendChild(this.#children.render());
        }

        return this.#self;
    }
}

/**
 * @class XynText
 * @implements {XynElement}
 * @description XynText is a class for creating text nodes with signals.
 */
class XynText extends XynElement {
    /**
     * @type {?TemplateStringArray}
     */
    #text = null;
    /**
     * @type {?XynHTML.signal[]}
     */
    #signals = null;
    /**
     * @type {TextNode}
     */
    #el = document.createTextNode("");

    /**
     * @param {TemplateStringArray | string} text
     * @param {...XynHTML.signal} signals
     * @returns {XynText}
     * @example
     * XynText`Hello, ${name}!`
     */
    create(text, ...signals) {
        this.#text = text;
        this.#signals = signals;
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
        if (typeof this.#text === "string") {
            this.#el.textContent = this.#text;
            return this.#el;
        }

        effect(() => this.#el.textContent = this.#text.map(
            (text, i) => text + (this.#signals[i]?.value ?? "")
        ).join(""), this.#signals);

        return this.#el;
    }
}

/**
 * @class XynSwitch
 * @implements {XynElement}
 * @description XynSwitch is a class for creating switch cases with signals.
 */
class XynSwitch extends XynElement {
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
    constructor(caseValue, valueMap, defaultValue = null) {
        super();
        if (defaultValue == null) {
            defaultValue = {
                id: uuidv4(),
                render() {
                    return document.createComment(`Placeholder ${this.id}`);
                }
            };
        }
        this.#switchValue = derived(() => {
            return (valueMap.get(caseValue.value) ?? this.#defaultValue).render();
        }, [caseValue]);
        this.valueMap = valueMap;
        this.#defaultValue = defaultValue;
    }

    /**
     * @param {HTMLElement} parent
     * @returns {HTMLElement}
     */
    render() {
        effect((prevValue) => {
            if (prevValue != null) {
                prevValue.parentElement.replaceChild(this.#switchValue.value, prevValue);
            }
        }, [this.#switchValue]);

        return this.#switchValue.value;
    }
}

/**
 * @class XynSignal
 * @description XynSignal is a class for creating signals with subscribers.
 * @template T
 * @param {T} value
 * @returns {XynSignal}
 * @example
 * const counter = new XynSignal(0);
 * const logCounter = () => console.log(counter.value);
 * counter.subscribe(logCounter);
 * counter.value = 1; // Logs 1
 * counter.value = 2; // Logs 2
 * counter.unsubscribe(logCounter);
 * counter.value = 3; // Does nothing
 * counter.subscribe(logCounter);
 * counter.value = 4; // Logs 4
 */
class XynSignal {
    /**
     * @template T
     * @type {?T}
     */
    #value = null;
    /**
     * @type {Map<Function, Function>}
     */
    #registeredSubscribers = new Map();
    /**
     * @param {any} value
     */
    constructor(value) {
        this.#value = value;
    }

    /**
     * @template T
     * @type {?T}
     */
    get value() {
        return this.#value;
    }

    set value(newValue) {
        if (newValue === this.#value) {
            return;
        }

        const oldValue = this.#value;
        this.#value = newValue;
        this.#registeredSubscribers.keys().forEach(subscriber => subscriber(oldValue));
    }

    /**
     * @template T
     * @method subscribe
     * @param {function([T]): void} subscriber
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

        if (this.#registeredSubscribers.has(subscriber)) {
            return;
        }

        if (!subscribers.has(subscriber)) {
            subscribers.set(subscriber, 0);
        }

        subscribers.set(subscriber, subscribers.get(subscriber) + 1);
        this.#registeredSubscribers.set(subscriber, () => {
            subscribers.set(subscriber, subscribers.get(subscriber) - 1);

            if (subscribers.get(subscriber) < 1) {
                subscribers.delete(subscriber);
            }

            this.#registeredSubscribers.delete(subscriber);
        });
    }

    /**
     * param {function(): void} subscriber
     * @returns {void}
     */
    unsubscribe(subscriber) {
        if (typeof subscriber !== "function") {
            return;
        }

        if (this.#registeredSubscribers.has(subscriber)) {
            this.#registeredSubscribers.get(subscriber)();
        }
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
     * @returns {void}
     * @description Creates a mount function for a given XynElement and element name.
     */
    static mountNext(xynElement, element) {
        const el = element instanceof HTMLElement ? element : document.querySelector(element);

        if (el) {
            el.appendChild(xynElement.render(el));

            return;
        }

        throw new Error(`Element with query of "${element}" not found`);
    }

    /**
     * @param {XynElement} xynElement
     * @param {string | HTMLElement} element
     * @returns {void}
     * @description Creates a root mount function for a given XynTag and element name.
     * This will clear the element before mounting the XynTag.
     */
    static mountRoot(xynElement, element) {
        const el = element instanceof HTMLElement ? element : document.querySelector(element);

        if (el) {
            el.innerHTML = "";
        }

        return XynHTML.mountNext(xynElement, el);
    }

    /**
     * @template T
     * @param {T} value
     * @returns {{ value: T, subscribe: (subscriber: Function) => string, unsubscribe: (subscriberId: string) => void }}
     */
    static signal(value) {
        return new XynSignal(value);
    }

    /**
     * @param {() => void} fn
     * @param {XynHTML.signal[]} signals
     * @param {?function(): void} cleanup
     * @returns {Unsubscribe} unsubscribe
     */
    static effect(fn, signals, cleanup = null) {
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
            cleanup?.();
        };
    }

    /**
     * @template T
     * @param {() => T} fn
     * @param {XynHTML.signal[]} signals
     * @param {?function(): void} cleanup
     * @returns {{unsubscribeDerived: () => void} extends XynHTML.signal} signal extended with unsubscribeDrived method
     */
    static derived(fn, signals, cleanup = null) {
        const derivedSignal = new XynSignal(fn());

        return Object.assign(derivedSignal, {
            unsubscribeDerived: XynHTML.effect(() => derivedSignal.value = fn(), signals, cleanup)
        });
    }

    /**
     * @param {(TemplateStringArray | string)} tagName
     * @param {...(XynElement | Object.<string, any>)} childrenOrAttributes
     * @returns {XynTag}
     * @description Creates a new XynTag with the given tag name and children and/or attributes.
     */
    static tag = (tagName, ...childrenOrAttributes) =>
        new XynTag((Array.isArray(tagName) ? tagName.join("") : tagName).trim(), ...childrenOrAttributes);

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
export const mountNext = XynHTML.mountNext;
/**
 * @export @alias {XynHTML.createRoot}
 */
export const mountRoot = XynHTML.mountRoot;
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
export const fragment = (...children) => new XynFragment(...children);
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
 * @param {(TemplateStringArry | string)} tagName
 * @param {...(XynElement | Object.<string, any>)} childrenOrAttributes
 * @returns {XynTag}
 * @example t`div`
 */
export const tag = XynHTML.tag;
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
