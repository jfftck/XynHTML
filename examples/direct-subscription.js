
import { signal } from "../src/xyn_html.js";
import { createOutput } from "./index.js";

export async function example9() {
    const output = createOutput('example9-output');

    const directSignal = signal("initial");

    const directSubscriber1 = () => {
        output("Direct subscriber 1: " + directSignal.value);
    };
    const directSubscriber2 = () => {
        output("Direct subscriber 2: " + directSignal.value);
    };

    // Subscribe directly to the signal
    directSignal.subscribe(directSubscriber1);
    directSignal.subscribe(directSubscriber2);

    directSignal.value = "first update";
    directSignal.value = "second update";

    // Unsubscribe one subscriber
    directSignal.unsubscribe(directSubscriber1);
    output("Unsubscribed first subscriber");

    directSignal.value = "third update";
}
