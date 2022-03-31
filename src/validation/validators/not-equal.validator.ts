import { IValidState } from '../interfaces/valid-state.interface';
import { ValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function notEqual(expectedValue: any, groups?: string[], severity?: string): ValidatorModel {
  return {
    fn: (validState: IValidState) => {
      const value = validState.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (expectedValue instanceof Date && value instanceof Date) {
        if (value.getTime() === expectedValue.getTime()) {
          return false;
        }
      } else {
        switch (typeof expectedValue) {
          case 'number':
            if (Number(value) === expectedValue) {
              return false;
            }
            break;
          case 'string':
            if (String(value) === expectedValue) {
              return false;
            }
            break;
          case 'boolean':
            if (Boolean(value) === expectedValue) {
              return false;
            }
            break;
        }
      }

      return value !== expectedValue;
    },
    format: (error: string) => {
      return format(error, [expectedValue]);
    },
    identifier: 'notEqual',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
