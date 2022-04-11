import { AbstractValidControl } from '../abstract-valid-control';
import { ControlValidatorModel } from '../models/validator.model';
import { ValidGroup } from '../valid-group';

export function greaterThanOrEqualValidator(
    otherValidControlName: string,
    groups?: string[],
    severity?: string
): ControlValidatorModel {
    return {
        fn: (validControl: AbstractValidControl) => {
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
                otherValue = (validControl.parent.validStates[otherValidControlName] as AbstractValidControl)?.anyValue;
            }

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
