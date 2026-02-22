import { signal } from "../src/xyn_html.js";
import { createSignal } from "../src/xyn_signal.js";

export const title = "Example 18: Legacy signal() vs createSignal()";

export async function example18(output) {
    output("=== Legacy signal() ===");
    const legacyCounter = signal(0);
    
    const legacySubscriber = ({ previousValue }) => {
        if (previousValue === undefined) {
            output(`Legacy initial: ${legacyCounter.value}`);
            return;
        }
        output(`Legacy changed: ${previousValue} → ${legacyCounter.value}`);
    };
    legacyCounter.subscribe(legacySubscriber);
    
    legacyCounter.value = 5;
    legacyCounter.value = 10;
    legacyCounter.unsubscribe(legacySubscriber);

    output("");
    output("=== New createSignal() ===");
    const newCounter = createSignal(0);
    
    const unsubscribe = newCounter.subscribe(() => {
        output(`New value: ${newCounter.get()}`);
    });
    
    newCounter.set(5);
    newCounter.set(10);
    unsubscribe();

    output("");
    output("Key differences:");
    output("• Legacy: subscriber receives {previousValue}, access value via signal.value");
    output("• New: subscriber is called with no args, read signal.get() directly");
    output("• Legacy: unsubscribe via signal.unsubscribe(fn)");
    output("• New: subscribe() returns unsubscribe function");
    output("• New: subscribe() calls subscriber immediately on registration");
}
