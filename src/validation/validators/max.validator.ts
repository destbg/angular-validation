import { AbstractValidControl } from '../abstract-valid-control';
import { ControlValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function maxValidator(max: number, groups?: string[], severity?: string): ControlValidatorModel {
    return {
        fn: (validControl: AbstractValidControl) => {
            const value = validControl.anyValue;

            // When the value is undefined or null, it should only be validated by the required validator.
            if (value === undefined || value === null) {
                return true;
            }

            if (typeof value === 'string' || Array.isArray(value)) {
                if (value.length > max) {
                    return false;
                }
            } else if (typeof value === 'number' || typeof value === 'bigint') {
                if (value > max) {
                    return false;
                }
            }

            return true;
        },
        format: (error: string) => {
            return format(error, [max]);
        },
        identifier: 'max',
        groups: groups ?? [],
        severity: severity ?? 'ERROR',
    };
}
