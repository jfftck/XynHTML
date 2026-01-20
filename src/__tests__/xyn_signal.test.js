import { createSignal, Change, watch, timing } from "../xyn_signal.js";

const results = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
    try {
        fn();
        results.push({ name, passed: true });
        passCount++;
    } catch (error) {
        results.push({
            name,
            passed: false,
            error: error.message,
            stack: error.stack,
        });
        failCount++;
    }
}

function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, but got ${actual}`);
            }
        },
        toEqual(expected) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(
                    `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`,
                );
            }
        },
        toBeDefined() {
            if (actual === undefined) {
                throw new Error(
                    `Expected value to be defined, but got undefined`,
                );
            }
        },
        toBeInstanceOf(constructor) {
            if (!(actual instanceof constructor)) {
                throw new Error(`Expected instance of ${constructor.name}`);
            }
        },
        toHaveBeenCalled() {
            if (!actual.called) {
                throw new Error(`Expected function to have been called`);
            }
        },
        toHaveBeenCalledTimes(times) {
            if (actual.callCount !== times) {
                throw new Error(
                    `Expected ${times} calls, but got ${actual.callCount}`,
                );
            }
        },
    };
}

function createMockFn() {
    const fn = (...args) => {
        fn.called = true;
        fn.callCount++;
        fn.lastArgs = args;
        fn.allArgs.push(args);
    };
    fn.called = false;
    fn.callCount = 0;
    fn.lastArgs = null;
    fn.allArgs = [];
    return fn;
}

test("Primitive signal: initial value is accessible via .value", () => {
    const counter = createSignal(42);
    expect(counter.value).toBe(42);
});

test("Primitive signal: value updates correctly", () => {
    const counter = createSignal(0);
    counter.value = 10;
    expect(counter.value).toBe(10);
});

test("Primitive signal: subscriber is called on value change", () => {
    const counter = createSignal(0);
    const subscriber = createMockFn();
    counter.subscribe(subscriber);
    counter.value = 5;
    expect(subscriber.callCount).toBe(1);
});

test("Primitive signal: has .change property with last change", () => {
    const counter = createSignal(10);
    counter.subscribe(() => {});
    counter.value = 20;
    expect(counter.change).toBeDefined();
    expect(counter.change.set).toBe(10);
});

test("Primitive signal: unsubscribe stops notifications", () => {
    const counter = createSignal(0);
    const subscriber = createMockFn();
    const unsubscribe = counter.subscribe(subscriber);
    counter.value = 1;
    unsubscribe();
    counter.value = 2;
    expect(subscriber.callCount).toBe(1);
});

test("Primitive signal: function initializer is called", () => {
    const counter = createSignal(() => 100);
    expect(counter.value).toBe(100);
});

test("Object signal: .value provides access to object", () => {
    const user = createSignal({ name: "Alice" });
    expect(user.value.name).toBe("Alice");
});

test("Object signal: property assignment triggers subscriber", () => {
    const user = createSignal({ name: "Alice" });
    const subscriber = createMockFn();
    user.subscribe(subscriber);
    user.value.name = "Bob";
    expect(subscriber.callCount).toBe(1);
});

test("Object signal: has .change property with last change", () => {
    const user = createSignal({ name: "Alice" });
    user.subscribe(() => {});
    user.value.name = "Bob";
    expect(user.change).toBeDefined();
});

test("Object signal: adding new property triggers subscriber", () => {
    const user = createSignal({});
    const subscriber = createMockFn();
    user.subscribe(subscriber);
    user.value.email = "test@example.com";
    expect(subscriber.callCount).toBe(1);
});

test("Object signal: deleting property triggers subscriber", () => {
    const user = createSignal({ name: "Alice", age: 25 });
    const subscriber = createMockFn();
    user.subscribe(subscriber);
    delete user.value.age;
    expect(subscriber.callCount).toBe(1);
});

test("Object signal: delete change is reflected in .change property", () => {
    const user = createSignal({ name: "Alice" });
    user.subscribe(() => {});
    delete user.value.name;
    expect(user.change).toBeDefined();
});

test("REGRESSION: createSignal({}).value.a = 1 assigns correctly", () => {
    const obj = createSignal({});
    obj.value.a = 1;
    expect(obj.value.a).toBe(1);
});

test("REGRESSION: createSignal({}).value.a = 1 notifies subscribers", () => {
    const obj = createSignal({});
    const subscriber = createMockFn();
    obj.subscribe(subscriber);
    obj.value.a = 1;
    expect(subscriber.callCount).toBe(1);
});

test("Nested object: can access nested properties", () => {
    const data = createSignal({
        user: { name: "Alice", profile: { age: 25 } },
    });
    expect(data.value.user.name).toBe("Alice");
    expect(data.value.user.profile.age).toBe(25);
});

test("Nested object: modifying nested property triggers subscriber", () => {
    const data = createSignal({ user: { name: "Alice" } });
    const subscriber = createMockFn();
    data.subscribe(subscriber);
    data.value.user.name = "Bob";
    expect(subscriber).toHaveBeenCalled();
});

test("Nested object: adding property to nested object triggers subscriber", () => {
    const data = createSignal({ user: {} });
    const subscriber = createMockFn();
    data.subscribe(subscriber);
    data.value.user.email = "test@example.com";
    expect(subscriber).toHaveBeenCalled();
});

test("Nested object: deleting nested property triggers subscriber", () => {
    const data = createSignal({ user: { name: "Alice", age: 25 } });
    const subscriber = createMockFn();
    data.subscribe(subscriber);
    delete data.value.user.age;
    expect(subscriber).toHaveBeenCalled();
});

test("Nested object: deeply nested modification triggers subscriber", () => {
    const data = createSignal({ level1: { level2: { level3: { value: 1 } } } });
    const subscriber = createMockFn();
    data.subscribe(subscriber);
    data.value.level1.level2.level3.value = 2;
    expect(subscriber).toHaveBeenCalled();
});

test("Nested object: replacing nested object triggers subscriber", () => {
    const data = createSignal({ user: { name: "Alice" } });
    const subscriber = createMockFn();
    data.subscribe(subscriber);
    data.value.user = { name: "Bob", age: 30 };
    expect(subscriber).toHaveBeenCalled();
});

test("Nested object: .change property is updated on nested update", () => {
    const data = createSignal({ config: { theme: "light" } });
    data.subscribe(() => {});
    data.value.config.theme = "dark";
    expect(data.change).toBeDefined();
});

test("Array signal: .value provides access to array", () => {
    const list = createSignal(["a", "b", "c"]);
    expect(list.value.length).toBe(3);
    expect(list.value[0]).toBe("a");
});

test("Array signal: push triggers subscriber", () => {
    const list = createSignal([]);
    const subscriber = createMockFn();
    list.subscribe(subscriber);
    list.value.push("item");
    expect(subscriber.callCount).toBe(1);
});

test("Array signal: pop triggers subscriber", () => {
    const list = createSignal(["a", "b"]);
    const subscriber = createMockFn();
    list.subscribe(subscriber);
    list.value.pop();
    expect(subscriber.callCount).toBe(1);
});

test("Array signal: unshift triggers subscriber", () => {
    const list = createSignal(["b"]);
    const subscriber = createMockFn();
    list.subscribe(subscriber);
    list.value.unshift("a");
    expect(subscriber.callCount).toBe(1);
});

test("Array signal: shift triggers subscriber", () => {
    const list = createSignal(["a", "b"]);
    const subscriber = createMockFn();
    list.subscribe(subscriber);
    list.value.shift();
    expect(subscriber.callCount).toBe(1);
});

test("Array signal: splice triggers subscriber", () => {
    const list = createSignal(["a", "b", "c"]);
    const subscriber = createMockFn();
    list.subscribe(subscriber);
    list.value.splice(1, 1, "x");
    expect(subscriber.callCount).toBe(1);
});

test("Array signal: has .change property", () => {
    const list = createSignal([]);
    list.subscribe(() => {});
    list.value.push("item");
    expect(list.change).toBeDefined();
});

test("Map signal: .value provides access to Map", () => {
    const map = createSignal(new Map([["key", "value"]]));
    expect(map.value.get("key")).toBe("value");
});

test("Map signal: set triggers subscriber", () => {
    const map = createSignal(new Map());
    const subscriber = createMockFn();
    map.subscribe(subscriber);
    map.value.set("name", "Alice");
    expect(subscriber.callCount).toBe(1);
});

test("Map signal: delete triggers subscriber", () => {
    const map = createSignal(new Map([["name", "Alice"]]));
    const subscriber = createMockFn();
    map.subscribe(subscriber);
    map.value.delete("name");
    expect(subscriber.callCount).toBe(1);
});

test("Map signal: has .change property", () => {
    const map = createSignal(new Map());
    map.subscribe(() => {});
    map.value.set("key", "value");
    expect(map.change).toBeDefined();
});

test("Set signal: .value provides access to Set", () => {
    const set = createSignal(new Set(["a", "b"]));
    expect(set.value.has("a")).toBe(true);
    expect(set.value.size).toBe(2);
});

test("Set signal: add triggers subscriber", () => {
    const set = createSignal(new Set());
    const subscriber = createMockFn();
    set.subscribe(subscriber);
    set.value.add("item");
    expect(subscriber.callCount).toBe(1);
});

test("Set signal: delete triggers subscriber", () => {
    const set = createSignal(new Set(["a"]));
    const subscriber = createMockFn();
    set.subscribe(subscriber);
    set.value.delete("a");
    expect(subscriber.callCount).toBe(1);
});

test("Set signal: has .change property", () => {
    const set = createSignal(new Set());
    set.subscribe(() => {});
    set.value.add("item");
    expect(set.change).toBeDefined();
});

test("watch: returns object with watch, effect, and derived methods", () => {
    const sig = createSignal(0);
    const watcher = watch(sig);
    expect(typeof watcher.watch).toBe("function");
    expect(typeof watcher.effect).toBe("function");
    expect(typeof watcher.derived).toBe("function");
});

test("watch: effect subscribes to single signal", () => {
    const counter = createSignal(0);
    const subscriber = createMockFn();
    watch(counter).effect(subscriber);
    counter.value = 5;
    expect(subscriber.callCount).toBe(1);
});

test("watch: effect subscribes to multiple signals via chaining", () => {
    const signal1 = createSignal(0);
    const signal2 = createSignal(0);
    const subscriber = createMockFn();
    watch(signal1).watch(signal2).effect(subscriber);
    signal1.value = 1;
    signal2.value = 2;
    expect(subscriber.callCount).toBe(2);
});

test("watch: effect returns unsubscribe function", () => {
    const counter = createSignal(0);
    const subscriber = createMockFn();
    const unsubscribe = watch(counter).effect(subscriber);
    counter.value = 1;
    unsubscribe();
    counter.value = 2;
    expect(subscriber.callCount).toBe(1);
});

test("watch: derived creates a derived signal from watched signals", () => {
    const a = createSignal(2);
    const b = createSignal(3);
    const { signal: sum } = watch(a).watch(b).derived(() => a.value + b.value);
    expect(sum.value).toBe(5);
});

test("watch: derived signal updates when source signals change", () => {
    const a = createSignal(2);
    const b = createSignal(3);
    const { signal: sum } = watch(a).watch(b).derived(() => a.value + b.value);
    a.value = 10;
    expect(sum.value).toBe(13);
    b.value = 7;
    expect(sum.value).toBe(17);
});

test("watch: derived returns unsubscribe function", () => {
    const a = createSignal(1);
    const b = createSignal(2);
    const { signal: sum, unsubscribe } = watch(a).watch(b).derived(() => a.value + b.value);
    expect(sum.value).toBe(3);
    unsubscribe();
    a.value = 100;
    expect(sum.value).toBe(3);
});

test("watch: handles null/undefined signals gracefully", () => {
    const sig = createSignal(0);
    const subscriber = createMockFn();
    watch(null).watch(sig).watch(undefined).effect(subscriber);
    sig.value = 1;
    expect(subscriber.callCount).toBe(1);
});

test("timing: returns object with debounce, throttle, and delay methods", () => {
    const t = timing(100);
    expect(typeof t.debounce).toBe("function");
    expect(typeof t.throttle).toBe("function");
    expect(typeof t.delay).toBe("function");
});

test("timing: debounce wraps function and returns a function", () => {
    const fn = createMockFn();
    const debounced = timing(100).debounce(fn);
    expect(typeof debounced).toBe("function");
});

test("timing: throttle wraps function and returns a function", () => {
    const fn = createMockFn();
    const throttled = timing(100).throttle(fn);
    expect(typeof throttled).toBe("function");
});

test("timing: delay wraps function and returns a function", () => {
    const fn = createMockFn();
    const delayed = timing(100).delay(fn);
    expect(typeof delayed).toBe("function");
});

test("timing: throttle executes immediately on first call", () => {
    const fn = createMockFn();
    const throttled = timing(1000).throttle(fn);
    throttled("arg1");
    expect(fn.callCount).toBe(1);
    expect(fn.lastArgs).toEqual(["arg1"]);
});

test("timing: throttle blocks rapid calls within delay period", () => {
    const fn = createMockFn();
    const throttled = timing(1000).throttle(fn);
    throttled("first");
    throttled("second");
    throttled("third");
    expect(fn.callCount).toBe(1);
    expect(fn.lastArgs).toEqual(["first"]);
});

test("timing: different delay values create independent timing objects", () => {
    const t100 = timing(100);
    const t200 = timing(200);
    expect(t100 !== t200).toBe(true);
    expect(typeof t100.debounce).toBe("function");
    expect(typeof t200.debounce).toBe("function");
});

export function runTests() {
    console.log("\n=== XynSignal Test Suite ===\n");

    for (const result of results) {
        if (result.passed) {
            console.log(`PASS: ${result.name}`);
        } else {
            console.log(`FAIL: ${result.name}`);
            console.log(`  Error: ${result.error}`);
        }
    }

    console.log(
        `\n=== Results: ${passCount} passed, ${failCount} failed ===\n`,
    );

    for (const result of results) {
        if (!result.passed) {
            console.log(`\nDetailed failure for: ${result.name}`);
            console.log(`Stack:\n${result.stack}`);
        }
    }

    return { passCount, failCount, results };
}

runTests();
