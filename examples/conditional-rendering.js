import { signal, derived, XynTag, text, XynSwitch, effect } from "../src/xyn_html.js";
import { createOutput } from "./index.js";

export async function example12() {
    const output = createOutput('example12-output');

    // Get global theme from examples/index.js or create fallback
    const globalTheme = window.globalTheme || signal("light");
    const isVisible = signal(true);
    const localTheme = signal(globalTheme.value);
    const message = signal("Hello from XynHTML!");

    // Create a styled card
    const card = new XynTag("div");

    // Add content to card
    const cardTitle = new XynTag("h3");
    cardTitle.children.add(text`Interactive Card`);
    const cardContent = new XynTag("p");
    cardContent.children.add(
        text`${message}`
    );

    card.children.add(cardTitle, cardContent);

    // Create a styled card
    card.css.classes`example-container`;
    card.css.styles({
        padding: "20px",
        margin: "10px",
        "border-radius": "8px",
        transition: "all 0.3s ease",
        border: "2px solid #007acc"
    });

    // Create XynSwitch for conditional rendering
    const cardSwitch = new XynSwitch(isVisible, new Map([
        [true, card]
    ]));

    // Create toggle button
    const toggleButton = new XynTag("button");
    const toggleButtonElement = toggleButton.render();
    toggleButtonElement.style.cssText = "padding: 8px 16px; margin: 5px; cursor: pointer;";

    // Update button text based on visibility
    effect(() => {
        toggleButtonElement.textContent = isVisible.value ? "Hide Card" : "Show Card";
    }, [isVisible]);

    toggleButtonElement.onclick = () => {
        isVisible.value = !isVisible.value;
    };

    // Create local theme toggle button
    const themeButton = new XynTag("button");
    const themeButtonElement = themeButton.render();
    themeButtonElement.style.cssText = "padding: 8px 16px; margin: 5px; cursor: pointer;";
    themeButtonElement.textContent = "Toggle Local Theme";
    themeButtonElement.onclick = () => {
        localTheme.value = localTheme.value === "light" ? "dark" : "light";
    };

    // Apply conditional styling based on local theme using CSS classes
    card.css.classes`${derived(() => `local-theme-${localTheme.value}`, [localTheme])}`;

    // Create container for this example
    const conditionalContainer = new XynTag("div");
    const conditionalContainerElement = conditionalContainer.render();
    conditionalContainerElement.className = "example-container";
    conditionalContainerElement.style.cssText = "margin: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;";

    conditionalContainerElement.appendChild(toggleButtonElement);
    conditionalContainerElement.appendChild(themeButtonElement);

    // Render the switch and append it to the container
    const switchContainer = document.createElement("div");
    const switchElement = cardSwitch.render(switchContainer);
    switchContainer.appendChild(switchElement);
    conditionalContainerElement.appendChild(switchContainer);

    const outputContainer = document.getElementById('example12-output');
    if (outputContainer) {
        output("Conditional rendering with XynSwitch created below:");
        outputContainer.appendChild(conditionalContainerElement);
    }
}