import { AbstractValidControl } from '../abstract-valid-control';
import { ControlValidatorModel } from '../models/validator.model';
import { format } from '../utils/format.util';

export function equalValidator(expectedValues: any[], groups?: string[], severity?: string): ControlValidatorModel {
    return {
        fn: (validControl: AbstractValidControl) => {
            const value = validControl.anyValue;

            // When the value is undefined or null, it should only be validated by the required validator.
            if (value === undefined || value === null) {
                return true;
            }

            if (expectedValues.length === 0) {
                return true;
            }

            for (const expectedValue of expectedValues) {
                if (expectedValue instanceof Date && value instanceof Date) {
                    if (value.getTime() !== expectedValue.getTime()) {
                        return false;
                    }
                } else {
                    switch (typeof expectedValue) {
                        case 'number':
                            if (Number(value) !== expectedValue) {
                                return false;
                            }
                            break;
                        case 'string':
                            if (String(value) !== expectedValue) {
                                return false;
                            }
                            break;
                        case 'boolean':
                            if (Boolean(value) !== expectedValue) {
                                return false;
                            }
                            break;
                    }
                }

                if (value !== expectedValue) {
                    return false;
                }
            }

            return true;
        },
        format: (error: string) => {
            return format(error, [expectedValues]);
        },
        identifier: 'equal',
        groups: groups ?? [],
        severity: severity ?? 'ERROR',
    };
}
