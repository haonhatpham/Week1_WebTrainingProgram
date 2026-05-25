const form = document.querySelector(".form-card");
const fields = {
  name: form.elements.name,
  email: form.elements.email,
  phone: form.elements.phone,
  password: form.elements.password,
  confirm: form.elements.confirm,
};
const submitButton = form.querySelector(".submit-button");
const message = form.querySelector(".form-message");
const strengthBar = form.querySelector("[data-strength-bar]");
const strengthText = form.querySelector("[data-strength-text]");
const touched = new Set();

function validateName(value) {
  if (!value.trim()) return "Name is required.";
  if (value.trim().length < 2) return "Name must be at least 2 characters.";
  return "";
}

function validateEmail(value) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value.trim()) return "Email is required.";
  if (!pattern.test(value.trim())) return "Enter a valid email address.";
  return "";
}

function validatePhone(value) {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "Phone is required.";
  if (digits.length < 10 || digits.length > 15) {
    return "Phone must contain 10 to 15 digits.";
  }

  return "";
}

function getPasswordChecks(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
}

function validatePassword(value) {
  const checks = getPasswordChecks(value);
  const missing = [];

  if (!value) missing.push("a password");
  if (!checks.length) missing.push("at least 8 characters");
  if (!checks.upper) missing.push("1 uppercase letter");
  if (!checks.number) missing.push("1 number");
  if (!checks.special) missing.push("1 special character");

  return missing.length ? `Password needs ${missing.join(", ")}.` : "";
}

function validateConfirm(value) {
  if (!value) return "Please confirm your password.";
  if (value !== fields.password.value) return "Passwords do not match.";
  return "";
}

function validateField(name) {
  const value = fields[name].value;

  if (name === "name") return validateName(value);
  if (name === "email") return validateEmail(value);
  if (name === "phone") return validatePhone(value);
  if (name === "password") return validatePassword(value);
  if (name === "confirm") return validateConfirm(value);
  return "";
}

function getPasswordStrength(value) {
  const checks = getPasswordChecks(value);
  const score = Object.values(checks).filter(Boolean).length;

  if (!value) return { label: "Use at least 8 chars, 1 uppercase, 1 number, and 1 special.", level: "" };
  if (score <= 2) return { label: "Password strength: weak", level: "is-weak" };
  if (score === 3) return { label: "Password strength: medium", level: "is-medium" };
  return { label: "Password strength: strong", level: "is-strong" };
}

function updatePasswordStrength() {
  const strength = getPasswordStrength(fields.password.value);

  strengthBar.className = `strength-bar ${strength.level}`.trim();
  strengthText.textContent = strength.label;
}

function renderField(name, forceShow = false) {
  const field = form.querySelector(`[data-field="${name}"]`);
  const errorNode = form.querySelector(`#${name}-error`);
  const error = validateField(name);
  const shouldShow = forceShow || touched.has(name);

  field.classList.toggle("is-invalid", Boolean(error) && shouldShow);
  field.classList.toggle("is-valid", !error && fields[name].value.length > 0);
  errorNode.textContent = shouldShow ? error : "";
}

function isFormValid() {
  return Object.keys(fields).every((name) => validateField(name) === "");
}

function updateSubmitState() {
  submitButton.disabled = !isFormValid();
}

function render(name, forceShow = false) {
  if (name === "password") {
    updatePasswordStrength();
    renderField("confirm", touched.has("confirm"));
  }

  renderField(name, forceShow);
  updateSubmitState();
}

form.addEventListener("input", (event) => {
  const name = event.target.name;

  if (!fields[name]) return;

  message.textContent = "";
  render(name, touched.has(name));
});

form.addEventListener("blur", (event) => {
  const name = event.target.name;

  if (!fields[name]) return;

  touched.add(name);
  render(name, true);
}, true);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  Object.keys(fields).forEach((name) => {
    touched.add(name);
    renderField(name, true);
  });

  updatePasswordStrength();
  updateSubmitState();

  if (!isFormValid()) {
    message.textContent = "";
    return;
  }

  message.textContent = "Registration form is valid and ready to submit.";
});

updatePasswordStrength();
updateSubmitState();
