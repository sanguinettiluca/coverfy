const MIN_LENGTH = 10;
const UPPERCASE_REGEX = /[A-Z]/;
const SPECIAL_CHAR_REGEX = /[!@#$%&?]/;

export interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < MIN_LENGTH) {
        errors.push(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres.`);
    }

    if (!UPPERCASE_REGEX.test(password)) {
        errors.push(`La contraseña debe contener al menos una letra mayúscula.`);
    }

    if (!SPECIAL_CHAR_REGEX.test(password)) {
        errors.push(`La contraseña debe contener al menos un carácter especial.`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}