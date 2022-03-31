import { IValidState } from '../interfaces/valid-state.interface';
import { ValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

// enum Test {
//   hi,
//   there,
// }
// isEnum(Object.keys(Test));

export function isEnum(enumValues: string[], groups?: string[], severity?: string): ValidatorModel {
  return {
    fn: (validState: IValidState) => {
      const value = validState.anyValue;

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
