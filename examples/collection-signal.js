import { createSignal } from "../src/xyn_signal.js";

export const title = "Example 21: Map and Set Signal Reactivity";

export async function example21(output) {
    output("=== Map Signal ===");
    output("Creating Map signal with createSignal(new Map())");
    const userMap = createSignal(new Map());

    userMap.subscribe((change) => {
        const valueStr = String(change.value);
        const prevStr = String(change.previousValue);
        output(`Map operation on key '${change.index}': ${prevStr} → ${valueStr}`);
    });

    output("");
    output("Setting entries: userMap.value.set('name', 'Alice')");
    userMap.value.set("name", "Alice");

    output("Setting entries: userMap.value.set('age', 25)");
    userMap.value.set("age", 25);

    output("");
    output("Updating entry: userMap.value.set('name', 'Bob')");
    userMap.value.set("name", "Bob");

    output("");
    output("Deleting entry: userMap.value.delete('age')");
    userMap.value.delete("age");

    output("");
    output("Final Map state:");
    for (const [key, value] of userMap.value.entries()) {
        output(`  ${key}: ${value}`);
    }

    output("");
    output("=== Set Signal ===");
    output("Creating Set signal with createSignal(new Set())");
    const tags = createSignal(new Set());

    tags.subscribe((change) => {
        const valueStr = String(change.value);
        output(`Set operation: added '${change.index}'`);
    });

    output("");
    output("Adding items: tags.value.add('javascript')");
    tags.value.add("javascript");

    output("Adding items: tags.value.add('reactive')");
    tags.value.add("reactive");

    output("Adding items: tags.value.add('signals')");
    tags.value.add("signals");

    output("");
    output("Deleting item: tags.value.delete('reactive')");
    tags.value.delete("reactive");

    output("");
    output("Final Set state:");
    output(`  {${[...tags.value].join(", ")}}`);
}
