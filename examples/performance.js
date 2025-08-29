
import { signal } from "../src/xyn_html.js";

export async function example5() {
    const output = function(message) {
        const container = document.getElementById('example5-output');
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };

    const performanceSignal = signal("test");
    let updateCount = 0;

    const perfSubscriber = () => {
        updateCount++;
        output(`Performance signal updated ${updateCount} times, value: ${performanceSignal.value}`);
    };
    performanceSignal.subscribe(perfSubscriber);

    // Setting same value (should not trigger update)
    performanceSignal.value = "test";
    output("Set same value 'test' - no update triggered");

    // Setting different value (should trigger update)
    performanceSignal.value = "new value";
    output("Set different value 'new value' - update triggered");
}
