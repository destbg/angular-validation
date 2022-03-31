import { RequiredValidatorModel } from '../models/validator.model';

// The required validator is validated by the valid state itself.
// This way custom validation can be created for the required validator.
// Example: boolean is false or array is empty.

export function required(groups?: string[], severity?: string): RequiredValidatorModel {
  return {
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
