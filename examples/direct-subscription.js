
import { signal } from "../src/xyn_html.js";

export async function example9() {
    const output = function(message) {
        const container = document.getElementById('example9-output');
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };

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
