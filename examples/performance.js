
import { signal, tag } from "../src/xyn_html.js";

export const title = "Example 5: Performance - No Unnecessary Updates";

export async function example5(output) {
    const performanceSignal = signal("test");
    let updateCount = 0;

    output.signalUpdate("performanceSignal", performanceSignal);

    const perfSubscriber = () => {
        output(`Performance signal updated ${updateCount++} times, value: ${performanceSignal.value}`);
    };
    performanceSignal.subscribe(perfSubscriber);

    // Setting same value (should not trigger update)
    performanceSignal.value = "test";
    output("Set same value 'test' - no update triggered");

    // Setting different value (should trigger update)
    performanceSignal.value = "new value";
    output("Set different value 'new value' - update triggered");
}
