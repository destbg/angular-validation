import { AbstractValidControl } from '../abstract-valid-control';
import { ControlValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function patternValidator(
    pattern: string | RegExp,
    groups?: string[],
    severity?: string
): ControlValidatorModel {
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
        fn: (validControl: AbstractValidControl) => {
            const value = validControl.anyValue;

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
