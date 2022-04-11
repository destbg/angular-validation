import { AbstractValidControl } from '../abstract-valid-control';
import { ControlValidatorModel } from '../models/validator.model';

export function notEmptyValidator(groups?: string[], severity?: string): ControlValidatorModel {
    return {
        fn: (validControl: AbstractValidControl) => {
            const value = validControl.anyValue;

            // When the value is undefined or null, it should only be validated by the required validator.
            if (value === undefined || value === null) {
                return true;
            }

            if (typeof value === 'string' || Array.isArray(value)) {
                if (value.length === 0) {
                    return false;
                }
            }

            return true;
        },
        format: (error: string) => {
            return error;
        },
        identifier: 'notEmpty',
        groups: groups ?? [],
        severity: severity ?? 'ERROR',
    };
}
