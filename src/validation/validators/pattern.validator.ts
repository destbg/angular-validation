import { IValidState } from '../interfaces/valid-state.interface';
import { ValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function pattern(pattern: string | RegExp, groups?: string[], severity?: string): ValidatorModel {
  let regex: RegExp;
  let regexStr: string;

  if (typeof pattern === 'string') {
    regexStr = '';

    if (pattern.charAt(0) !== '^') {
      regexStr += '^';
    }

    regexStr += pattern;

    if (pattern.charAt(pattern.length - 1) !== '$') {
      regexStr += '$';
    }

    regex = new RegExp(regexStr);
  } else {
    regexStr = pattern.toString();
    regex = pattern;
  }

  return {
    fn: (validState: IValidState) => {
      const value = validState.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (typeof value === 'string') {
        return regex.test(value);
      }

      return true;
    },
    format: (error: string) => {
      return format(error, [regexStr]);
    },
    identifier: 'pattern',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
