import { createSignal, watch } from "../src/xyn_signal.js";

export const title = "Example 22: Watch Multiple Signals";

export async function example22(output) {
    output("=== Basic watch with effect ===");
    const counter = createSignal(0);
    
    const unsubscribe = watch(counter).effect((change) => {
        output(`Counter changed: ${change.previousValue} → ${change.value}`);
    });
    
    counter.value = 5;
    counter.value = 10;
    unsubscribe();
    counter.value = 15;
    output("(unsubscribed - no notification for 15)");

    output("");
    output("=== Watching multiple signals ===");
    const firstName = createSignal("John");
    const lastName = createSignal("Doe");
    
    watch(firstName)
        .watch(lastName)
        .effect((change) => {
            output(`Name updated: ${firstName.value} ${lastName.value}`);
        });
    
    firstName.value = "Jane";
    lastName.value = "Smith";

    output("");
    output("=== Derived from multiple signals ===");
    const width = createSignal(10);
    const height = createSignal(5);
    
    const { signal: area, unsubscribe: stopArea } = watch(width)
        .watch(height)
        .derived(() => width.value * height.value);
    
    output(`Initial area: ${area.value}`);
    
    width.value = 20;
    output(`After width=20: ${area.value}`);
    
    height.value = 10;
    output(`After height=10: ${area.value}`);
    
    stopArea();
    width.value = 100;
    output(`After unsubscribe (width=100): ${area.value} (unchanged)`);

    output("");
    output("Key features:");
    output("• Chain .watch() to observe multiple signals");
    output("• .effect() subscribes to all watched signals");
    output("• .derived() creates computed values from multiple sources");
    output("• Both return unsubscribe functions for cleanup");
}
