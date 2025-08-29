
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
    emailElement.className = "form-input";

    const passwordElement = passwordInput.render();
    passwordElement.type = "password";
    passwordElement.placeholder = "Enter your password";
    passwordElement.className = "form-input";

    const submitElement = submitButton.render();
    submitElement.type = "submit";
    submitElement.textContent = "Submit";
    submitElement.className = "form-button";

    const statusElement = validationStatus.render();
    statusElement.className = "validation-status";

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

        // Update input validation classes
        emailElement.className = email.value === "" ? "form-input" : 
            (emailValid ? "form-input valid" : "form-input invalid");
        passwordElement.className = password.value === "" ? "form-input" : 
            (passwordValid ? "form-input valid" : "form-input invalid");

        // Update submit button
        submitElement.disabled = !formValid;
        submitElement.className = formValid ? "form-button" : "form-button disabled";

        // Update status message
        if (email.value === "" && password.value === "") {
            statusElement.textContent = "Please fill out the form";
            statusElement.className = "validation-status neutral";
        } else if (formValid) {
            statusElement.textContent = "Form is valid!";
            statusElement.className = "validation-status valid";
        } else {
            const errors = [];
            if (email.value && !emailValid) errors.push("Invalid email format");
            if (password.value && !passwordValid) errors.push("Password must be at least 8 characters");
            statusElement.textContent = `Validation errors: ${errors.join(", ")}`;
            statusElement.className = "validation-status invalid";
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
    form.children = [emailInput, passwordInput, submitButton, validationStatus];
    const formElement = form.render();
    formElement.className = "example-container";

    const outputContainer = document.getElementById('example13-output');
    if (outputContainer) {
        output("Reactive form with validation:");
        outputContainer.appendChild(formElement);
    }
}
