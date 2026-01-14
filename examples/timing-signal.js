import { createSignal, watch, timing } from "../src/xyn_signal.js";
import { tag, text } from "../src/xyn_html.js";

export const title = "Example 23: Timing Functions";

async function runTimingDemo(output) {
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
    output("=== Debounce Derived ===");
    output("Derived signal updates only after typing pause.");
    output("");
    
    const firstName4 = createSignal("John");
    const lastName4 = createSignal("Doe");
    
    const { signal: debouncedName } = watch(firstName4)
        .watch(lastName4)
        .derived(
            () => `${firstName4.value} ${lastName4.value}`,
            timing(300).debounce
        );
    
    output(`Initial derived value: "${debouncedName.value}"`);
    
    firstName4.value = "J";
    firstName4.value = "Ja";
    firstName4.value = "Jane";
    lastName4.value = "Smith";
    
    output(`Immediately after changes: "${debouncedName.value}" (not updated yet)`);
    
    await new Promise(r => setTimeout(r, 400));
    output(`After 300ms pause: "${debouncedName.value}"`);

    output("");
    output("=== Throttle Derived ===");
    output("Derived signal updates at most once per time window.");
    output("");
    
    const firstName5 = createSignal("John");
    const lastName5 = createSignal("Doe");
    
    const { signal: throttledName } = watch(firstName5)
        .watch(lastName5)
        .derived(
            () => `${firstName5.value} ${lastName5.value}`,
            timing(200).throttle
        );
    
    output(`Initial derived value: "${throttledName.value}"`);
    
    firstName5.value = "A";
    output(`After first change: "${throttledName.value}" (immediate)`);
    
    firstName5.value = "Al";
    firstName5.value = "Ali";
    firstName5.value = "Alic";
    firstName5.value = "Alice";
    output(`After rapid changes: "${throttledName.value}" (throttled)`);
    
    await new Promise(r => setTimeout(r, 250));
    lastName5.value = "Wonder";
    output(`After 200ms + change: "${throttledName.value}"`);

    output("");
    output("=== Delay Derived ===");
    output("Derived signal updates after fixed delay for each change.");
    output("");
    
    const firstName6 = createSignal("John");
    const lastName6 = createSignal("Doe");
    
    const { signal: delayedName } = watch(firstName6)
        .watch(lastName6)
        .derived(
            () => `${firstName6.value} ${lastName6.value}`,
            timing(200).delay
        );
    
    output(`Initial derived value: "${delayedName.value}"`);
    
    firstName6.value = "Bob";
    output(`Immediately after change: "${delayedName.value}" (not yet)`);
    
    await new Promise(r => setTimeout(r, 250));
    output(`After 200ms delay: "${delayedName.value}"`);
    
    output("");
    output("=== Summary ===");
    output("Effect: timing wraps the callback directly");
    output("  watch(a).watch(b).effect(timing(ms).debounce(fn))");
    output("");
    output("Derived: timing passed as wrappingFn argument");
    output("  watch(a).watch(b).derived(fn, timing(ms).debounce)");
}

export async function example23(output) {
    const replayButton = tag`button`;
    replayButton.children.add(text("Replay Demo"));
    replayButton.css.styles({
        padding: "8px 16px",
        marginBottom: "16px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px"
    });
    
    let isRunning = false;
    
    replayButton.event("click", async () => {
        if (isRunning) return;
        isRunning = true;
        
        const buttonEl = replayButton.render();
        buttonEl.textContent = "Running...";
        buttonEl.style.opacity = "0.6";
        
        output.clear();
        output.append(replayButton);
        
        await runTimingDemo(output);
        
        buttonEl.textContent = "Replay Demo";
        buttonEl.style.opacity = "1";
        isRunning = false;
    });
    
    output.append(replayButton);
    await runTimingDemo(output);
}
