import { IValidControl } from '../interfaces/valid-control.interface';
import { ControlValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function notContainValidator(containValue: string, groups?: string[], severity?: string): ControlValidatorModel {
  return {
    fn: (validControl: IValidControl) => {
      const value = validControl.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (typeof value === 'string' || Array.isArray(value)) {
        return !value.includes(containValue);
      }

      return true;
    },
    format: (error: string) => {
      return format(error, [containValue]);
    },
    identifier: 'notContain',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
