import { signal, tag } from "../src/xyn_html.js";

export const title = "Example 9: Direct Signal Subscription";

export async function example9(output) {
    const directSignal = signal("initial");

    output.signalUpdate("directSignal", directSignal);

    const directSubscriber1 = () => {
        output("Direct subscriber 1: " + directSignal.value);
    };
    const directSubscriber2 = () => {
        output("Direct subscriber 2: " + directSignal.value);
    };

    // Subscribe directly to the signal
    directSignal.subscribe(directSubscriber1);
    directSignal.subscribe(directSubscriber2);

    // Update the signal value
    directSignal.value = "first update";
    directSignal.value = "second update";

    // Unsubscribe one subscriber
    directSignal.unsubscribe(directSubscriber1);
    output("Unsubscribed first subscriber");

    // Update the signal value again
    directSignal.value = "third update";
}
