import { signal, effect } from "../src/xyn_html.js";

// Utility function to create output in specific containers
export function createOutput(containerId) {
    return function(message) {
        const container = document.getElementById(containerId);
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };
}

// Global theme management
function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const savedTheme = localStorage.getItem('xynhtml-theme') || getSystemTheme();
const globalTheme = signal(savedTheme);

// Apply global theme
function applyGlobalTheme(theme) {
    const isDark = theme === 'dark';

    // Set data attribute for CSS targeting
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    document.documentElement.style.setProperty('--color-background', isDark ? '#121212' : '#f8f8f8');
    document.body.style.backgroundColor = isDark ? '#121212' : '#f8f8f8';
    document.body.style.color = isDark ? '#ffffff' : '#000000';

    // Update all example containers
    document.querySelectorAll('.example-container').forEach(container => {
        if (isDark) {
            container.style.backgroundColor = '#2d2d2d';
            container.style.borderColor = '#666';
            container.style.color = '#ffffff';
        } else {
            container.style.backgroundColor = '#f9f9f9';
            container.style.borderColor = '#ddd';
            container.style.color = '#000000';
        }
    });

    // Update form elements
    document.querySelectorAll('input, button').forEach(element => {
        if (element.type !== 'button' && element.tagName !== 'BUTTON') {
            if (isDark) {
                element.style.backgroundColor = '#3d3d3d';
                element.style.color = '#ffffff';
                element.style.borderColor = '#666';
            } else {
                element.style.backgroundColor = '#ffffff';
                element.style.color = '#000000';
                element.style.borderColor = '#ccc';
            }
        }
    });
}

// Create global theme switcher at top of page
const globalThemeSwitcher = document.createElement('div');
globalThemeSwitcher.className = 'theme-switcher';

const globalThemeButton = document.createElement('button');
globalThemeButton.type = "button";
globalThemeButton.ariaLabel = "Toggle theme";
globalThemeButton.title = "Toggle theme";
globalThemeButton.className = "theme-toggle";
globalThemeButton.innerHTML = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    class="theme-toggle__within"
    height="1em"
    width="1em"
    viewBox="0 0 32 32"
    fill="currentColor"
  >
    <clipPath id="theme-toggle__within__clip">
      <path d="M0 0h32v32h-32ZM6 16A1 1 0 0026 16 1 1 0 006 16" />
    </clipPath>
    <g clip-path="url(#theme-toggle__within__clip)">
      <path d="M30.7 21.3 27.1 16l3.7-5.3c.4-.5.1-1.3-.6-1.4l-6.3-1.1-1.1-6.3c-.1-.6-.8-.9-1.4-.6L16 5l-5.4-3.7c-.5-.4-1.3-.1-1.4.6l-1 6.3-6.4 1.1c-.6.1-.9.9-.6 1.3L4.9 16l-3.7 5.3c-.4.5-.1 1.3.6 1.4l6.3 1.1 1.1 6.3c.1.6.8.9 1.4.6l5.3-3.7 5.3 3.7c.5.4 1.3.1 1.4-.6l1.1-6.3 6.3-1.1c.8-.1 1.1-.8.7-1.4zM16 25.1c-5.1 0-9.1-4.1-9.1-9.1 0-5.1 4.1-9.1 9.1-9.1s9.1 4.1 9.1 9.1c0 5.1-4 9.1-9.1 9.1z" />
    </g>
    <path
      class="theme-toggle__within__circle"
      d="M16 7.7c-4.6 0-8.2 3.7-8.2 8.2s3.6 8.4 8.2 8.4 8.2-3.7 8.2-8.2-3.6-8.4-8.2-8.4zm0 14.4c-3.4 0-6.1-2.9-6.1-6.2s2.7-6.1 6.1-6.1c3.4 0 6.1 2.9 6.1 6.2s-2.7 6.1-6.1 6.1z"
    />
    <path
      class="theme-toggle__within__inner"
      d="M16 9.5c-3.6 0-6.4 2.9-6.4 6.4s2.8 6.5 6.4 6.5 6.4-2.9 6.4-6.4-2.8-6.5-6.4-6.5z"
    />
  </svg>
