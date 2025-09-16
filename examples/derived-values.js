import { effect, signal, derived, tag } from "../src/xyn_html.js";

export const title = "Example 3: Derived Values";

export async function example3(output) {
    const price = signal(100);
    const quantity = signal(2);
    const taxRate = signal(0.1);

    // Derived signal for subtotal
    const subtotal = derived(() => {
        return price.value * quantity.value;
    }, [price, quantity]);

    // Derived signal for total with tax
    const total = derived(() => {
        return subtotal.value * (1 + taxRate.value);
    }, [subtotal, taxRate]);

    // Subscribe to see changes
    const unsubscribe = effect(() => {
        output(`Price: $${price.value}, Quantity: ${quantity.value}`);
        output(`Subtotal: $${subtotal.value}`);
        output(`Total with tax: $${total.value.toFixed(2)}`);
    }, [total]);

    // Update values to see derived calculations
    output.append(tag`hr`.render());
    price.value = 150;
    output.append(tag`hr`.render());
    quantity.value = 3;
    output.append(tag`hr`.render());
    taxRate.value = 0.15;

    // Clean up
    unsubscribe();
    total.unsubscribeDerived();
    subtotal.unsubscribeDerived();
}