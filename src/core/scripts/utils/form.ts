export interface IValidationRule {
	field: any;
	element?: any;
	required?: string;
	validate?: (value: any) => string | null;
	isArray?: boolean;
	arrayElements?: any[];
}
export type FormValidatorConfig = IValidationRule[];

export function validateForm(config: FormValidatorConfig): string | null {
	for (const rule of config) {
		if (rule.isArray) {
			const arrayValue = rule.field;
			if (!arrayValue || !Array.isArray(arrayValue)) continue;
			if (arrayValue.length === 0) continue;
			for (let i = 0; i < arrayValue.length; i++) {
				const item = arrayValue[i];
				if (rule.required) {
					rule.arrayElements?.[i]?.focus();
					return rule.required.replace('{index}', (i + 1).toString());
				}
			}
			continue;
		}
		let value = rule.field;
		if (rule.required && (value === undefined || value === null || value === '')) {
			rule.element?.focus();
			return rule.required;
		}
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
