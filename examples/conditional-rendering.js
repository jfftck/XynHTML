

import { signal, XynTag, text, XynSwitch, effect, derived } from "../src/xyn_html.js";
import { createOutput } from "./index.js";

export async function example12() {
    const output = createOutput('example12-output');

    // Get global theme from examples/index.js or create fallback
    const globalTheme = signal("light");
    const isVisible = signal(true);
    const localTheme = signal(globalTheme.value);
    const message = signal("Hello from XynHTML!");

    // Effect to sync local theme with global theme changes
    const localThemeSyncEffect = effect(() => {
        localTheme.value = globalTheme.value;
    }, [globalTheme]);

    // Create a styled card
    const card = new XynTag("div");
    const cardElement = card.render();
    cardElement.className = "example-container";
    cardElement.style.cssText = `
        padding: 20px;
        margin: 10px;
        border-radius: 8px;
        transition: all 0.3s ease;
        border: 2px solid #007acc;
    `;

    // Add content to card
    const cardTitle = new XynTag("h3");
    cardTitle.children = [text`Interactive Card`];
    const cardContent = new XynTag("p");
    cardContent.children = [text`${message}`];

    cardElement.appendChild(cardTitle.render());
    cardElement.appendChild(cardContent.render());

    // Create XynSwitch for conditional rendering
    const cardSwitch = new XynSwitch(isVisible, new Map([
        [true, card]
    ]));

    // Create toggle button
    const toggleButton = new XynTag("button");
    const toggleButtonElement = toggleButton.render();
    toggleButtonElement.style.cssText = "padding: 8px 16px; margin: 5px; cursor: pointer;";

    // Update button text based on visibility
    const toggleTextEffect = effect(() => {
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

    // Effect to handle card theme styling
    const cardTheme = derived(() => {
        if (localTheme.value === "dark") {
            return {
                backgroundColor: "#2d2d2d",
                color: "#ffffff",
                borderColor: "#666"
            };
        } else {
            return {
                backgroundColor: "#f0f8ff",
                color: "#000000",
                borderColor: "#007acc"
            };
        }
    }, [localTheme]);
    
    effect(() => {
        cardElement.style.backgroundColor = cardTheme.value.backgroundColor;
        cardElement.style.color = cardTheme.value.color;
        cardElement.style.borderColor = cardTheme.value.borderColor;
    }, [cardTheme]);

    // Create container for this example
    const conditionalContainer = new XynTag("div");
    const conditionalContainerElement = conditionalContainer.render();
    conditionalContainerElement.className = "example-container";
    conditionalContainerElement.style.cssText = "margin: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;";

    conditionalContainerElement.appendChild(toggleButtonElement);
    conditionalContainerElement.appendChild(themeButtonElement);

    // Render the switch and append it to the container
    const switchContainer = document.createElement("div");
    const switchElement = cardSwitch.render();
    switchContainer.appendChild(switchElement);
    conditionalContainerElement.appendChild(switchContainer);

    const outputContainer = document.getElementById('example12-output');
    if (outputContainer) {
        output("Conditional rendering with XynSwitch created below:");
        outputContainer.appendChild(conditionalContainerElement);
    }
}

