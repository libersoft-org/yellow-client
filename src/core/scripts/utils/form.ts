/**
 * Universal form validator for any form
 */

export interface IValidationRule {
	field: any;
	element?: any;
	trim?: boolean;
	convert?: (value: any) => any;
	required?: string;
	validate?: (value: any) => string | null;
	// For array validation
	isArray?: boolean;
	arrayElements?: any[];
}

export type FormValidatorConfig = IValidationRule[];

/**
 * Simple form validation helper - works with reactive field objects
 */
export function validateForm(config: FormValidatorConfig): string | null {
	// Process and validate all fields
	for (const rule of config) {
		// Handle array validation
		if (rule.isArray) {
			// Skip validation if field is undefined or null - no array means no validation needed
			if (!rule.field || !Array.isArray(rule.field)) {
				continue;
			}

			// Skip validation if array is empty - empty arrays are allowed
			if (rule.field.length === 0) {
				continue;
			}

			for (let i = 0; i < rule.field.length; i++) {
				const item = rule.field[i];
				if (rule.required && !item?.trim()) {
					rule.arrayElements?.[i]?.focus();
					return rule.required.replace('{index}', (i + 1).toString());
				}
			}
			continue;
		}

		let value = rule.field;

		// Trim if needed
		if (rule.trim && typeof value === 'string') {
			value = value.trim();
			rule.field = value;
		}

		// Convert if needed
		if (rule.convert && value !== undefined && value !== null) {
			value = rule.convert(value);
			rule.field = value;
		}

		// Check required
		if (rule.required && (value === undefined || value === null || value === '')) {
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
