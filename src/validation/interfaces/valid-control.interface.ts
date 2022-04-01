import { Observable } from 'rxjs';
import { ValidationState } from '../helpers/validation-state';
import { ValidationResultModel } from '../models/validation-result.model';
import { ControlValidatorModel } from '../models/validator.model';
import { ValidGroup } from '../valid-group';

export interface IValidControl {
  /** Returns whether the valid state is required. */
  required: boolean;

  /** The valid state's validation errors. */
  errors: ValidationResultModel[];

  /** The groups that must be applied in order for the valid state to be enabled. */
  readonly groups: string[];

  /** The valid state's validators. */
  readonly validators: ControlValidatorModel[];

  /** A multicasting observable that emits a validation status whenever it is calculated for the valid state. */
  readonly statusChanges: Observable<ValidationState>;

  /** A multicasting observable of value changes for the valid state that emits every time the value of the valid state changes in the UI, but not programmatically. */
  readonly anyValueChanges: Observable<any | null | undefined>;

  get anyValue(): any | null | undefined;

  /** Returns whether the valid state is valid. A valid state is considered valid if no validation errors exist with the current value. */
  get valid(): boolean;

  /** Returns whether the valid state is invalid, meaning that an error exists in the input value. */
  get invalid(): boolean;

  /** Returns whether the valid state is disabled, meaning that the valid state is disabled in the UI and is exempt from validation checks and excluded from aggregate values of ancestor valid states. */
  get disabled(): boolean;

  /** Returns whether the valid state is enabled, meaning that the valid state is included in ancestor calculations of validity or value. */
  get enabled(): boolean;

  /** Returns the validation status of the valid state. Possible values include: 'VALID', 'INVALID' or 'DISABLED'. */
  get status(): ValidationState;

  /** Returns whether the valid state is dirty, meaning that the user has changed the value in the UI. */
  get dirty(): boolean;

  /** Returns whether the valid state is touched, meaning that the user has triggered a blur event on it. */
  get touched(): boolean;

  /** Returns whether the valid state is untouched, meaning that the user has not yet triggered a blur event on it. */
  get untouched(): boolean;

  /** The validation model that the valid state is a part of. If the valid state is not a part of a validation model, returns undefined. */
  get parent(): ValidGroup | null | undefined;

  /** Validates the current valid state. */
  validate(inactiveGroups: string[]): ValidationResultModel[];

  /** Disables the current valid state. Does nothing if already disabled. */
  disable(): void;

  /** Enables the current valid state. Does nothing if already enabled. */
  enable(): void;

  /** Tells the current valid state that the it was touched. */
  markAsTouched(): void;

  /** Used internally to set the parent for the valid state. */
  setParent(parent: ValidGroup): void;
}
