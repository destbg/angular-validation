import { IValidControl } from '../interfaces/valid-control.interface';
import { ControlValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function notEqualValidator(expectedValues: any[], groups?: string[], severity?: string): ControlValidatorModel {
  return {
    fn: (validControl: IValidControl) => {
      const value = validControl.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      for (const expectedValue of expectedValues) {
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

        if (value === expectedValue) {
          return false;
        }
      }

      return true;
    },
    format: (error: string) => {
      return format(error, [expectedValues]);
    },
    identifier: 'notEqual',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
