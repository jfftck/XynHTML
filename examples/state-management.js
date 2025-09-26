import { effect, signal, derived, tag } from "../src/xyn_html.js";

export const title = "Example 4: Complex State Management";

export async function example4(output) {
    const todos = signal([]);
    const filter = signal("all"); // "all", "completed", "pending"

    output.signalUpdate("todos", todos);
    output.signalUpdate("filter", filter);

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
    const unsubscribe = effect(() => {
        output(`Filter: ${filter.value}`);
        output(`Filtered todos: ${JSON.stringify(filteredTodos.value)}`);
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

    // Clean up
    unsubscribe();
    filteredTodos.unsubscribeDerived();
}