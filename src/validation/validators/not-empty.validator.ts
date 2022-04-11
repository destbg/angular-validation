import { Auth } from '../auth';
import { ControlValidator } from '../models/control-validator';

export function notEmptyValidator(groups?: string[], severity?: string): ControlValidator {
    const validator = new ControlValidator({
        identifier: Auth.Ids.notEmpty,
        groups: groups,
        severity: severity,
    });

    validator.fn = () => {
        const value = validator.control.anyValue;

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
    };

    return validator;
}
