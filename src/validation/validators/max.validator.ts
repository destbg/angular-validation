import { Auth } from '../auth';
import { ControlValidator } from '../models/control-validator';
import { format } from '../utils/format.util';

export function maxValidator(max: number, groups?: string[], severity?: string): ControlValidator {
    const validator = new ControlValidator({
        identifier: Auth.Ids.max,
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
            if (value.length > max) {
                return false;
            }
        } else if (typeof value === 'number' || typeof value === 'bigint') {
            if (value > max) {
                return false;
            }
        }

        return true;
    };

    validator.format = (error: string) => {
        return format(error, [max]);
    };

    return validator;
}
