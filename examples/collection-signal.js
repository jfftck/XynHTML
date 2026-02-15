import { createSignal } from "../src/xyn_signal.js";

export const title = "Example 21: Map and Set Signal Reactivity";

export async function example21(output) {
    output("=== Map Signal ===");
    output("Creating Map signal with createSignal(new Map())");
    const userMap = createSignal(new Map());

    function showMap() {
        const entries = [];
        for (const [key, value] of userMap.value.entries()) {
            entries.push(`${key}: ${value}`);
        }
        output(`  → {${entries.join(", ")}}`);
    }

    output("");
    output("Setting entries: userMap.value.set('name', 'Alice')");
    userMap.value.set("name", "Alice");
    showMap();

    output("Setting entries: userMap.value.set('age', 25)");
    userMap.value.set("age", 25);
    showMap();

    output("");
    output("Updating entry: userMap.value.set('name', 'Bob')");
    userMap.value.set("name", "Bob");
    showMap();

    output("");
    output("Deleting entry: userMap.value.delete('age')");
    userMap.value.delete("age");
    showMap();

    output("");
    output("Final Map state:");
    for (const [key, value] of userMap.value.entries()) {
        output(`  ${key}: ${value}`);
    }

    output("");
    output("=== Set Signal ===");
    output("Creating Set signal with createSignal(new Set())");
    const tags = createSignal(new Set());

    function showSet() {
        output(`  → {${[...tags.value].join(", ")}}`);
    }

    output("");
    output("Adding items: tags.value.add('javascript')");
    tags.value.add("javascript");
    showSet();

    output("Adding items: tags.value.add('reactive')");
    tags.value.add("reactive");
    showSet();

    output("Adding items: tags.value.add('signals')");
    tags.value.add("signals");
    showSet();

    output("");
    output("Deleting item: tags.value.delete('reactive')");
    tags.value.delete("reactive");
    showSet();

    output("");
    output("Final Set state:");
    output(`  {${[...tags.value].join(", ")}}`);
}
