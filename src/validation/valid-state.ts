import { BehaviorSubject, Observable } from 'rxjs';
import { ValidationState } from './helpers/validation-state';
import { ValidationResultModel } from './models/validation-result.model';
import { ValidGroup } from './valid-group';

export abstract class ValidState {
  protected readonly _statusChanges: BehaviorSubject<ValidationState>;

  protected _status: ValidationState;
  protected _disabled: boolean;
  protected _pristine: boolean;
  protected _dirty: boolean;
  protected _touched: boolean;
  protected _parent: ValidGroup | null | undefined;

  constructor() {
    this._status = 'VALID';
    this._disabled = false;
    this._pristine = true;
    this._dirty = false;
    this._touched = false;
    this.groups = [];
    this.required = false;
    this.errors = [];
    this.requiredGroups = [];

    this._statusChanges = new BehaviorSubject<ValidationState>(this._status);

    this.statusChanges = this._statusChanges.asObservable();
  }

  /** Returns whether the valid state is required. */
  public required: boolean;

  /** The groups that must be applied in order for the validation function to trigger. */
  public readonly requiredGroups: string[];

  /** The valid state's validation errors. */
  public errors: ValidationResultModel[];

  /** The groups that must be applied in order for the valid state to be enabled. */
  public groups: string[];

  /** A multicasting observable that emits a validation status whenever it is calculated for the valid state. */
  public readonly statusChanges: Observable<ValidationState>;

  /** Returns the validation status of the valid state. Possible values include: 'VALID', 'INVALID' or 'DISABLED'. */
  public get status(): ValidationState {
    return this._status;
  }

  /** Returns whether the valid state is valid. A valid state is considered valid if no validation errors exist with the current value. */
  public get valid(): boolean {
    return this._status !== 'INVALID';
  }

  /** Returns whether the valid state is invalid, meaning that an error exists in the input value. */
  public get invalid(): boolean {
    return this._status === 'INVALID';
  }

  /** Returns whether the valid state is disabled, meaning that the valid state is disabled in the UI and is exempt from validation checks and excluded from aggregate values of ancestor valid states. */
  public get disabled(): boolean {
    return this._disabled === true;
  }

  /** Returns whether the valid state is enabled, meaning that the valid state is included in ancestor calculations of validity or value. */
  public get enabled(): boolean {
    return this._disabled === false;
  }

  /** Returns whether the valid state is pristine, meaning that the user has not yet changed the value in the UI. */
  public get pristine(): boolean {
    return this._pristine === true;
  }

  /** Returns whether the valid state is dirty, meaning that the user has changed the value in the UI. */
  public get dirty(): boolean {
    return this._dirty === true;
  }

  /** Returns whether the valid state is touched, meaning that the user has triggered a blur event on it. */
  public get touched(): boolean {
    return this._touched === true;
  }

  /** Returns whether the valid state is untouched, meaning that the user has not yet triggered a blur event on it. */
  public get untouched(): boolean {
    return this._touched === false;
  }

  /** The validation model that the valid state is a part of. If the valid state is not a part of a validation model, returns undefined. */
  public get parent(): ValidGroup | null | undefined {
    return this._parent;
  }

  /** Validates the current valid state. */
  public abstract validate(inactiveGroups: string[]): ValidationResultModel[];

  /** Disables the current valid state. Does nothing if already disabled. */
  public disable(): void {
    if (this._disabled) {
      return;
    }

    this.onDisable();

    this._disabled = true;
    this._status = 'DISABLED';
    this.errors = [];
    this._statusChanges.next(this._status);
  }

  /** Enables the current valid state. Does nothing if already enabled. */
  public enable(): void {
    if (!this._disabled) {
      return;
    }

    this.onEnable();

    this._disabled = false;
    if (this._parent !== null && this._parent !== undefined) {
      this.validate(this._parent.inactiveGroups);
    }
  }

  /** Tells the current valid state that the it was touched. */
  public markAsTouched(): void {
    if (this._touched === true) {
      return;
    }

    this.onTouched();
    this._touched = true;
  }

  /** Used internally to set the parent for the valid state. */
  public setParent(parent: ValidGroup): void {
    this._parent = parent;
  }

  protected abstract onDisable(): void;

  protected abstract onEnable(): void;

  protected abstract onTouched(): void;

  protected setStatus(value: ValidationState, options?: { emitEvent: boolean | undefined }) {
    const equalsOldValue = value === this._status;

    if (!equalsOldValue) {
      this._status = value;

      if (options !== null && options !== undefined) {
        if (options.emitEvent === null || options.emitEvent === undefined || options.emitEvent === true) {
          this._statusChanges.next(value);
        }
      } else {
        this._statusChanges.next(value);
      }
    }
  }
}
