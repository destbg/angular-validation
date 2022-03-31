import { Subject, Observable } from 'rxjs';
import { ValidationState } from './helpers/validation-state';
import { IControlValueAccessor } from './interfaces/control-value-accessor.interface';
import { IValidControl } from './interfaces/valid-control.interface';
import { ValidationResultModel } from './models/validation-result.model';
import { ControlValidatorModel, RequiredValidatorModel } from './models/validator.model';
import { ValidControlBuilder } from './valid-control-builder';
import { ValidState } from './valid-state';

export class ValidControl<T> extends ValidState implements IValidControl {
  private readonly _valueChanges: Subject<T | null | undefined>;

  private _valueAccessor: IControlValueAccessor<T> | null | undefined;
  private _value: T | null | undefined;
  private _initialValue: T | null | undefined;

  constructor(builder?: ValidControlBuilder<T>) {
    super();

    this.validators = [];

    if (builder !== null && builder !== undefined) {
      this._initialValue = builder.value;
      this._value = builder.value;

      if (builder.disabled !== null && builder.disabled !== undefined) {
        this._disabled = builder.disabled;

        if (this._disabled === true) {
          this._status = 'DISABLED';
        }
      }

      if (builder.groups !== null && builder.groups !== undefined) {
        this.groups = builder.groups;
      }

      if (builder.validators !== null && builder.validators !== undefined) {
        const validators: ControlValidatorModel[] = [];
        let required: boolean = false;

        for (const validator of builder.validators) {
          if ((validator as any).fn === undefined) {
            required = true;
          } else {
            validators.push(validator as ControlValidatorModel);
          }
        }

        this.required = required;
        this.validators = validators;
      }
    }

    this.requiredFn = (validState) => validState.value !== null && validState.value !== undefined;

    this._valueChanges = new Subject<T | null | undefined>();
    this.valueChanges = this._valueChanges.asObservable();
    this.anyValueChanges = this.valueChanges;
  }

  /** The function used to validate when the valid state is required. */
  public requiredFn: (validState: ValidControl<T>) => boolean;

  /** The valid state's validators. */
  public readonly validators: ControlValidatorModel[];

  /** A multicasting observable of value changes for the valid state that emits every time the value of the valid state changes in the UI, but not programmatically. */
  public readonly valueChanges: Observable<T | null | undefined>;

  /** A multicasting observable of value changes for the valid state that emits every time the value of the valid state changes in the UI, but not programmatically. */
  public readonly anyValueChanges: Observable<any | null | undefined>;

  /** The control that the current ValidControl is bound to. */
  public get valueAccessor(): IControlValueAccessor<T> | null | undefined {
    return this._valueAccessor;
  }

  /** The valid state's value. */
  public get value(): T | null | undefined {
    return this._value;
  }

  /** The valid state's value. */
  public get anyValue(): any | null | undefined {
    return this._value;
  }

  /** The first value provided to the valid state. */
  public get initialValue(): T | null | undefined {
    return this._initialValue;
  }

  public setValue(value: T | null | undefined, options?: { emitEvent: boolean | undefined }) {
    this._value = value;

    if (this._valueAccessor !== null && this._valueAccessor !== undefined) {
      this._valueAccessor.writeValue(this._value);
    }

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

  /** Validates the current valid state. */
  public validate(inactiveGroups: string[]): ValidationResultModel[] {
    if (this.disabled) {
      return [];
    }

    const results: ValidationResultModel[] = [];
    const errorResults: ValidationResultModel[] = [];

    if (this.required) {
      if (this.requiredGroups.filter((f) => inactiveGroups.includes(f)).length === 0) {
        const result: boolean = this.requiredFn(this);

        if (!result) {
          const result: ValidationResultModel = {
            identifier: 'required',
            severity: 'ERROR',
            format: (err) => err,
          };
          results.push(result);
          errorResults.push(result);
        }
      }
    }

    for (const validator of this.validators) {
      if (validator.groups.filter((f) => inactiveGroups.includes(f)).length === 0) {
        const result: boolean = validator.fn(this);

        if (!result) {
          const result: ValidationResultModel = {
            identifier: validator.identifier,
            severity: validator.severity,
            format: validator.format.bind(validator),
          };
          results.push(result);

          if (validator.severity === 'ERROR') {
            errorResults.push(result);
          }
        }
      }
    }

    let status: ValidationState;

    if (this._valueAccessor !== null && this._valueAccessor !== undefined) {
      const valueAccessorState = this._valueAccessor.validate();

      if (valueAccessorState === 'INVALID') {
        status = valueAccessorState;
      } else {
        status = errorResults.length === 0 ? 'VALID' : 'INVALID';
      }
    } else {
      status = errorResults.length === 0 ? 'VALID' : 'INVALID';
    }

    if (status !== this._status) {
      this._status = status;
      this._statusChanges.next(status);
    }

    this.errors = results;
    return results;
  }

  public setValueAccessor(valueAccessor: IControlValueAccessor<T>): void {
    this._valueAccessor = valueAccessor;

    valueAccessor.writeValue(this._value);

    valueAccessor.changed.subscribe({
      next: this.onValueAccessorValueChanged.bind(this),
    });
  }

  protected onDisable(): void {}
  protected onEnable(): void {}
  protected onTouched(): void {}

  private onValueAccessorValueChanged(value: T | null | undefined): void {
    if (this._parent !== null && this._parent !== undefined) {
      this.validate(this._parent.inactiveGroups);
    }

    this.setValue(value);
  }
}
