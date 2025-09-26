import { signal, tag } from "../src/xyn_html.js";

export const title = "Example 8: Multiple Subscribers to One Signal";

export async function example8(output) {
    const sharedSignal = signal("shared");

    output.signalUpdate("sharedSignal", sharedSignal);

    const subscriber1 = () => {
        output("Subscriber 1 received: " + sharedSignal.value);
    };
    const subscriber2 = () => {
        output("Subscriber 2 received: " + sharedSignal.value);
    };
    const subscriber3 = () => {
        output("Subscriber 3 received: " + sharedSignal.value);
    };

    sharedSignal.subscribe(subscriber1);
    sharedSignal.subscribe(subscriber2);
    sharedSignal.subscribe(subscriber3);

    sharedSignal.value = "updated value";

    // Remove one subscriber
    sharedSignal.unsubscribe(subscriber2);
    output("Removed subscriber 2");

    sharedSignal.value = "second update";
}
