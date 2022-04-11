import { AbstractValidControl } from '../abstract-valid-control';
import { ControlValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function minFractionValidator(minDigits: number, groups?: string[], severity?: string): ControlValidatorModel {
    return {
        fn: (validControl: AbstractValidControl) => {
            const value = validControl.anyValue;

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
        },
        format: (error: string) => {
            return format(error, [minDigits]);
        },
        identifier: 'minFraction',
        groups: groups ?? [],
        severity: severity ?? 'ERROR',
    };
}
