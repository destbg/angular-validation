import { ControlValidatorModel, RequiredValidatorModel } from './models/validator.model';
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
import { requiredValidator } from './validators/required.validator';

export class Guard {
  public static contain(containValue: string | any, groups?: string[], severity?: string): ControlValidatorModel {
    return containValidator(containValue, groups, severity);
  }

  public static creditCard(groups?: string[], severity?: string): ControlValidatorModel {
    return creditCardValidator(groups, severity);
  }

  public static email(groups?: string[], severity?: string): ControlValidatorModel {
    return emailValidator(groups, severity);
  }

  public static isEnum(enumValues: string[], groups?: string[], severity?: string): ControlValidatorModel {
    return isEnumValidator(enumValues, groups, severity);
  }

  public static equal(expectedValues: any[], groups?: string[], severity?: string): ControlValidatorModel {
    return equalValidator(expectedValues, groups, severity);
  }

  public static exactLength(length: number, groups?: string[], severity?: string): ControlValidatorModel {
    return exactLengthValidator(length, groups, severity);
  }

  public static fraction(digits: number, groups?: string[], severity?: string): ControlValidatorModel {
    return fractionValidator(digits, groups, severity);
  }

  public static greaterThanOrEqual(otherValidControlName: string, groups?: string[], severity?: string): ControlValidatorModel {
    return greaterThanOrEqualValidator(otherValidControlName, groups, severity);
  }

  public static greaterThan(otherValidControlName: string, groups?: string[], severity?: string): ControlValidatorModel {
    return greaterThanValidator(otherValidControlName, groups, severity);
  }

  public static lessThanOrEqual(otherValidControlName: string, groups?: string[], severity?: string): ControlValidatorModel {
    return lessThanOrEqualValidator(otherValidControlName, groups, severity);
  }

  public static lessThan(otherValidControlName: string, groups?: string[], severity?: string): ControlValidatorModel {
    return lessThanValidator(otherValidControlName, groups, severity);
  }

  public static maxFraction(maxDigits: number, groups?: string[], severity?: string): ControlValidatorModel {
    return maxFractionValidator(maxDigits, groups, severity);
  }

  public static max(max: number, groups?: string[], severity?: string): ControlValidatorModel {
    return maxValidator(max, groups, severity);
  }

  public static minFraction(minDigits: number, groups?: string[], severity?: string): ControlValidatorModel {
    return minFractionValidator(minDigits, groups, severity);
  }

  public static min(min: number, groups?: string[], severity?: string): ControlValidatorModel {
    return minValidator(min, groups, severity);
  }

  public static notContain(containValue: string, groups?: string[], severity?: string): ControlValidatorModel {
    return notContainValidator(containValue, groups, severity);
  }

  public static notEmpty(groups?: string[], severity?: string): ControlValidatorModel {
    return notEmptyValidator(groups, severity);
  }

  public static notEqual(expectedValues: any[], groups?: string[], severity?: string): ControlValidatorModel {
    return notEqualValidator(expectedValues, groups, severity);
  }

  public static pattern(pattern: string | RegExp, groups?: string[], severity?: string): ControlValidatorModel {
    return patternValidator(pattern, groups, severity);
  }

  public static range(min: number, max: number, groups?: string[], severity?: string): ControlValidatorModel {
    return rangeValidator(min, max, groups, severity);
  }

  public static required(groups?: string[]): RequiredValidatorModel {
    return requiredValidator(groups);
  }
}
