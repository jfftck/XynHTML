import { xyn, signal, tag, text } from "../src/xyn_html.js";

export const title = "Example 10: DOM Creation with Xyn";

export async function example10(output) {
    const buttonText = signal(" me!");
    const clickCount = signal(0);

    // Create a button with reactive text
    const container = xyn`div.example-container {
        button@click=${() => {
            buttonText.value = `ed ${++clickCount.value} times`;
        }} { ""Click${buttonText}"" }
        button@click=${() => {
            clickCount.value = 0;
            buttonText.value = " me!";
        }} { ""Reset"" }
    }`;

    // Append to document body directly
    output("Interactive button created:");
    output.append(container);
}

async function oldexample10(output) {
    const buttonText = signal("Click me!");
    const clickCount = signal(0);

    // Create a button with reactive text
    const incButton = tag`button@click=${() => {
        clickCount.value++;
        buttonText.value = `Clicked ${clickCount.value} times`;
    }}`;
    incButton.children.add(text`${buttonText}`);

    const clearButton = tag`button@click=${() => {
        clickCount.value = 0;
        buttonText.value = "Click me!";
    }}`;
    clearButton.children.add(text`Reset`);

    // Create a div container and mount using createRoot
    const container = tag`div.example-container`;
    container.children.add(incButton, clearButton);

    // Append to document body directly
    output("Interactive button created:");
    output.append(container);
}
