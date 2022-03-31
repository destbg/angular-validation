import { IValidState } from '../interfaces/valid-state.interface';
import { ValidatorModel } from '../models/validator.model';

export function notEmpty(groups?: string[], severity?: string): ValidatorModel {
  return {
    fn: (validState: IValidState) => {
      const value = validState.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (typeof value === 'string') {
        if (value.length === 0) {
          return false;
        }
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          return false;
        }
      }

      return true;
    },
    format: (error: string) => {
      return error;
    },
    identifier: 'notEmpty',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
