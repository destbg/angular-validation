import { Subject } from 'rxjs';
import { AbstractValidControl } from './abstract-valid-control';
import { ValidationStatus } from './helpers/validation-status';
import { IControlValueAccessor } from './interfaces/control-value-accessor.interface';
import { TLControl } from './tl-control';
import { ValidControl } from './valid-control';
import { ValidGroup } from './valid-group';

export abstract class BasePageComponent {
  public validGroup!: ValidGroup;

  public isDisabled: boolean = false;

  constructor() {
    this.validGroup = this.buildValidation();
    this.isDisabled = this.validGroup.disabled;

    this.validGroup.statusChanges.subscribe({
      next: this.onValidGroupStatusChanged.bind(this),
    });
  }

  protected abstract buildValidation(): ValidGroup;

  private onValidGroupStatusChanged(status: ValidationStatus): void {
    if (status === 'DISABLED') {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
  }
}

export abstract class BaseControlComponent<T> implements IControlValueAccessor<T> {
  public validControl!: ValidControl<T>;

  public isDisabled: boolean = false;

  public readonly changed: Subject<T | null | undefined>;
  public readonly statusChanged: Subject<ValidationStatus>;
  public readonly touched: Subject<void>;

  constructor(control: TLControl | null | undefined) {
    this.changed = new Subject<T | null | undefined>();
    this.statusChanged = new Subject<ValidationStatus>();
    this.touched = new Subject<void>();

    if (control === null || control === undefined) {
      return;
    }

    control.controlChanges.subscribe({
      next: this.controlChanged.bind(this),
    });
  }

  public abstract writeValue(value: T | null | undefined): void;

  public abstract getValue(): T | null | undefined;

  public abstract validate(): ValidationStatus;

  public abstract markAsTouched(): void;

  private controlChanged(validControl: AbstractValidControl | null | undefined): void {
    if (this.validControl !== null && this.validControl !== undefined) {
      this.validControl.setValueAccessor(undefined);
    }

    this.validControl = validControl as ValidControl<T>;

    if (this.validControl !== null && this.validControl !== undefined) {
      this.validControl.setValueAccessor(this);

      this.validControl.statusChanges.subscribe({
        next: this.onValidControlStatusChanged.bind(this),
      });
    }
  }

  private onValidControlStatusChanged(status: ValidationStatus): void {
    if (status === 'DISABLED') {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
  }
}

export abstract class BaseComponent<T> implements IControlValueAccessor<T> {
  public boundValidControl: ValidControl<T> | null | undefined;
  public tlControl: TLControl | null | undefined;

  public validGroup!: ValidGroup;

  public isDisabled: boolean = false;

  public readonly changed: Subject<T | null | undefined>;
  public readonly statusChanged: Subject<ValidationStatus>;
  public readonly touched: Subject<void>;

  constructor(control: TLControl | null | undefined) {
    this.tlControl = control;
    this.changed = new Subject<T | null | undefined>();
    this.statusChanged = new Subject<ValidationStatus>();
    this.touched = new Subject<void>();

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
      next: this.onStatusChanged.bind(this),
    });
  }

  public abstract writeValue(value: T | null | undefined): void;

  public abstract getValue(): T | null | undefined;

  public validate(): ValidationStatus {
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

  private controlChanged(validControl: AbstractValidControl | null | undefined): void {
    if (this.boundValidControl !== null && this.boundValidControl !== undefined) {
      this.boundValidControl.setValueAccessor(undefined);
    }

    this.boundValidControl = validControl as ValidControl<T>;

    if (this.boundValidControl !== null && this.boundValidControl !== undefined) {
      this.boundValidControl.setValueAccessor(this);

      this.boundValidControl.statusChanges.subscribe({
        next: this.onValidControlStatusChanged.bind(this),
      });
    }
  }

  private onValidControlStatusChanged(status: ValidationStatus): void {
    if (status === 'DISABLED') {
      this.isDisabled = true;
      this.validGroup.disable();
    } else {
      this.isDisabled = false;
      this.validGroup.enable();
    }
  }
}
