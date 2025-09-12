
import { t, signal, text } from "../src/xyn_html.js";
import { createOutput } from "./index.js";

export async function example10() {
    const output = createOutput('example10-output');

    const buttonText = signal("Click me!");
    const clickCount = signal(0);

    // Create a button with reactive text
    const button = t`button`;
    button.children.add(text`${buttonText}`);

    // Add click handler
    button.event("click", () => {
        clickCount.value++;
        buttonText.value = `Clicked ${clickCount.value} times`;
    });

    // Create a div container and mount using createRoot
    const container = t`div`;
    container.children.add(button);
    container.css.classes`example-container`;

    // Append to document body directly
    const outputContainer = document.getElementById('example10-output');
    if (outputContainer) {
        output("Interactive button created:");
        outputContainer.appendChild(container.render());
    }
}
