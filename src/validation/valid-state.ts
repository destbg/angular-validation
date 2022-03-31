import { BehaviorSubject, Observable } from 'rxjs';
import { IValidState } from './interfaces/valid-state.interface';
import { ValidationResultModel } from './models/validation-result.model';
import { ValidatorModel } from './models/validator.model';

export abstract class ValidState<T> implements IValidState {
  protected readonly _valueChanges: BehaviorSubject<T | undefined | null>;
  protected readonly _statusChanges: BehaviorSubject<'VALID' | 'INVALID' | 'DISABLED'>;

  protected _value: T | undefined | null;
  protected _status: 'VALID' | 'INVALID' | 'DISABLED';
  protected _disabled: boolean;
  protected _parentDisabled: boolean;
  protected _pristine: boolean;
  protected _dirty: boolean;
  protected _touched: boolean;
  protected _initialValue: T | undefined | null;
  protected _parent: IValidState | undefined | null;
  protected _boundControl: IValidState | undefined | null;

  constructor() {
    this.inactiveGroups = [];
    this._status = 'VALID';
    this._disabled = false;
    this._parentDisabled = false;
    this._pristine = true;
    this._dirty = false;
    this._touched = false;
    this.groups = [];
    this.required = false;
    this.validators = [];
    this.errors = [];
    this.requiredFn = (validState) => validState.value !== null && validState.value !== undefined;
    this.requiredGroups = [];

    this._valueChanges = new BehaviorSubject<T | undefined | null>(this._value);
    this._statusChanges = new BehaviorSubject<'VALID' | 'INVALID' | 'DISABLED'>(this._status);

    this.valueChanges = this._valueChanges.asObservable();
    this.anyValueChanges = this.valueChanges;
    this.statusChanges = this._statusChanges.asObservable();
  }

  /** The inactive groups of the valid state. */
  public inactiveGroups: string[];

  /** Returns whether the valid state is required. */
  public required: boolean;

  /** The groups that must be applied in order for the validation function to trigger. */
  public requiredGroups: string[];

  /** The function used to validate when the valid state is required. */
  public requiredFn: (validState: ValidState<T>) => boolean;

  /** The valid state's validation errors. */
  public errors: ValidationResultModel[];

  /** The groups that must be applied in order for the valid state to be enabled. */
  public groups: string[];

  /** The valid state's validators. */
  public validators: ValidatorModel[];

  /** A multicasting observable that emits a validation status whenever it is calculated for the valid state. */
  public readonly statusChanges: Observable<'VALID' | 'INVALID' | 'DISABLED'>;

  /** A multicasting observable of value changes for the valid state that emits every time the value of the valid state changes in the UI, but not programmatically. */
  public readonly valueChanges: Observable<T | null | undefined>;

  /** A multicasting observable of value changes for the valid state that emits every time the value of the valid state changes in the UI, but not programmatically. */
  public readonly anyValueChanges: Observable<any | null | undefined>;

  /** The valid state's value. */
  get value(): T | undefined | null {
    return this._value;
  }

  /** Returns the validation status of the valid state. Possible values include: 'VALID', 'INVALID' or 'DISABLED'. */
  get status(): 'VALID' | 'INVALID' | 'DISABLED' {
    return this._status;
  }

  /** The valid state's value. */
  get anyValue(): any | undefined | null {
    return this._value;
  }

  /** Returns whether the valid state is valid. A valid state is considered valid if no validation errors exist with the current value. */
  get valid(): boolean {
    return this._status !== 'INVALID';
  }

  /** Returns whether the valid state is invalid, meaning that an error exists in the input value. */
  get invalid(): boolean {
    return this._status === 'INVALID';
  }

  /** Returns whether the valid state is disabled, meaning that the valid state is disabled in the UI and is exempt from validation checks and excluded from aggregate values of ancestor valid states. */
  get disabled(): boolean {
    return this._disabled === true || this._parentDisabled === true;
  }

  /** Returns whether the valid state is enabled, meaning that the valid state is included in ancestor calculations of validity or value. */
  get enabled(): boolean {
    return this._disabled === false && this._parentDisabled === false;
  }

  /** Returns whether the valid state is pristine, meaning that the user has not yet changed the value in the UI. */
  get pristine(): boolean {
    return this._pristine === true;
  }

