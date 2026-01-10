import { createSignal } from "../src/xyn_signal.js";

export const title = "Example 19: Object Signal Reactivity";

export async function example19(output) {
    output("Creating object signal with createSignal({name: 'Alice', age: 25})");
    const user = createSignal({ name: "Alice", age: 25 });

    user.subscribe((change) => {
        output(`Property '${change.index}' changed: ${change.previousValue} → ${change.value}`);
    });

    output("");
    output("Setting user.value.name = 'Bob'");
    user.value.name = "Bob";

    output("");
    output("Setting user.value.age = 30");
    user.value.age = 30;

    output("");
    output("Adding new property: user.value.email = 'bob@example.com'");
    user.value.email = "bob@example.com";

    output("");
    output("Deleting property: delete user.value.email");
    delete user.value.email;

    output("");
    output("Final object state:");
    output(`  name: ${user.value.name}`);
    output(`  age: ${user.value.age}`);
    output(`  email: ${user.value.email} (deleted)`);
}
