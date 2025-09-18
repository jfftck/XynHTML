import { signal, derived, text, XynSwitch, tag } from "../src/xyn_html.js";

export const title = "Example 12: Conditional Rendering with XynSwitch";

export async function example12(output) {
    // Get global theme from examples/index.js or create fallback
    const globalTheme = window.globalTheme || signal("light");
    const isVisible = signal(true);
    const localTheme = signal(globalTheme.value);
    const message = signal("Hello from XynHTML!");

    // Create a styled card
    const card = tag`div`;

    // Add content to card
    const cardTitle = tag`h3`;
    cardTitle.children.add(text`Interactive Card`);
    const cardContent = tag`p`;
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
    const toggleButton = tag`button`;
    const buttonText = derived(() => isVisible.value ? "Hide Card" : "Show Card", [isVisible]);
    toggleButton.children.add(text`${buttonText}`);
    toggleButton.css.styles({
        padding: "8px 16px",
        margin: "5px",
        cursor: "pointer"
    });

    toggleButton.event("click", () => {
        isVisible.value = !isVisible.value;
    });

    // Create local theme toggle button
    const themeButton = tag`button`;
    themeButton.css.styles({
        padding: "8px 16px",
        margin: "5px",
        cursor: "pointer"
    });
    themeButton.children.add(text`Local Theme: ${localTheme}`);
    themeButton.event("click", () => {
        localTheme.value = localTheme.value === "light" ? "dark" : "light";
    });

    // Apply conditional styling based on local theme using CSS classes
    card.css.classes`${derived(() => `local-theme-${localTheme.value}`, [localTheme])}`;

    // Create container for this example
    const conditionalContainer = tag`div`;
    conditionalContainer.css.classes`example-container`;
    conditionalContainer.css.styles({
        margin: "20px",
        padding: "15px",
        border: "1px solid #ccc",
        "border-radius": "5px"
    });

    conditionalContainer.children.add(
        toggleButton,
        themeButton
    );

    // Render the switch and append it to the container
    const switchContainer = tag`div`;
    switchContainer.children.add(cardSwitch);
    conditionalContainer.children.add(switchContainer);

    output("Conditional rendering with XynSwitch created below:");
    output.append(conditionalContainer);
}