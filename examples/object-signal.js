import { createSignal } from "../src/xyn_signal.js";

export const title = "Example 19: Object Signal Reactivity";

export async function example19(output) {
    output("=== Object Signal: Direct Property Mutation ===");
    output("Creating object signal with createSignal({name: 'Alice', age: 25})");
    const user = createSignal({ name: "Alice", age: 25 });

    output(`Initial state → name: ${user.value.name}, age: ${user.value.age}`);

    output("");
    output("Setting user.value.name = 'Bob'");
    user.value.name = "Bob";
    output(`  → name: ${user.value.name}`);

    output("");
    output("Setting user.value.age = 30");
    user.value.age = 30;
    output(`  → age: ${user.value.age}`);

    output("");
    output("Adding new property: user.value.email = 'bob@example.com'");
    user.value.email = "bob@example.com";
    output(`  → email: ${user.value.email}`);

    output("");
    output("Deleting property: delete user.value.email");
    delete user.value.email;
    output(`  → email: ${user.value.email ?? "(deleted)"}`);

    output("");
    output("Final object state:");
    output(`  name: ${user.value.name}`);
    output(`  age: ${user.value.age}`);
    output(`  email: ${user.value.email ?? "(deleted)"}`);

    output("");
    output("=== Object Signal: Subscribe ===");
    output("Subscriber is called immediately on registration:");
    const config = createSignal({ theme: "light" });
    config.subscribe(() => {
        output(`  Subscriber fired → theme: ${config.value.theme}`);
    });

    output("");
    output("Key points:");
    output("• createSignal({...}) wraps object in a reactive proxy");
    output("• Direct property assignment (obj.value.prop = x) works");
    output("• Property addition and deletion are reactive");
    output("• subscribe() calls the subscriber immediately on registration");
}
