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

// Update global theme button text
const updateGlobalThemeButton = () => {
    globalThemeButton.textContent = `${globalTheme.value === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}`;
};

updateGlobalThemeButton();

globalThemeButton.onclick = () => {
    const newTheme = globalTheme.value === 'light' ? 'dark' : 'light';
    globalTheme.value = newTheme;
    localStorage.setItem('xynhtml-theme', newTheme);
    applyGlobalTheme(newTheme);
    updateGlobalThemeButton();

    // Show confirmation message
    const confirmation = document.createElement('div');
    confirmation.style.cssText = `
        position: fixed; 
        top: 60px; 
        right: 10px; 
        z-index: 1001; 
        background: linear-gradient(135deg, #4CAF50, #45a049); 
        color: white; 
        padding: 12px 16px; 
        border-radius: 8px; 
        font-size: 14px; 
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        animation: slideInRight 0.3s ease-out;
    `;
    confirmation.textContent = `Theme switched to ${newTheme} mode`;
    document.body.appendChild(confirmation);

    setTimeout(() => {
        confirmation.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (document.body.contains(confirmation)) {
                document.body.removeChild(confirmation);
            }
        }, 300);
    }, 2500);
};

globalThemeSwitcher.appendChild(globalThemeButton);
document.body.appendChild(globalThemeSwitcher);

// Observer to apply theme to newly created example containers
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    const containers = node.classList?.contains('example-container')
                        ? [node]
                        : Array.from(node.querySelectorAll?.('.example-container') || []);

                    containers.forEach(container => {
                        const theme = globalTheme.value;
                        container.className = `example-container theme-${theme}`;
                        if (theme === 'dark') {
                            container.style.backgroundColor = '#2d2d2d';
                            container.style.borderColor = '#555';
                            container.style.color = '#ffffff';
                        } else {
                            container.style.backgroundColor = '#f9f9f9';
                            container.style.borderColor = '#ddd';
                            container.style.color = '#000000';
                        }
                    });
                }
            });
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem('xynhtml-theme')) {
        const systemTheme = getSystemTheme();
        globalTheme.value = systemTheme;
        applyGlobalTheme(systemTheme);
        updateGlobalThemeButton();
    }
});

// Apply initial theme
applyGlobalTheme(globalTheme.value);

// Lazy loading for examples
async function loadExamples() {
    try {
        // Example 1: Basic Signal Usage
        const { example1 } = await import('./basic-signal.js');
        await example1();

        setTimeout(async () => {
            // Example 2: Multiple Signals and Effects
            const { example2 } = await import('./multiple-signals.js');
            await example2();

            setTimeout(async () => {
                // Example 3: Derived Values
                const { example3 } = await import('./derived-values.js');
                await example3();

                setTimeout(async () => {
                    // Example 4: Complex State Management
                    const { example4 } = await import('./state-management.js');
                    await example4();

                    setTimeout(async () => {
                        // Example 5: Performance
                        const { example5 } = await import('./performance.js');
                        await example5();

                        setTimeout(async () => {
                            // Example 6: Subscription Management
                            const { example6 } = await import('./subscription-management.js');
                            await example6();

                            setTimeout(async () => {
                                // Example 7: Chained Derived Values
                                const { example7 } = await import('./chained-derived.js');
                                await example7();

                                setTimeout(async () => {
                                    // Example 8: Multiple Subscribers
                                    const { example8 } = await import('./multiple-subscribers.js');
                                    await example8();

                                    setTimeout(async () => {
                                        // Example 9: Direct Signal Subscription
                                        const { example9 } = await import('./direct-subscription.js');
                                        await example9();

                                        setTimeout(async () => {
                                            // Example 10: DOM Creation
                                            const { example10 } = await import('./dom-creation.js');
                                            await example10();

                                            setTimeout(async () => {
                                                // Example 11: Dynamic List
                                                const { example11 } = await import('./dynamic-list.js');
                                                await example11();

                                                setTimeout(async () => {
                                                    // Example 12: Conditional Rendering
                                                    const { example12 } = await import('./conditional-rendering.js');
                                                    await example12();

                                                    setTimeout(async () => {
                                                        // Example 13: Form Validation
                                                        const { example13 } = await import('./form-validation.js');
                                                        await example13();
                                                    }, 100);
                                                }, 100);
                                            }, 100);
                                        }, 100);
                                    }, 100);
                                }, 100);
                            }, 100);
                        }, 100);
                    }, 100);
                }, 100);
            }, 100);
        }, 100);

    } catch (error) {
        console.error('Error loading examples:', error);
    }
}

// Start loading examples when DOM is ready
document.addEventListener('DOMContentLoaded', loadExamples);