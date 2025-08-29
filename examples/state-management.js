
import { signal, derived, effect } from "../src/xyn_html.js";

export async function example4() {
    const output = function(message) {
        const container = document.getElementById('example4-output');
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };

    const todos = signal([]);
    const filter = signal("all"); // "all", "completed", "pending"

    // Derived signal for filtered todos
    const filteredTodos = derived(() => {
        if (filter.value === "completed") {
            return todos.value.filter(todo => todo.completed);
        } else if (filter.value === "pending") {
            return todos.value.filter(todo => !todo.completed);
        }
        return todos.value;
    }, [todos, filter]);

    // Subscribe to see filtered results
    const unsubscribeEffect = effect(() => {
        output(`Filter: ${filter.value}`);
        output(`Filtered todos: ${JSON.stringify(filteredTodos.value)}`);
        output("---");
    }, [filteredTodos]);

    // Add some todos
    todos.value = [
        { id: 1, text: "Learn XynHTML", completed: false },
        { id: 2, text: "Build a project", completed: true },
        { id: 3, text: "Write documentation", completed: false }
    ];

    // Test different filters
    filter.value = "completed";
    filter.value = "pending";
    filter.value = "all";
}
