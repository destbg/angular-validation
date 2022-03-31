import { IValidState } from '../interfaces/valid-state.interface';
import { ValidatorModel } from '../models/validator.model';

export function greaterThanOrEqual(otherValidStateName: string, groups?: string[], severity?: string): ValidatorModel {
  return {
    fn: (validState: IValidState) => {
      const value = validState.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      const otherValue = validState.parent?.validStates[otherValidStateName]?.anyValue;

      if (otherValue === undefined || otherValue === null) {
        return true;
      }

      if (typeof value === 'number' && typeof otherValue === 'number') {
        return value >= otherValue;
      }

      return true;
    },
    format: (error: string) => {
      return error;
    },
    identifier: 'greaterThanOrEqual',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
