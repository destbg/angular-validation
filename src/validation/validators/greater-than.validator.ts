import { IValidControl } from '../interfaces/valid-control.interface';
import { ControlValidatorModel } from '../models/validator.model';
import { ValidGroup } from '../valid-group';

export function greaterThanValidator(
  otherValidControlName: string,
  groups?: string[],
  severity?: string
): ControlValidatorModel {
  return {
    fn: (validControl: IValidControl) => {
      const value = validControl.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (validControl.parent === null || validControl.parent === undefined) {
        return true;
      }

      let otherValue: any;

      if (validControl.parent instanceof ValidGroup) {
        otherValue = validControl.parent.validControls[otherValidControlName]?.anyValue;
      }

      if (otherValue === undefined || otherValue === null) {
        return true;
      }

      if (typeof value === 'number' && typeof otherValue === 'number') {
        return value > otherValue;
      }

      return true;
    },
    format: (error: string) => {
      return error;
    },
    identifier: 'greaterThan',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
