/**
 * Universal form validator for any form
 */

export interface ValidationRule {
	field: { value: any };
	element?: any;
	trim?: boolean;
	convert?: (value: any) => any;
	required?: string;
	validate?: (value: any) => string | null;
}

export type FormValidatorConfig = ValidationRule[];

/**
 * Simple form validation helper - works with reactive field objects
 */
export function validateForm(config: FormValidatorConfig): string | null {
	// Process and validate all fields
	for (const rule of config) {
		let value = rule.field.value;

		// Trim if needed
		if (rule.trim && typeof value === 'string') {
			value = value.trim();
			rule.field.value = value;
		}

		// Convert if needed
		if (rule.convert && value !== undefined && value !== null) {
			value = rule.convert(value);
			rule.field.value = value;
		}

		// Check required
		if (rule.required && (!value || value === '')) {
			rule.element?.focus();
			return rule.required;
		}

		// Custom validation
		if (rule.validate && value) {
			const validationError = rule.validate(value);
			if (validationError) {
				rule.element?.focus();
				return validationError;
			}
		}
	}

	return null;
}
