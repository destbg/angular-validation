import { Observable, Subject } from 'rxjs';
import { ValidationStatus } from './helpers/validation-status';
import { ValidationResultModel } from './models/validation-result.model';
import { ValidGroup } from './valid-group';

export abstract class ValidState {
  protected readonly _statusChanges: Subject<ValidationStatus>;

  protected _status: ValidationStatus;
  protected _disabled: boolean;
  protected _dirty: boolean;
  protected _touched: boolean;
  protected _parent: ValidGroup | null | undefined;
  protected _name: string | null | undefined;

  constructor() {
    this._status = 'VALID';
    this._disabled = false;
    this._dirty = false;
    this._touched = false;

    this._statusChanges = new Subject<ValidationStatus>();
    this.statusChanges = this._statusChanges.asObservable();
  }

  /** A multicasting observable that emits a validation status whenever it is calculated for the valid state. */
  public readonly statusChanges: Observable<ValidationStatus>;

  /** Returns the validation status of the valid state. Possible values include: 'VALID', 'INVALID' or 'DISABLED'. */
  public get status(): ValidationStatus {
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

  /** The name given to the control by the parent. */
  public get name(): string | null | undefined {
    return this._name;
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
    this._statusChanges.next(this._status);
  }

  /** Enables the current valid state. Does nothing if already enabled. */
  public enable(): void {
    if (!this._disabled) {
      return;
    }

    this.onEnable();

    this._disabled = false;
    this.validate(this._parent?.inactiveGroups ?? []);
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
  public setParent(parent: ValidGroup, name: string | null | undefined): void {
    this._parent = parent;
    this._name = name;
  }

  protected abstract onDisable(): void;

  protected abstract onEnable(): void;

  protected abstract onTouched(): void;
}
