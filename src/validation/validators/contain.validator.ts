import { IValidState } from '../interfaces/valid-state.interface';
import { ValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function contain(containValue: string | any, groups?: string[], severity?: string): ValidatorModel {
  return {
    fn: (validState: IValidState) => {
      const value = validState.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (typeof value === 'string') {
        return value.includes(containValue);
      } else if (Array.isArray(value)) {
        return value.includes(containValue);
      }

      return true;
    },
    format: (error: string) => {
      return format(error, [containValue]);
    },
    identifier: 'contain',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
