
import { signal, tag } from "../src/xyn_html.js";

export const title = "Example 1: Basic Signal Usage";

export async function example1(output) {
    const counter = signal(0);
    output.signalUpdate("counter", counter);

    // Subscribe to changes - use signal's subscribe method
    const counterSubscriber = (preValue) => {
        if (preValue === undefined) {
            output("Initial counter value: " + counter.value);

            return;
        }
        output("Counter changed to: " + counter.value);
    };
    counter.subscribe(counterSubscriber);

    // Update the signal value
    counter.value = 5;
    counter.value = 10;

    // Unsubscribe using the signal's unsubscribe method
    counter.unsubscribe(counterSubscriber);
}
