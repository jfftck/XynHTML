import { createSignal, CollectionValue } from "../xyn_signal.js";

const results = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
    try {
        fn();
        results.push({ name, passed: true });
        passCount++;
    } catch (error) {
        results.push({ name, passed: false, error: error.message });
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
                throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
            }
        },
        toBeDefined() {
            if (actual === undefined) {
                throw new Error(`Expected value to be defined, but got undefined`);
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
                throw new Error(`Expected ${times} calls, but got ${actual.callCount}`);
            }
        }
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

test("Primitive signal: subscriber receives change object with value and previousValue", () => {
    const counter = createSignal(10);
    let receivedChange = null;
    counter.subscribe((change) => {
        receivedChange = change;
    });
    counter.value = 20;
    expect(receivedChange.value).toBe(20);
    expect(receivedChange.previousValue).toBe(10);
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

test("Object signal: subscriber receives change with index (property key)", () => {
    const user = createSignal({ name: "Alice" });
    let receivedChange = null;
    user.subscribe((change) => {
        receivedChange = change;
    });
    user.value.name = "Bob";
    expect(receivedChange.index).toBe("name");
    expect(receivedChange.value).toBe("Bob");
    expect(receivedChange.previousValue).toBe("Alice");
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

test("Object signal: delete change has CollectionValue.DELETE as value", () => {
    const user = createSignal({ name: "Alice" });
    let receivedChange = null;
    user.subscribe((change) => {
        receivedChange = change;
    });
    delete user.value.name;
    expect(receivedChange.value).toBe(CollectionValue.DELETE);
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
    expect(subscriber.lastArgs[0].index).toBe("a");
    expect(subscriber.lastArgs[0].value).toBe(1);
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

test("Map signal: subscriber receives correct change metadata", () => {
    const map = createSignal(new Map());
    let receivedChange = null;
    map.subscribe((change) => {
        receivedChange = change;
    });
    map.value.set("key", "value");
    expect(receivedChange.index).toBe("key");
    expect(receivedChange.value).toBe("value");
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

test("Set signal: subscriber receives correct change for add", () => {
    const set = createSignal(new Set());
    let receivedChange = null;
    set.subscribe((change) => {
        receivedChange = change;
    });
    set.value.add("item");
    expect(receivedChange.index).toBe("item");
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
    
    console.log(`\n=== Results: ${passCount} passed, ${failCount} failed ===\n`);
    
    return { passCount, failCount, results };
}

runTests();
