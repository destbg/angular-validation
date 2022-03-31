import { IValidControl } from '../interfaces/valid-control.interface';
import { ControlValidatorModel } from '../models/validator.model';

export function creditCardValidator(groups?: string[], severity?: string): ControlValidatorModel {
  return {
    fn: (validControl: IValidControl) => {
      const value = validControl.anyValue;

      // When the value is undefined or null, it should only be validated by the required validator.
      if (value === undefined || value === null) {
        return true;
      }

      if (typeof value === 'string') {
        const newValue = value.replace('-', '').replace(' ', '');

        let checksum: number = 0;
        let evenDigit: boolean = false;

        for (let i = newValue.length - 1; i >= 0; i--) {
          const digit = Number(newValue[i]);

          if (!isNaN(digit)) {
            return false;
          }

          let digitValue = digit * (evenDigit ? 2 : 1);
          evenDigit = !evenDigit;

          while (digitValue > 0) {
            checksum += digitValue % 10;
            digitValue /= 10;
          }
        }

        return checksum % 10 === 0;
      }

      return true;
    },
    format: (error: string) => {
      return error;
    },
    identifier: 'creditCard',
    groups: groups ?? [],
    severity: severity ?? 'ERROR',
  };
}
