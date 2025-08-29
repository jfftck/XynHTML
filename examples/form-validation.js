
import { signal, derived, XynTag, text, effect } from "../src/xyn_html.js";

export async function example13() {
    const output = function(message) {
        const container = document.getElementById('example13-output');
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };

    const email = signal("");
    const password = signal("");

    const isValidEmail = derived(() => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
    }, [email]);

    const isValidPassword = derived(() => {
        return password.value.length >= 8;
    }, [password]);

    const isFormValid = derived(() => {
        return isValidEmail.value && isValidPassword.value;
    }, [isValidEmail, isValidPassword]);

    // Create form elements
    const form = new XynTag("form");
    const emailInput = new XynTag("input");
    const passwordInput = new XynTag("input");
    const submitButton = new XynTag("button");
    const validationStatus = new XynTag("div");

    // Configure form elements
    const emailElement = emailInput.render();
    emailElement.type = "email";
    emailElement.placeholder = "Enter your email";
    emailElement.style.cssText = "margin: 5px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; display: block; width: 200px;";

    const passwordElement = passwordInput.render();
    passwordElement.type = "password";
    passwordElement.placeholder = "Enter your password";
    passwordElement.style.cssText = "margin: 5px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; display: block; width: 200px;";

    const submitElement = submitButton.render();
    submitElement.type = "submit";
    submitElement.textContent = "Submit";
    submitElement.style.cssText = "margin: 5px; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;";

    const statusElement = validationStatus.render();
    statusElement.style.cssText = "margin: 10px 0; padding: 10px; border-radius: 4px;";

    // Add event listeners
    emailElement.addEventListener('input', (e) => {
        email.value = e.target.value;
    });

    passwordElement.addEventListener('input', (e) => {
        password.value = e.target.value;
    });

    // Effect to update validation status and button state
    effect(() => {
        const emailValid = isValidEmail.value || email.value === "";
        const passwordValid = isValidPassword.value || password.value === "";
        const formValid = isFormValid.value;

        // Update input styles
        emailElement.style.borderColor = email.value === "" ? "#ccc" : (emailValid ? "#28a745" : "#dc3545");
        passwordElement.style.borderColor = password.value === "" ? "#ccc" : (passwordValid ? "#28a745" : "#dc3545");

        // Update submit button
        submitElement.disabled = !formValid;
        submitElement.style.backgroundColor = formValid ? "#28a745" : "#6c757d";
        submitElement.style.color = "white";

        // Update status message
        if (email.value === "" && password.value === "") {
            statusElement.textContent = "Please fill out the form";
            statusElement.style.backgroundColor = "#e9ecef";
            statusElement.style.color = "#495057";
        } else if (formValid) {
            statusElement.textContent = "Form is valid!";
            statusElement.style.backgroundColor = "#d4edda";
            statusElement.style.color = "#155724";
        } else {
            const errors = [];
            if (email.value && !emailValid) errors.push("Invalid email format");
            if (password.value && !passwordValid) errors.push("Password must be at least 8 characters");
            statusElement.textContent = `Validation errors: ${errors.join(", ")}`;
            statusElement.style.backgroundColor = "#f8d7da";
            statusElement.style.color = "#721c24";
        }
    }, [isValidEmail, isValidPassword, isFormValid]);

    // Prevent form submission
    const formElement = form.render();
    formElement.onsubmit = (e) => {
        e.preventDefault();
        if (isFormValid.value) {
            output(`Form submitted! Email: ${email.value}`);
        }
    };

    // Build form
    formElement.appendChild(emailElement);
    formElement.appendChild(passwordElement);
    formElement.appendChild(submitElement);
    formElement.appendChild(statusElement);
    formElement.className = "example-container";

    const outputContainer = document.getElementById('example13-output');
    if (outputContainer) {
        output("Reactive form with validation:");
        outputContainer.appendChild(formElement);
    }
}
