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

// Make globalTheme available to other modules
window.globalTheme = globalTheme;

// Highlight.js theme configurations
const highlightThemes = {
    light: [
        { name: 'Default', value: 'default' },
        { name: 'GitHub', value: 'github' },
        { name: 'Atom One Light', value: 'atom-one-light' },
        { name: 'VS Code Light', value: 'vs' },
        { name: 'Lightfair', value: 'lightfair' },
        { name: 'Grayscale', value: 'grayscale' },
        { name: 'Brown Paper', value: 'brown-paper' },
        { name: 'School Book', value: 'school-book' },
        { name: 'Foundation', value: 'foundation' },
        { name: 'Googlecode', value: 'googlecode' }
    ],
    dark: [
        { name: 'Dark', value: 'dark' },
        { name: 'Monokai', value: 'monokai' },
        { name: 'Nord', value: 'nord' },
        { name: 'Atom One Dark', value: 'atom-one-dark' },
        { name: 'VS Code Dark', value: 'vs2015' },
        { name: 'Obsidian', value: 'obsidian' },
        { name: 'Tokyo Night Dark', value: 'tokyo-night-dark' },
        { name: 'Monokai Sublime', value: 'monokai-sublime' },
        { name: 'Arta', value: 'arta' },
        { name: 'Codepen Embed', value: 'codepen-embed' }
    ]
};

// Syntax highlighting theme management
const savedSyntaxTheme = localStorage.getItem('xynhtml-syntax-theme');
const syntaxTheme = signal(savedSyntaxTheme || (getSystemTheme() === 'dark' ? 'monokai' : 'github'));

// Track if this is the initial load to prevent fade effects
const isInitialLoad = signal(true);

function applySyntaxTheme(themeName, skipTransition = false) {
    const themeLink = document.getElementById('highlight-theme');
    if (!themeLink) return;

    const codeBlocks = document.querySelectorAll('pre code');
    if (codeBlocks.length === 0) return;

    // Set up the new theme URL
    const newThemeUrl = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeName}.min.css`;
    
    // Function to re-highlight and fade back in
    const reHighlightAndFadeIn = () => {
        codeBlocks.forEach(block => {
            // Clear existing highlighting classes and data-highlighted attribute
            block.className = block.className.replace(/hljs-\S+/g, '');
            block.removeAttribute('data-highlighted');
            delete block.dataset.highlighted;
            hljs.highlightElement(block);
        });
        
        // Only fade back in if not skipping transitions
        if (!skipTransition) {
            setTimeout(() => {
                codeBlocks.forEach(block => {
                    block.style.opacity = '1';
                });
            }, 50);
        }
    };

    // Count how many blocks have completed their fade out animation
    let fadeOutCount = 0;
    const totalBlocks = codeBlocks.length;

    // Function to handle when all fade outs are complete
    const onAllFadeOutsComplete = () => {
        // Apply new theme
        themeLink.href = newThemeUrl;
        
        // Wait for the CSS to load before re-highlighting
        themeLink.onload = () => {
            setTimeout(reHighlightAndFadeIn, 50);
        };
        
        // Error handling for failed theme loads
        themeLink.onerror = () => {
            console.warn(`Failed to load theme: ${themeName}, using default`);
            themeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css';
            setTimeout(reHighlightAndFadeIn, 50);
        };
        
        // Fallback for browsers that don't support onload for link elements
        setTimeout(() => {
            if (fadeOutCount === totalBlocks) {
                reHighlightAndFadeIn();
            }
        }, 200);
    };

    // Skip transitions if this is initial load or explicitly requested
    if (skipTransition) {
        onAllFadeOutsComplete();
        return;
    }

    // Fade out all code blocks and wait for animation to complete
    codeBlocks.forEach(block => {
        block.style.transition = 'opacity 0.2s ease-in-out';
        
        const handleTransitionEnd = (event) => {
            if (event.propertyName === 'opacity' && event.target === block) {
                fadeOutCount++;
                block.removeEventListener('transitionend', handleTransitionEnd);
                
                // If all blocks have faded out, apply the theme change
                if (fadeOutCount === totalBlocks) {
                    onAllFadeOutsComplete();
                }
            }
        };
        
        block.addEventListener('transitionend', handleTransitionEnd);
        block.style.opacity = '0';
    });

    // Fallback timeout in case transition events don't fire
    setTimeout(() => {
        if (fadeOutCount < totalBlocks) {
            console.warn('Fade animation timeout, applying theme change');
            onAllFadeOutsComplete();
        }
    }, 500);
}

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

// Create syntax highlighting theme selector
const syntaxThemeSelector = document.createElement('select');
syntaxThemeSelector.className = 'syntax-theme-selector';
syntaxThemeSelector.title = 'Select syntax highlighting theme';

function updateSyntaxThemeDropdown() {
    const allThemes = [...highlightThemes.light, ...highlightThemes.dark];
    
    syntaxThemeSelector.innerHTML = '';
    
    // Add light themes group
    const lightGroup = document.createElement('optgroup');
    lightGroup.label = 'Light Themes';
    highlightThemes.light.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.value;
        option.textContent = theme.name;
        if (theme.value === syntaxTheme.value) {
            option.selected = true;
        }
        lightGroup.appendChild(option);
    });
    
    // Add dark themes group
    const darkGroup = document.createElement('optgroup');
    darkGroup.label = 'Dark Themes';
    highlightThemes.dark.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.value;
        option.textContent = theme.name;
        if (theme.value === syntaxTheme.value) {
            option.selected = true;
        }
        darkGroup.appendChild(option);
    });
    
    syntaxThemeSelector.appendChild(lightGroup);
    syntaxThemeSelector.appendChild(darkGroup);
}

syntaxThemeSelector.onchange = (e) => {
    syntaxTheme.value = e.target.value;
    localStorage.setItem('xynhtml-syntax-theme', syntaxTheme.value);
};

// Global theme effect - only triggers on actual changes
effect(() => {
    localStorage.setItem('xynhtml-theme', globalTheme.value);
    applyGlobalTheme(globalTheme.value);
    if (globalTheme.value === "light") {
        globalThemeButton.classList.add("theme-toggle--toggled");
    } else {
        globalThemeButton.classList.remove("theme-toggle--toggled");
    }
}, [globalTheme]);

// Syntax theme effect - skip transitions on initial load
effect(() => {
    localStorage.setItem('xynhtml-syntax-theme', syntaxTheme.value);
    applySyntaxTheme(syntaxTheme.value, isInitialLoad.value);
    updateSyntaxThemeDropdown();
}, [syntaxTheme]);

globalThemeSwitcher.appendChild(globalThemeButton);
globalThemeSwitcher.appendChild(syntaxThemeSelector);
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
    // Mark initial load as complete to enable transitions for future changes
    setTimeout(() => {
        isInitialLoad.value = false;
    }, 100);
    document.removeEventListener('DOMContentLoaded', loadExamplesOnReady);
}
document.addEventListener('DOMContentLoaded', loadExamplesOnReady);