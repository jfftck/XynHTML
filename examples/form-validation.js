import { signal, derived, tag, text, effect } from "../src/xyn_html.js";

export const title = "Example 13: Form with Reactive Validation";

export async function example13(output) {
    const email = signal("");
    const password = signal("");

    // Derived validation signals
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
    const form = tag`form`;
    const formElement = form.render();
    formElement.className = "example-container";

    // Email input
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Enter your email";
    emailInput.oninput = (e) => {
        email.value = e.target.value;
    };

    // Email validation message
    const emailValidation = document.createElement("div");
    emailValidation.style.cssText = "font-size: 12px; margin: 5px 0;";

    // Password input
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Enter your password";
    passwordInput.oninput = (e) => {
        password.value = e.target.value;
    };

    // Password validation message
    const passwordValidation = document.createElement("div");
    passwordValidation.style.cssText = "font-size: 12px; margin: 5px 0;";

    // Submit button
    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.textContent = "Submit";
    submitButton.onclick = () => {
        if (isFormValid.value) {
            output(`Form submitted! Email: ${email.value}`);
        }
    };

    // Effects for validation styling
    effect(() => {
        emailInput.style.borderColor = email.value && !isValidEmail.value ? "#ff4444" : "#ccc";
        emailValidation.textContent = email.value && !isValidEmail.value ? "Please enter a valid email address" : "";
        emailValidation.style.color = "#ff4444";
    }, [email, isValidEmail]);

    effect(() => {
        passwordInput.style.borderColor = password.value && !isValidPassword.value ? "#ff4444" : "#ccc";
        passwordValidation.textContent = password.value && !isValidPassword.value ? "Password must be at least 8 characters long" : "";
        passwordValidation.style.color = "#ff4444";
    }, [password, isValidPassword]);

    effect(() => {
        submitButton.disabled = !isFormValid.value;
        submitButton.style.backgroundColor = isFormValid.value ? "#007acc" : "#cccccc";
        submitButton.style.color = isFormValid.value ? "white" : "#666666";
    }, [isFormValid]);

    // Assemble form
    formElement.appendChild(document.createTextNode("Email:"));
    formElement.appendChild(emailInput);
    formElement.appendChild(emailValidation);
    formElement.appendChild(document.createElement("br"));
    formElement.appendChild(document.createTextNode("Password:"));
    formElement.appendChild(passwordInput);
    formElement.appendChild(passwordValidation);
    formElement.appendChild(document.createElement("br"));
    formElement.appendChild(submitButton);

    output("Reactive form with validation created below:");
    output.append(form);
}

