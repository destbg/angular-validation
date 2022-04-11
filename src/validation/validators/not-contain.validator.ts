import { Auth } from '../auth';
import { ControlValidator } from '../models/control-validator';
import { format } from '../utils/format.util';

export function notContainValidator(containValue: string, groups?: string[], severity?: string): ControlValidator {
    const validator = new ControlValidator({
        identifier: Auth.Ids.notContain,
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
            return !value.includes(containValue);
        }

        return true;
    };

    validator.format = (error: string) => {
        return format(error, [containValue]);
    };

    return validator;
}
