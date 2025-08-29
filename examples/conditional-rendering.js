
import { signal, XynTag, text, XynSwitch, effect } from "../src/xyn_html.js";

export async function example12() {
    const output = function(message) {
        const container = document.getElementById('example12-output');
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };

    const isVisible = signal(true);
    const message = signal("Hello from XynHTML!");

    // Create a styled card
    const card = new XynTag("div");
    const cardTitle = new XynTag("h3");
    cardTitle.children = [text`Interactive Card`];
    const cardContent = new XynTag("p");
    cardContent.children = [text`${message}`];

    card.children = [cardTitle, cardContent];
    const cardElement = card.render();
    cardElement.className = "interactive-card";

    // Create XynSwitch for conditional rendering (only show card when visible)
    const cardSwitch = new XynSwitch(isVisible, new Map([
        [true, card]
    ]));

    // Create toggle button
    const toggleButton = new XynTag("button");
    toggleButton.children = [text`Toggle Visibility`];
    const toggleElement = toggleButton.render();
    toggleElement.className = "form-button";
    toggleElement.onclick = () => {
        isVisible.value = !isVisible.value;
    };

    // Create status display
    const statusDiv = new XynTag("div");
    const statusElement = statusDiv.render();
    statusElement.className = "status-display";
    
    // Effect to update toggle button text and status
    effect(() => {
        toggleElement.textContent = isVisible.value ? "Hide Card" : "Show Card";
        statusElement.textContent = isVisible.value ? "Card is visible" : "Card is hidden";
        statusElement.style.color = isVisible.value ? "#28a745" : "#6c757d";
    }, [isVisible]);

    const container = new XynTag("div");
    container.children = [toggleButton, statusDiv, cardSwitch];
    const containerElement = container.render();
    containerElement.className = "example-container";

    const outputContainer = document.getElementById('example12-output');
    if (outputContainer) {
        output("Conditional rendering with XynSwitch:");
        outputContainer.appendChild(containerElement);
    }
}
