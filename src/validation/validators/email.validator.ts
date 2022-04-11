import { AbstractValidControl } from '../abstract-valid-control';
import { ControlValidatorModel } from '../models/validator.model';

const EMAIL_REGEXP =
    /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function emailValidator(groups?: string[], severity?: string): ControlValidatorModel {
    return {
        fn: (validControl: AbstractValidControl) => {
            const value = validControl.anyValue;

            // When the value is undefined or null, it should only be validated by the required validator.
            if (value === undefined || value === null) {
                return true;
            }

            if (typeof value === 'string') {
                return EMAIL_REGEXP.test(value);
            }

            return true;
        },
        format: (error: string) => {
            return error;
        },
        identifier: 'email',
        groups: groups ?? [],
        severity: severity ?? 'ERROR',
    };
}
