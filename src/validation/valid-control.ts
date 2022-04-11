import { Subject, Observable } from 'rxjs';
import { ValidationStatus } from './helpers/validation-status';
import { IControlValueAccessor } from './interfaces/control-value-accessor.interface';
import { ValidationResultModel } from './models/validation-result.model';
import { ControlValidatorModel } from './models/validator.model';
import { ValidControlBuilder } from './models/valid-control-builder';
import { SetValueModel } from './set-value.model';
import { ValidType } from './helpers/valid-type';
import { AbstractValidControl } from './abstract-valid-control';

export class ValidControl<T> extends AbstractValidControl {
    private readonly _valueChanges: Subject<T | null | undefined>;

    private _valueAccessor: IControlValueAccessor<T> | null | undefined;
    private _value: T | null | undefined;

    constructor(builder?: ValidControlBuilder<T>) {
        super();

        if (builder !== null && builder !== undefined) {
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
                this.validators = builder.validators;
            }

            if (builder.required === true) {
                this.required = builder.required;
            }
        }

        this.requiredFn = (validState) => validState.value !== null && validState.value !== undefined;

        this._valueChanges = new Subject<T | null | undefined>();
        this.valueChanges = this._valueChanges.asObservable();
        this.anyValueChanges = this.valueChanges;
    }

    /** The function used to validate when the valid state is required. */
    public requiredFn: (validState: ValidControl<T>) => boolean;

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
        return this.value;
    }

    public setValue(value: T | null | undefined, options?: SetValueModel): void {
        this._value = value;

        if (this._parent !== null && this._parent !== undefined) {
            this._parent.startMassUpdate();
        }

        if (this._valueAccessor !== null && this._valueAccessor !== undefined) {
            this._valueAccessor.writeValue(this._value);
        }

        this._dirty = true;

        if (options !== null && options !== undefined) {
            if (options.emitEvent !== null || options.emitEvent !== undefined || options.emitEvent === false) {
                this._valueChanges.next(value);
            }
        }

        if (this._parent !== null && this._parent !== undefined) {
            this._parent.endMassUpdate();
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
                    const resultModel: ValidationResultModel = {
                        identifier: 'required',
                        severity: 'ERROR',
                        format: (err) => err,
                    };
                    results.push(resultModel);
                    errorResults.push(resultModel);
                }
            }
        }

        for (const validator of this.validators) {
            if (validator.groups.filter((f) => inactiveGroups.includes(f)).length === 0) {
                const result: boolean = validator.fn(this);

                if (!result) {
                    const resultModel: ValidationResultModel = {
                        identifier: validator.identifier,
                        severity: validator.severity,
                        format: validator.format.bind(validator),
                    };
                    results.push(resultModel);

                    if (validator.severity === 'ERROR') {
                        errorResults.push(resultModel);
                    }
                }
            }
        }

        let status: ValidationStatus;

        if (this._valueAccessor !== null && this._valueAccessor !== undefined) {
            const valueAccessorState = this._valueAccessor.validate();

            if (valueAccessorState !== 'VALID') {
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

    public setValueAccessor(valueAccessor: IControlValueAccessor<T> | null | undefined): void {
        this._valueAccessor = valueAccessor;

        if (valueAccessor !== null && valueAccessor !== undefined) {
            valueAccessor.writeValue(this._value);

            valueAccessor.changed.subscribe({
                next: this.onValueAccessorValueChanged.bind(this),
            });

            valueAccessor.statusChanged.subscribe({
                next: this.onValueAccessorStatusChanged.bind(this),
            });

            valueAccessor.touched.subscribe({
                next: this.onValueAccessorTouched.bind(this),
            });
        }
    }

    public validType(): ValidType {
        return 'CONTROL';
    }

    protected onDisable(): void {
        this.errors = [];
    }

    protected onEnable(): void { }

    protected onTouched(): void {
        this._valueAccessor?.markAsTouched();
        this.validate(this._parent?.inactiveGroups ?? []);
    }

    private onValueAccessorValueChanged(value: T | null | undefined): void {
        this._value = value;
        this._dirty = true;
        this._touched = true;

        this._valueChanges.next(value);

        this.validate(this._parent?.inactiveGroups ?? []);
    }

    private onValueAccessorStatusChanged(status: ValidationStatus): void {
        if (this._status !== status) {
            this._status = status;
            this._statusChanges.next(status);
        }
    }

    private onValueAccessorTouched(): void {
        this._touched = true;

        this.validate(this._parent?.inactiveGroups ?? []);
    }
}
