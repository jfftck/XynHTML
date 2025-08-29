
import { signal } from "../src/xyn_html.js";
import { createOutput } from "./index.js";

export async function example1() {
    const output = createOutput('example1-output');

    const counter = signal(0);
    output("Initial counter value: " + counter.value);

    // Subscribe to changes - use signal's subscribe method
    const counterSubscriber = () => {
        output("Counter changed to: " + counter.value);
    };
    counter.subscribe(counterSubscriber);

    // Update the signal value
    counter.value = 5;
    counter.value = 10;

    // Unsubscribe using the signal's unsubscribe method
    counter.unsubscribe(counterSubscriber);
}
