import { IValidControl } from '../interfaces/valid-control.interface';
import { ControlValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function minValidator(min: number, groups?: string[], severity?: string): ControlValidatorModel {
  return {
    fn: (validControl: IValidControl) => {
      const value = validControl.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (typeof value === 'string' || Array.isArray(value)) {
        if (value.length < min) {
          return false;
        }
      } else if (typeof value === 'number' || typeof value === 'bigint') {
        if (value < min) {
          return false;
        }
      }

      return true;
    },
    format: (error: string) => {
      return format(error, [min]);
    },
    identifier: 'min',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
