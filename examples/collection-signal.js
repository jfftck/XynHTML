import { createSignal } from "../src/xyn_signal.js";

export const title = "Example 21: Map and Set Signal Reactivity";

export async function example21(output) {
    output("=== Map Signal ===");
    output("Creating Map signal with createSignal(new Map())");
    const userMap = createSignal(new Map());

    output("");
    output("Subscribing to Map changes:");
    let mapChangeCount = 0;
    userMap.subscribe(() => {
        mapChangeCount++;
        const entries = [];
        for (const [key, value] of userMap.entries()) {
            entries.push(`${key}: ${value}`);
        }
        output(`  Subscriber #${mapChangeCount} → {${entries.join(", ")}}`);
    });

    output("");
    output("Setting entries: userMap.set('name', 'Alice')");
    userMap.set("name", "Alice");

    output("Setting entries: userMap.set('age', 25)");
    userMap.set("age", 25);

    output("");
    output("Updating entry: userMap.set('name', 'Bob')");
    userMap.set("name", "Bob");

    output("");
    output("Deleting entry: userMap.delete('age')");
    userMap.delete("age");

    output("");
    output("Final Map state:");
    const finalEntries = [];
    for (const [key, value] of userMap.entries()) {
        finalEntries.push(`${key}: ${value}`);
    }
    output(`  {${finalEntries.join(", ")}}`);
    output(`  Size: ${userMap.size}`);
    output(`  Has 'name': ${userMap.has("name")}`);
    output(`  Has 'age': ${userMap.has("age")}`);

    output("=== Set Signal ===");
    output("Creating Set signal with createSignal(new Set())");
    const tags = createSignal(new Set());

    output("");
    output("Subscribing to Set changes:");
    let setChangeCount = 0;
    tags.subscribe(() => {
        setChangeCount++;
        output(`  Subscriber #${setChangeCount} → {${[...tags].join(", ")}}`);
    });

    output("");
    output("Adding items: tags.add('javascript')");
    tags.add("javascript");

    output("Adding items: tags.add('reactive')");
    tags.add("reactive");

    output("Adding items: tags.add('signals')");
    tags.add("signals");

    output("");
    output("Deleting item: tags.delete('reactive')");
    tags.delete("reactive");

    output("");
    output("Final Set state:");
    output(`  {${[...tags].join(", ")}}`);
    output(`  Size: ${tags.size}`);
    output(`  Has 'javascript': ${tags.has("javascript")}`);
    output(`  Has 'reactive': ${tags.has("reactive")}`);
    output(`  Has 'signals': ${tags.has("signals")}`);
}
