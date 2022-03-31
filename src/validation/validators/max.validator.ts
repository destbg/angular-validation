import { IValidState } from '../interfaces/valid-state.interface';
import { ValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function max(max: number, groups?: string[], severity?: string): ValidatorModel {
  return {
    fn: (validState: IValidState) => {
      const value = validState.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (typeof value === 'string') {
        if (value.length > max) {
          return false;
        }
      } else if (typeof value === 'number') {
        if (value > max) {
          return false;
        }
      } else if (typeof value === 'bigint') {
        if (value > max) {
          return false;
        }
      } else if (Array.isArray(value)) {
        if (value.length > max) {
          return false;
        }
      }

      return true;
    },
    format: (error: string) => {
      return format(error, [max]);
    },
    identifier: 'max',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