`;

globalThemeButton.onclick = () => {
    globalTheme.value = globalTheme.value === 'light' ? 'dark' : 'light';
};

effect(() => {
    localStorage.setItem('xynhtml-theme', globalTheme.value);
    applyGlobalTheme(globalTheme.value);
    globalTheme.value === "light" ?
        globalThemeButton.classList.add("theme-toggle--toggled") :
        globalThemeButton.classList.remove("theme-toggle--toggled");
}, [globalTheme]);

globalThemeSwitcher.appendChild(globalThemeButton);
document.body.appendChild(globalThemeSwitcher);

// // Observer to apply theme to newly created example containers
// const observer = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//         if (mutation.type === 'childList') {
//             mutation.addedNodes.forEach((node) => {
//                 if (node.nodeType === 1) { // Element node
//                     const containers = node.classList?.contains('example-container')
//                         ? [node]
//                         : Array.from(node.querySelectorAll?.('.example-container') || []);

//                     containers.forEach(container => {
//                         const theme = globalTheme.value;
//                         container.className = `example-container theme-${theme}`;
//                         if (theme === 'dark') {
//                             container.style.backgroundColor = '#2d2d2d';
//                             container.style.borderColor = '#555';
//                             container.style.color = '#ffffff';
//                         } else {
//                             container.style.backgroundColor = '#f9f9f9';
//                             container.style.borderColor = '#ddd';
//                             container.style.color = '#000000';
//                         }
//                     });
//                 }
//             });
//         }
//     });
// });

// observer.observe(document.body, {
//     childList: true,
//     subtree: true
// });

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem('xynhtml-theme')) {
        const systemTheme = getSystemTheme();
        globalTheme.value = systemTheme;
        applyGlobalTheme(systemTheme);
        updateGlobalThemeButton();
    }
});

// Lazy loading for examples
async function loadExamples() {
    try {
        // Example 1: Basic Signal Usage
        const { example1 } = await import('./basic-signal.js');
        await example1();

        // Example 2: Multiple Signals and Effects
        const { example2 } = await import('./multiple-signals.js');
        await example2();

        // Example 3: Derived Values
        const { example3 } = await import('./derived-values.js');
        await example3();

        // Example 4: Complex State Management
        const { example4 } = await import('./state-management.js');
        await example4();

        // Example 5: Performance
        const { example5 } = await import('./performance.js');
        await example5();

        // Example 6: Subscription Management
        const { example6 } = await import('./subscription-management.js');
        await example6();

        // Example 7: Chained Derived Values
        const { example7 } = await import('./chained-derived.js');
        await example7();

        // Example 8: Multiple Subscribers
        const { example8 } = await import('./multiple-subscribers.js');
        await example8();

        // Example 9: Direct Signal Subscription
        const { example9 } = await import('./direct-subscription.js');
        await example9();

        // Example 10: DOM Creation
        const { example10 } = await import('./dom-creation.js');
        await example10();

        // Example 11: Dynamic List
        const { example11 } = await import('./dynamic-list.js');
        await example11();

        // Example 12: Conditional Rendering
        const { example12 } = await import('./conditional-rendering.js');
        await example12();

        // Example 13: Form Validation
        const { example13 } = await import('./form-validation.js');
        await example13();
    } catch (error) {
        console.error('Error loading examples:', error);
    }
}

// Start loading examples when DOM is ready and then clean up the event listener
const loadExamplesOnReady = async () => {
    await loadExamples();
    applyGlobalTheme(globalTheme.value);
    document.removeEventListener('DOMContentLoaded', loadExamplesOnReady);
}
document.addEventListener('DOMContentLoaded', loadExamplesOnReady);