import { ControlValidator } from './models/control-validator';
import { containValidator } from './validators/contain.validator';
import { creditCardValidator } from './validators/credit-card.validator';
import { emailValidator } from './validators/email.validator';
import { isEnumValidator } from './validators/enum.validator';
import { equalValidator } from './validators/equal.validator';
import { exactLengthValidator } from './validators/exact-length.validator';
import { fractionValidator } from './validators/fraction.validator';
import { greaterThanOrEqualValidator } from './validators/greater-than-or-equal.validator';
import { greaterThanValidator } from './validators/greater-than.validator';
import { lessThanOrEqualValidator } from './validators/less-than-or-equal.validator';
import { lessThanValidator } from './validators/less-than.validator';
import { maxFractionValidator } from './validators/max-fraction.validator';
import { maxValidator } from './validators/max.validator';
import { minFractionValidator } from './validators/min-fraction.validator';
import { minValidator } from './validators/min.validator';
import { notContainValidator } from './validators/not-contain.validator';
import { notEmptyValidator } from './validators/not-empty.validator';
import { notEqualValidator } from './validators/not-equal.validator';
import { patternValidator } from './validators/pattern.validator';
import { rangeValidator } from './validators/range.validator';

export class Auth {
    /* In order to remove a validator you need to know it's ID, this class can help with that process. */
    public static Ids = {
        contain: 'contain',
        creditCard: 'creditCard',
        email: 'email',
        isEnum: 'isEnum',
        equal: 'equal',
        exactLength: 'exactLength',
        fraction: 'fraction',
        greaterThanOrEqual: 'greaterThanOrEqual',
        greaterThan: 'greaterThan',
        lessThanOrEqual: 'lessThanOrEqual',
        lessThan: 'lessThan',
        maxFraction: 'maxFraction',
        max: 'max',
        minFraction: 'minFraction',
        min: 'min',
        notContain: 'notContain',
        notEmpty: 'notEmpty',
        notEqual: 'notEqual',
        pattern: 'pattern',
        range: 'range',
    };

    public static contain(containValue: string | any, groups?: string[], severity?: string): ControlValidator {
        return containValidator(containValue, groups, severity);
    }

    public static creditCard(groups?: string[], severity?: string): ControlValidator {
        return creditCardValidator(groups, severity);
    }

    public static email(groups?: string[], severity?: string): ControlValidator {
        return emailValidator(groups, severity);
    }

    public static isEnum(enumValues: string[], groups?: string[], severity?: string): ControlValidator {
        return isEnumValidator(enumValues, groups, severity);
    }

    public static equal(expectedValues: any[], groups?: string[], severity?: string): ControlValidator {
        return equalValidator(expectedValues, groups, severity);
    }

    public static exactLength(length: number, groups?: string[], severity?: string): ControlValidator {
        return exactLengthValidator(length, groups, severity);
    }

    public static fraction(digits: number, groups?: string[], severity?: string): ControlValidator {
        return fractionValidator(digits, groups, severity);
    }

    public static greaterThanOrEqual(otherValidControlName: string, groups?: string[], severity?: string): ControlValidator {
        return greaterThanOrEqualValidator(otherValidControlName, groups, severity);
    }

    public static greaterThan(otherValidControlName: string, groups?: string[], severity?: string): ControlValidator {
        return greaterThanValidator(otherValidControlName, groups, severity);
    }

    public static lessThanOrEqual(otherValidControlName: string, groups?: string[], severity?: string): ControlValidator {
        return lessThanOrEqualValidator(otherValidControlName, groups, severity);
    }

    public static lessThan(otherValidControlName: string, groups?: string[], severity?: string): ControlValidator {
        return lessThanValidator(otherValidControlName, groups, severity);
    }

    public static maxFraction(maxDigits: number, groups?: string[], severity?: string): ControlValidator {
        return maxFractionValidator(maxDigits, groups, severity);
    }

    public static max(max: number, groups?: string[], severity?: string): ControlValidator {
        return maxValidator(max, groups, severity);
    }

    public static minFraction(minDigits: number, groups?: string[], severity?: string): ControlValidator {
        return minFractionValidator(minDigits, groups, severity);
    }

    public static min(min: number, groups?: string[], severity?: string): ControlValidator {
        return minValidator(min, groups, severity);
    }

    public static notContain(containValue: string, groups?: string[], severity?: string): ControlValidator {
        return notContainValidator(containValue, groups, severity);
    }

    public static notEmpty(groups?: string[], severity?: string): ControlValidator {
        return notEmptyValidator(groups, severity);
    }

    public static notEqual(expectedValues: any[], groups?: string[], severity?: string): ControlValidator {
        return notEqualValidator(expectedValues, groups, severity);
    }

    public static pattern(pattern: string | RegExp, groups?: string[], severity?: string): ControlValidator {
        return patternValidator(pattern, groups, severity);
    }

    public static range(min: number, max: number, groups?: string[], severity?: string): ControlValidator {
        return rangeValidator(min, max, groups, severity);
    }
}
