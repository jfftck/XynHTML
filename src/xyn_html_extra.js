/**
 * XynHTML Extra Features - v1.0.1 (Fixed optional chaining syntax)
 * @typedef {Object} XynSignal
 * @template T
 * @property {T} value
 * @property {function(function([T]): void): void} subscribe
 * @property {function(function([T]): void): void} unsubscribe
 */

/**
 * @callback XynDerived
 * @param {function(): any} value
 * @param {XynSignal[]} subscribers
 * @param {?function(): void} cleanup
 * returns {XynSignal}
 */

/** @type {?(function(any): XynSignal)} */
let signal;

/** @type {?XynDerived} */
let derived;

/**
 * @param {function(any): XynSignal} s
 * @returns {void}
 * @description Sets the global signal function.
 */
export const setSignal = (s) => signal = s;

/**
 * @param {XynDerived} d
 * @returns {void}
 * @description Sets the global derived function.
 */
export const setDerived = (d) => derived = d;

/**
 * @class AnimationState
 * @description AnimationState is a class for tracking the state of an animation.
 */
export class AnimationState {
        UNSET = "unset";
        STARTED = "started";
        ENDED = "ended";
        CANCELED = "canceled";
        ITERATION = "iteration";

        /**
         * @returns {AnimationState}
         * @description Creates a new AnimationState instance.
         */
        static create() {
                return AnimationState.UNSET;
        }
}

/**
 * @class TransitionState
 * @description TransitionState is a class for tracking the state of a transition.
 */
export class TransitionState {
        UNSET = "unset";
        STARTED = "started";
        ENDED = "ended";
        CANCELED = "canceled";
        RUNNING = "running";

        /**
         * @returns {TransitionState}
         * @description Creates a new TransitionState instance.
         */
        static create() {
                return TransitionState.UNSET;
        }
}

/**
 * @param {HTMLElement} el
 * @param {XynSignal} state
 * @param {?XynSignal} event
 * @returns {void}
 * @description Adds event listeners to the element to track animation state.
 */
const animationState = (el, state, event = null) => {
        el.addEventListener("animationstart", (e) => {
                state.value = AnimationState.STARTED;
                if (event) event.value = e;
        });
        el.addEventListener("animationend", (e) => {
                state.value = AnimationState.ENDED;
                if (event) event.value = e;
        });
        el.addEventListener("animationcancel", (e) => {
                state.value = AnimationState.CANCELED;
                if (event) event.value = e;
        });
        el.addEventListener("animationiteration", (e) => {
                state.value = AnimationState.ITERATION;
                if (event) event.value = e;
        });
};

/**
 * @param {HTMLElement} el
 * @param {XynSignal} state
 * @param {?XynSignal} event
 */
const transitionState = (el, state, event = null) => {
        el.addEventListener("transitionstart", (e) => {
                state.value = TransitionState.STARTED;
                if (event) event.value = e;
        });
        el.addEventListener("transitionend", (e) => {
                state.value = TransitionState.ENDED;
                if (event) event.value = e;
        });
        el.addEventListener("transitioncancel", (e) => {
                state.value = TransitionState.CANCELED;
                if (event) event.value = e;
        });
        el.addEventListener("transitionrun", (e) => {
                state.value = TransitionState.RUNNING;
                if (event) event.value = e;
        });
};

/**
 * @param {HTMLElement} el
 * @returns {XynSignal<AnimationState>}
 * @description Creates a new AnimationState signal for the element.
 * @example
 * const state = createAnimationState(el);
 * state.subscribe((preValue) =>
 *      console.log(`Animation state changed from ${preValue} to ${state.value}`)
 * );
 * // Add animation to element in CSS file
 */
export const createAnimationState = (el, event = null) => {
        if (!signal) {
                throw new Error("Signal function not set. Use setSignal() to set the global signal function.");
        }

        const state = signal(AnimationState.create());
        animationState(el, state, event);

        return state;
}

/**
 * @param {HTMLElement} el
 * @returns {XynSignal<TransitionState>}
 * @description Creates a new TransitionState signal for the element.
 * @example
 * const state = createTransitionState(el);
 * state.subscribe((preValue) =>
 *      console.log(`Transition state changed from ${preValue} to ${state.value}`)
 * );
 * el.style.transition = "all 1s";
 * el.style.width = "100px";
 */
export const createTransitionState = (el, event = null) => {
        if (!signal) {
                throw new Error("Signal function not set. Use setSignal() to set the global signal function.");
        }

        const state = signal(TransitionState.create());
        transitionState(el, state, event);

        return state;
}

