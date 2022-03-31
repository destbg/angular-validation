import { IValidControl } from '../interfaces/valid-control.interface';
import { ControlValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

// enum Test {
//   hi,
//   there,
// }
// isEnum(Object.keys(Test));

export function isEnumValidator(enumValues: string[], groups?: string[], severity?: string): ControlValidatorModel {
  return {
    fn: (validControl: IValidControl) => {
      const value = validControl.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (typeof value === 'string') {
        return enumValues.includes(value);
      }

      return true;
    },
    format: (error: string) => {
      return format(error, [enumValues]);
    },
    identifier: 'isEnum',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
