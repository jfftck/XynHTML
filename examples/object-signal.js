import { createSignal } from "../src/xyn_signal.js";

export const title = "Example 19: Object Signal Reactivity";

export async function example19(output) {
    output("Creating object signal with createSignal({name: 'Alice', age: 25})");
    const user = createSignal({ name: "Alice", age: 25 });

    output(`Initial state → name: ${user.get("name")}, age: ${user.get("age")}`);

    output("");
    output("Subscribing to changes:");
    let changeCount = 0;
    user.subscribe(() => {
        changeCount++;
        output(`  Subscriber #${changeCount} → name: ${user.get("name")}, age: ${user.get("age")}`);
    });

    output("");
    output("Setting user.set('name', 'Bob')");
    user.set("name", "Bob");

    output("");
    output("Setting user.set('age', 30)");
    user.set("age", 30);

    output("");
    output("Adding new property: user.set('email', 'bob@example.com')");
    user.set("email", "bob@example.com");
    output(`  → email: ${user.get("email")}`);

    output("");
    output("Deleting property: user.delete('email')");
    user.delete("email");
    output(`  → email: ${user.get("email") ?? "(deleted)"}`);

    output("");
    output("Unsubscribing, then setting user.set('name', 'Charlie')");
    const unsub = user.subscribe(() => {
        output(`  Second subscriber → name: ${user.get("name")}`);
    });
    unsub();
    user.set("name", "Charlie");
    output(`  → name: ${user.get("name")} (second subscriber silent after unsubscribe)`);
}
