import { AbstractValidControl } from '../abstract-valid-control';
import { ControlValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function containValidator(
  containValue: string | any,
  groups?: string[],
  severity?: string
): ControlValidatorModel {
  return {
    fn: (validControl: AbstractValidControl) => {
      const value = validControl.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (typeof value === 'string' || Array.isArray(value)) {
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
