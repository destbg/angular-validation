import { Auth } from '../auth';
import { ControlValidator } from '../models/control-validator';
import { format } from '../utils/format.util';

export function rangeValidator(min: number, max: number, groups?: string[], severity?: string): ControlValidator {
    const validator = new ControlValidator({
        identifier: Auth.Ids.range,
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
            if (value.length < min || value.length > max) {
                return false;
            }
        } else if (typeof value === 'number' || typeof value === 'bigint') {
            if (value < min || value > max) {
                return false;
            }
        }

        return true;
    };

    validator.format = (error: string) => {
        return format(error, [min, max]);
    };

    return validator;
}
