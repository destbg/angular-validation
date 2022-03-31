import { IValidState } from '../interfaces/valid-state.interface';
import { ValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function minFraction(minDigits: number, groups?: string[], severity?: string): ValidatorModel {
  return {
    fn: (validState: IValidState) => {
      const value = validState.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      const str: string = typeof value !== 'string' ? value.toString() : value;

      // trim, replace all commas with dot, remove all non-numeric symbols
      const newStr: string = str
        .trim()
        .replace(',', '.')
        .replace(/[^0-9.,-]/g, '');

      const parts: string[] = newStr.split('.');

      if (parts.length === 2) {
        if (parts[1].length < minDigits) {
          return false;
        }
      } else if (minDigits > 0) {
        return false;
      }

      return true;
    },
    format: (error: string) => {
      return format(error, [minDigits]);
    },
    identifier: 'minFraction',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
