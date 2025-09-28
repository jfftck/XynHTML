import { tag, signal, text } from "../src/xyn_html.js";

export const title = "Example 10: DOM Creation with XynTag and createMount";

export async function example10(output) {
    const buttonText = signal("Click me!");
    const clickCount = signal(0);

    // Create a button with reactive text
    const incButton = tag`button`;
    incButton.children.add(text`${buttonText}`);

    // Add click handler
    incButton.event("click", () => {
        clickCount.value++;
        buttonText.value = `Clicked ${clickCount.value} times`;
    });

    const clearButton = tag`button`;
    clearButton.children.add(text`Reset`);
    clearButton.event("click", () => {
        clickCount.value = 0;
        buttonText.value = "Click me!";
    });

    // Create a div container and mount using createRoot
    const container = tag`div.example-container`;
    container.children.add(incButton, clearButton);

    // Append to document body directly
    output("Interactive button created:");
    output.append(container);
}
