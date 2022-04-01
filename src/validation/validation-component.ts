import { Subject } from 'rxjs';
import { ValidationState } from './helpers/validation-state';
import { IControlValueAccessor } from './interfaces/control-value-accessor.interface';
import { IValidControl } from './interfaces/valid-control.interface';
import { ControlValidatorModel, ValidatorModel } from './models/validator.model';
import { TLControl } from './tl-control';
import { ValidControl } from './valid-control';
import { ValidGroup } from './valid-group';

export abstract class BasePageValidationComponent {
  public validGroup!: ValidGroup;
  public validators!: ValidatorModel[];

  public isDisabled: boolean = false;

  constructor() {
    this.validGroup = this.buildValidation();
    this.isDisabled = this.validGroup.disabled;

    this.validGroup.statusChanges.subscribe({
      next: this.onValidGroupStatusChanged.bind(this),
    });
  }

  protected abstract buildValidation(): ValidGroup;

  private onValidGroupStatusChanged(status: ValidationState): void {
    if (status === 'DISABLED') {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
  }
}

export abstract class BaseControlValidationComponent<T> implements IControlValueAccessor<T> {
  public validControl!: ValidControl<T>;

  public isDisabled: boolean = false;

  public validators!: ControlValidatorModel[];

  public readonly changed: Subject<T | null | undefined>;
  public readonly statusChanged: Subject<ValidationState>;

  constructor(control: TLControl | null | undefined) {
    this.changed = new Subject<T | null | undefined>();
    this.statusChanged = new Subject<ValidationState>();

    if (control === null || control === undefined) {
      return;
    }

    control.controlChanges.subscribe({
      next: this.controlChanged.bind(this),
    });
  }

  public abstract writeValue(value: T | null | undefined): void;

  public abstract getValue(): T | null | undefined;

  public abstract validate(): ValidationState;

  public abstract markAsTouched(): void;

  private controlChanged(validControl: IValidControl | null | undefined): void {
    if (this.validControl !== null && this.validControl !== undefined) {
      this.validControl.setValueAccessor(undefined);
    }

    this.validControl = validControl as ValidControl<T>;

    if (this.validControl !== null && this.validControl !== undefined) {
      this.validControl.setValueAccessor(this);
      this.validators = this.validControl.validators;

      this.validControl.statusChanges.subscribe({
        next: this.onValidControlStatusChanged.bind(this),
      });
    }
  }

  private onValidControlStatusChanged(status: ValidationState): void {
    if (status === 'DISABLED') {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
  }
}

export abstract class BaseValidationComponent<T> implements IControlValueAccessor<T> {
  private _validControl: ValidControl<T> | null | undefined;

  public validGroup!: ValidGroup;
  public validators!: ControlValidatorModel[];

  public isDisabled: boolean = false;

  public readonly changed: Subject<T | null | undefined>;
  public readonly statusChanged: Subject<ValidationState>;

  constructor(control: TLControl | null | undefined) {
    this.changed = new Subject<T | null | undefined>();
    this.statusChanged = new Subject<ValidationState>();

    if (control === null || control === undefined) {
      return;
    }

    control.controlChanges.subscribe({
      next: this.controlChanged.bind(this),
    });

    this.validGroup = this.buildValidation();

    this.validGroup.childValueChanges.subscribe({
      next: this.onChanged.bind(this),
    });

    this.validGroup.statusChanges.subscribe({
      next: this.onChanged.bind(this),
    });
  }

  public abstract writeValue(value: T | null | undefined): void;

  public abstract getValue(): T | null | undefined;

  public validate(): ValidationState {
    this.validGroup.checkGroups();
    this.validGroup.validate(this.validGroup.inactiveGroups);
    return this.validGroup.status;
  }

  public markAsTouched(): void {
    this.validGroup.markAsTouched();
  }

  protected abstract buildValidation(): ValidGroup;

  protected onChanged(): void {
    this.changed.next(this.getValue());
  }

  protected onStatusChanged(): void {
    this.statusChanged.next(this.validGroup.status);
  }

  private controlChanged(validControl: IValidControl | null | undefined): void {
    if (this._validControl !== null && this._validControl !== undefined) {
      this._validControl.setValueAccessor(undefined);
    }

    this._validControl = validControl as ValidControl<T>;

    if (this._validControl !== null && this._validControl !== undefined) {
      this._validControl.setValueAccessor(this);
      this.validators = this._validControl.validators;

      this._validControl.statusChanges.subscribe({
        next: this.onValidControlStatusChanged.bind(this),
      });
    }
  }

  private onValidControlStatusChanged(status: ValidationState): void {
    if (status === 'DISABLED') {
      this.isDisabled = true;
      this.validGroup.disable();
    } else {
      this.isDisabled = false;
      this.validGroup.enable();
    }
  }
}
