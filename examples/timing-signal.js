import { createSignal, watch, timing } from "../src/xyn_signal.js";

export const title = "Example 23: Timing Functions";

export async function example23(output) {
    output("=== Debounce Effect ===");
    output("Debounce waits for pause in activity before executing.");
    output("(Only the last value after 300ms pause is processed)");
    output("");
    
    const firstName1 = createSignal("John");
    const lastName1 = createSignal("Doe");
    
    const debouncedEffect = timing(300).debounce(() => {
        output(`Debounced: Full name is "${firstName1.value} ${lastName1.value}"`);
    });
    
    watch(firstName1).watch(lastName1).effect(debouncedEffect);
    
    firstName1.value = "J";
    firstName1.value = "Ja";
    firstName1.value = "Jan";
    firstName1.value = "Jane";
    lastName1.value = "S";
    lastName1.value = "Sm";
    lastName1.value = "Smi";
    lastName1.value = "Smith";
    
    await new Promise(r => setTimeout(r, 400));
    output("(Only one output after typing stopped)");
    
    output("");
    output("=== Throttle Effect ===");
    output("Throttle limits execution to once per time window.");
    output("(First change executes immediately, then at most once per 200ms)");
    output("");
    
    const firstName2 = createSignal("John");
    const lastName2 = createSignal("Doe");
    
    const throttledEffect = timing(200).throttle(() => {
        output(`Throttled: Full name is "${firstName2.value} ${lastName2.value}"`);
    });
    
    watch(firstName2).watch(lastName2).effect(throttledEffect);
    
    firstName2.value = "J";
    firstName2.value = "Ja";
    firstName2.value = "Jan";
    firstName2.value = "Jane";
    
    await new Promise(r => setTimeout(r, 250));
    
    lastName2.value = "S";
    lastName2.value = "Sm";
    lastName2.value = "Smith";
    
    await new Promise(r => setTimeout(r, 250));
    output("(Limited outputs - first change + one per 200ms window)");
    
    output("");
    output("=== Delay Effect ===");
    output("Delay executes each change after a fixed time.");
    output("(Every change triggers, but after 200ms delay)");
    output("");
    
    const firstName3 = createSignal("John");
    const lastName3 = createSignal("Doe");
    
    const delayedEffect = timing(200).delay(() => {
        output(`Delayed: Full name is "${firstName3.value} ${lastName3.value}"`);
    });
    
    watch(firstName3).watch(lastName3).effect(delayedEffect);
    
    output("Setting firstName to 'Alice'...");
    firstName3.value = "Alice";
    output("Setting lastName to 'Wonder'...");
    lastName3.value = "Wonder";
    output("(Outputs appear after 200ms delay)");
    
    await new Promise(r => setTimeout(r, 300));
    
    output("");
    output("=== Comparison Summary ===");
    output("• debounce: Waits for inactivity, then fires once");
    output("  Use for: Search inputs, form validation, resize handlers");
    output("• throttle: Fires immediately, then limits rate");
    output("  Use for: Scroll events, mousemove, continuous updates");
    output("• delay: Fires each time, but after a delay");
    output("  Use for: Staggered animations, delayed notifications");
}
