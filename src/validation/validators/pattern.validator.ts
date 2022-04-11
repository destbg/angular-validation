import { Auth } from '../auth';
import { ControlValidator } from '../models/control-validator';
import { format } from '../utils/format.util';

export function patternValidator(pattern: string | RegExp, groups?: string[], severity?: string): ControlValidator {
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

    const validator = new ControlValidator({
        identifier: Auth.Ids.pattern,
        groups: groups,
        severity: severity,
    });

    validator.fn = () => {
        const value = validator.control.anyValue;

        // When the value is undefined or null, it should only be validated by the required validator.
        if (value === undefined || value === null) {
            return true;
        }

        if (typeof value === 'string') {
            return regex.test(value);
        }

        return true;
    };

    validator.format = (error: string) => {
        return format(error, [regexStr]);
    };

    return validator;
}
