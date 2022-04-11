import { Auth } from '../auth';
import { ControlValidator } from '../models/control-validator';
import { format } from '../utils/format.util';

export function equalValidator(expectedValues: any[], groups?: string[], severity?: string): ControlValidator {
    const validator = new ControlValidator({
        identifier: Auth.Ids.equal,
        groups: groups,
        severity: severity,
    });

    validator.fn = () => {
        const value = validator.control.anyValue;

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
    };

    validator.format = (error: string) => {
        return format(error, [expectedValues]);
    };

    return validator;
}