export class XynRouter {
        /**
         * @returns {function(): void}
         * @description Returns the pathname signal.
         */
        #update = null;

        /** @type {URL} */
        #url = new URL(window.location.href);
        /** @type {?XynSignal<string>} */
        #hrefSignal = null;

        /**
         * @returns {XynSignal<{pathname: string, search: URLSearchParams, hash: string}>}
         * @description Creates a new Router instance.
         */
        static create() {
                return new XynRouter();
        }

        routes(...routes) {
                if (!signal) {
                        throw new Error("Signal function not set. Use setSignal() to set the global signal function.");
                }
                if (!derived) {
                        throw new Error("Derived function not set. Use setDerived() to set the global derived function.");
                }

                this.#hrefSignal = signal(window.location.href);

                this.#update = () => {
                        this.#hrefSignal.value = window.location.href;
                };

                window.addEventListener("popstate", this.#update);
                window.addEventListener("hashchange", this.#update);

                return derived(() => {
                        for (const { match, handler, routeName } of routes) {
                                const { isMatch, isExact } = match(this);
                                if (isMatch) {
                                        return handler({
                                                router: this,
                                                isExact,
                                                routeName
                                        });
                                }
                        }
                }, [this.href]);
        }

        /**
         * @returns {void}
         * @description Destroys the Router instance.
         */
        destroy() {
                window.removeEventListener("popstate", this.#update);
                window.removeEventListener("hashchange", this.#update);
                this.#hrefSignal = null;
                this.#update = null;
        }

        /** @type string */
        get pathname() {
                this.#url.href = this.#hrefSignal.value;

                return this.#url.pathname;
        }

        set pathname(value) {
                this.#url.href = this.#hrefSignal.value;
                this.#url.pathname = value;

                window.history.pushState({}, "", this.#url.href);
                this.#hrefSignal.value = this.#url.href;
        }

        /** @type URLSearchParms */
        get search() {
                this.#url.href = this.#hrefSignal.value;

                return this.#url.searchParams;
        }

        set search(value) {
                this.#url.href = this.#hrefSignal.value;
                this.#url.search = value.toString();

                window.history.pushState({}, "", this.#url.href);
                this.#hrefSignal.value = this.#url.href;
        }

        /** @type string */
        get hash() {
                this.#url.href = this.#hrefSignal.value;

                return this.#url.hash;
        }

        set hash(value) {
                this.#url.href = this.#hrefSignal.value;
                this.#url.hash = value;

                window.history.pushState({}, "", this.#url.href);
                this.#hrefSignal.value = this.#url.href;
        }

        get href() {
                return this.#hrefSignal.value;
        }
}

/**
 * @param {function({pathname: string, search: URLSearchParams, hash: string}): {isMatch: boolean, isExact: boolean}} matcher
 * @param {function({router: XynRouter, isExact: boolean, routeName: string}): void} handler
 * @param {string} routeName
 * @returns {{match: function(XynRouter): {isMatch: boolean, isExact: boolean}, handler: function({router: XynRouter, isExact: boolean, routeName: string}): void, routeName: string}}
 * @description Creates a new route.
 */
export const route = (matcher, handler, routeName) => ({ match: matcher, handler, routeName });

/**
 * @param {...string} path
 * @returns {function({pathname: string, search: URLSearchParams, hash: string}): {isMatch: boolean, isExact: boolean}}
 * @description Creates a new path matcher.
 */
export const pathMatcher = (...path) => ({ pathname }) => {
        const pathnameParts = pathname.split("/");
        const isMatch = path.every(
                (part, i) => typeof part === "string" ?
                        part === pathnameParts[i] :
                        ((part.value = pathnameParts[i]), pathnameParts[i] !== undefined));
        const isExact = isMatch && pathnameParts.length === path.length;

        return { isMatch, isExact };
}

/**
 * @param {XynSignal<string>} routeSignal
 * @returns {function({routeName: string}): void}
 * @description Creates a new basic router handler.
 */
export const basicRouting = (routeSignal) => ({ routeName }) => routeSignal.value = routeName;

/**
 * @param {XynSignal<string>} routeSignal
 * @returns {function({isExact: boolean, routeName: string}): void}
 * @description Creates a new exact router handler.
 */
export const exactRouting = (routeSignal) => ({ isExact, routeName }) => routeSignal.value = isExact ? routeName : null;