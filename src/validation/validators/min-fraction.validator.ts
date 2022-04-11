import { Auth } from '../auth';
import { ControlValidator } from '../models/control-validator';
import { format } from '../utils/format.util';

export function minFractionValidator(minDigits: number, groups?: string[], severity?: string): ControlValidator {
    const validator = new ControlValidator({
        identifier: Auth.Ids.minFraction,
        groups: groups,
        severity: severity,
    });

    validator.fn = () => {
        const value = validator.control.anyValue;

        // When the value is undefined or null, it should only be validated by the required validator.
        if (value === undefined || value === null) {
            return true;
        }

        const str: string = typeof value !== 'string' ? value.toString() : value;

        // trim, replace all commas with dot, remove all non-numeric symbols
        const newStr: string = str
            .trim()
            .replace(',', '.')
            .replace(/[^0-9.,-]/g, '');

        const parts: string[] = newStr.split('.');

        if (parts.length === 2) {
            if (parts[1].length < minDigits) {
                return false;
            }
        } else if (minDigits > 0) {
            return false;
        }

        return true;
    };

    validator.format = (error: string) => {
        return format(error, [minDigits]);
    };

    return validator;
}
