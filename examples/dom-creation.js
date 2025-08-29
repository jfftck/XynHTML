
import { signal, XynTag, text } from "../src/xyn_html.js";

export async function example10() {
    const output = function(message) {
        const container = document.getElementById('example10-output');
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };

    const buttonText = signal("Click me!");
    const clickCount = signal(0);

    // Create a button with reactive text
    const button = new XynTag("button");
    button.children = [text`${buttonText}`];

    // Add click handler
    const buttonElement = button.render();
    buttonElement.onclick = () => {
        clickCount.value++;
        buttonText.value = `Clicked ${clickCount.value} times`;
    };

    // Create a div container and mount using createRoot
    const container = new XynTag("div");
    container.children = [button];
    container.render().className = "example-container";

    // Append to document body directly
    const outputContainer = document.getElementById('example10-output');
    if (outputContainer) {
        output("Interactive button created:");
        outputContainer.appendChild(container.render());
    }
}
