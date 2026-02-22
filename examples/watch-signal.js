import { createSignal, watch } from "../src/xyn_signal.js";

export const title = "Example 22: Watch Multiple Signals";

export async function example22(output) {
    output("=== Basic watch with effect ===");
    const counter = createSignal(0);
    
    const unsubscribe = watch(counter).effect(() => {
        output(`Counter value: ${counter.get()}`);
    });
    
    counter.set(5);
    counter.set(10);
    unsubscribe();
    counter.set(15);
    output("(unsubscribed - no notification for 15)");

    output("");
    output("=== Watching multiple signals ===");
    const firstName = createSignal("John");
    const lastName = createSignal("Doe");
    
    watch(firstName)
        .watch(lastName)
        .effect(() => {
            output(`Name updated: ${firstName.get()} ${lastName.get()}`);
        });
    
    firstName.set("Jane");
    lastName.set("Smith");

    output("");
    output("=== Derived from multiple signals ===");
    const width = createSignal(10);
    const height = createSignal(5);
    
    const { signal: area, unsubscribe: stopArea } = watch(width)
        .watch(height)
        .derived(() => width.get() * height.get());
    
    output(`Initial area: ${area.get()}`);
    
    width.set(20);
    output(`After width=20: ${area.get()}`);
    
    height.set(10);
    output(`After height=10: ${area.get()}`);
    
    stopArea();
    width.set(100);
    output(`After unsubscribe (width=100): ${area.get()} (unchanged)`);

    output("");
    output("Key features:");
    output("• Chain .watch() to observe multiple signals");
    output("• .effect() subscribes to all watched signals");
    output("• .derived() creates computed values from multiple sources");
    output("• Both return unsubscribe functions for cleanup");
    output("• Subscribers receive no args - read signal.value directly");
}
