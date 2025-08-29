
import { signal, effect } from "../src/xyn_html.js";

export async function example2() {
    const output = function(message) {
        const container = document.getElementById('example2-output');
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };

    const firstName = signal("John");
    const lastName = signal("Doe");

    // Effect that runs when either signal changes
    const unsubscribeEffect = effect(() => {
        output(`Full name: ${firstName.value} ${lastName.value}`);
    }, [firstName, lastName]);

    firstName.value = "Jane";
    lastName.value = "Smith";
}
