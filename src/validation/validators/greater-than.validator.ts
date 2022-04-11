import { AbstractValidControl } from '../abstractions/abstract-valid-control';
import { Auth } from '../auth';
import { ControlValidator } from '../models/control-validator';
import { format } from '../utils/format.util';

export function greaterThanValidator(otherValidControlName: string, groups?: string[], severity?: string): ControlValidator {
    const validator = new ControlValidator({
        identifier: Auth.Ids.greaterThan,
        groups: groups,
        severity: severity,
    });

    validator.fn = () => {
        const value = validator.control.anyValue;

        // When the value is undefined or null, it should only be validated by the required validator.
        if (value === undefined || value === null) {
            return true;
        }

        if (validator.control.parent === null || validator.control.parent === undefined) {
            return true;
        }

        let otherValue: any;

        if (validator.control.parent !== null && validator.control.parent !== undefined) {
            otherValue = (validator.control.parent.validStates[otherValidControlName] as AbstractValidControl)?.anyValue;
        }

        if (otherValue === undefined || otherValue === null) {
            return true;
        }

        if (typeof value === 'number' && typeof otherValue === 'number') {
            return value > otherValue;
        }

        return true;
    };

    validator.format = (error: string) => {
        return format(error, [(validator.control.parent?.validStates[otherValidControlName] as AbstractValidControl)?.label]);
    };

    return validator;
}