  /** Returns whether the valid state is dirty, meaning that the user has changed the value in the UI. */
  get dirty(): boolean {
    return this._dirty === true;
  }

  /** Returns whether the valid state is touched, meaning that the user has triggered a blur event on it. */
  get touched(): boolean {
    return this._touched === true;
  }

  /** Returns whether the valid state is untouched, meaning that the user has not yet triggered a blur event on it. */
  get untouched(): boolean {
    return this._touched === false;
  }

  /** The validation model that the valid state is a part of. If the valid state is not a part of a validation model, returns undefined. */
  get parent(): IValidState | undefined | null {
    return this._parent;
  }

  /** The first value provided to the valid state. */
  get initialValue(): T | undefined | null {
    return this._initialValue;
  }

  public setValue(value: T | undefined | null, options?: { emitEvent: boolean | undefined }) {
    const equalsOldValue = value === this._value;

    if (!equalsOldValue) {
      this._value = value;

      this._dirty = true;
      this._pristine = this._initialValue === value;

      if (options !== null && options !== undefined) {
        if (options.emitEvent === null || options.emitEvent === undefined || options.emitEvent === true) {
          this._valueChanges.next(value);
        }
      } else {
        this._valueChanges.next(value);
      }
    }
  }

  /** Validates the current valid state. */
  public validate(inactiveGroups: string[]): ValidationResultModel[] {
    if (this._disabled) {
      return [];
    }

    const results: ValidationResultModel[] = [];
    const errorResults: ValidationResultModel[] = [];

    if (this.required) {
      if (this.requiredGroups.filter((f) => inactiveGroups.includes(f)).length === 0) {
        const result: boolean = this.requiredFn(this);

        if (result) {
          const result: ValidationResultModel = {
            identifier: 'required',
            severity: 'ERROR',
          };
          results.push(result);
          errorResults.push(result);
        }
      }
    }

    for (const validator of this.validators) {
      if (validator.groups.filter((f) => inactiveGroups.includes(f)).length === 0) {
        const result: boolean = validator.fn(this);

        if (result) {
          const result: ValidationResultModel = {
            identifier: validator.identifier,
            severity: validator.severity,
          };
          results.push(result);

          if (validator.severity === 'ERROR') {
            errorResults.push(result);
          }
        }
      }
    }

    const status = errorResults.length === 0 ? 'VALID' : 'INVALID';

    if (status !== this._status) {
      this._status = status;
      this._statusChanges.next(status);
    }

    this.errors = results;
    return results;
  }

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

  /** Tells the current valid state that it's parent control was disabled. Does nothing if already disabled. */
  public parentDisabled(): void {
    if (this._parentDisabled) {
      return;
    }

    this.onDisable();

    this._parentDisabled = true;
    this._status = 'DISABLED';
    this.errors = [];
    this._statusChanges.next(this._status);
  }

  /** Tells the current valid state that it's parent control was enabled. Does nothing if already enabled. */
  public parentEnabled(): void {
    if (!this._parentDisabled) {
      return;
    }

    this.onEnable();

    this._parentDisabled = false;
    if (this._parent !== null && this._parent !== undefined) {
      this.validate(this._parent.inactiveGroups);
    }
  }

  /** Tells the current valid state that the it was touched. */
  public wasTouched(): void {
    if (this._touched === true) {
      return;
    }

    this.onTouched();
    this._touched = true;
  }

  /** Used internally to set the parent for the valid state. */
  public setParent(parent: IValidState): void {
    this._parent = parent;
  }

  /** Used internally to set the bound control for the valid state. */
  public setBoundControl(control: ValidState<T>): void {
    this._boundControl = control;

    control.setParent(this);

    control.valueChanges.subscribe({
      next: (value) => {
        this.setValue(value);
      },
    });

    control.statusChanges.subscribe({
      next: (status) => {
        this.setStatus(status);
      },
    });
  }

  protected abstract onDisable(): void;

  protected abstract onEnable(): void;

  protected abstract onTouched(): void;

  protected setStatus(value: 'VALID' | 'INVALID' | 'DISABLED', options?: { emitEvent: boolean | undefined }) {
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
