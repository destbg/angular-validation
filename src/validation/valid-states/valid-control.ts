import { Observable, Subject, Subscription } from "rxjs";
import { AbstractValidControl } from "../abstractions/abstract-valid-control";
import { ValidControlValueAccessor } from "../abstractions/valid-control-value-accessor";
import { ValidStatus } from "../helpers/valid-status";
import { ValidType } from "../helpers/valid-type";
import { ControlValidator } from "../models/control-validator";
import { SetStatusModel } from "../models/set-status.model";
import { SetValueModel } from "../models/set-value.model";
import { ValidControlBuilder } from "../models/valid-control-builder";
import { ValidationResult } from "../models/validation-result";

export class ValidControl<T> extends AbstractValidControl {
    private readonly _valueChanges: Subject<T | undefined>;

    private _valueAccessor: ValidControlValueAccessor<T> | undefined;
    private _valueAccessorSubscriptions: Subscription[] | undefined;
    private _value: T | undefined;

    constructor(builder?: ValidControlBuilder<T>) {
        super();

        if (builder !== undefined) {
            this._value = builder.value;

            if (builder.disabled === true) {
                this._status = 'DISABLED';
            }

            if (builder.groups !== null && builder.groups !== undefined) {
                this.groups = builder.groups;
            }

            if (builder.validators !== null && builder.validators !== undefined) {
                for (const validator of builder.validators) {
                    validator.control = this;
                    this.validators.push(validator);
                }
            }

            if (builder.required === true) {
                this.required = builder.required;
            }
        }

        this.requiredFn = (validState) => validState.value !== null && validState.value !== undefined;

        this._valueChanges = new Subject<T | undefined>();
        this.valueChanges = this._valueChanges.asObservable();
        this.anyValueChanges = this.valueChanges;
    }

    public requiredFn: (validState: ValidControl<T>) => boolean;
    public readonly valueChanges: Observable<T | undefined>;
    public readonly anyValueChanges: Observable<any | undefined>;

    public get valueAccessor(): ValidControlValueAccessor<T> | undefined {
        return this._valueAccessor;
    }

    public get value(): T | undefined {
        return this._value;
    }

    public get anyValue(): any | undefined {
        return this.value;
    }

    public setValue(value: T | undefined, options?: SetValueModel): void {
        this._value = value;
        this._valueAccessor?.setValue(value);

        if (options !== null && options !== undefined) {
            if (options.emitEvent !== null && options.emitEvent !== undefined && options.emitEvent === true) {
                this._valueChanges.next(value);
            }

            if (options.validate !== null && options.validate !== undefined && options.validate === true) {
                this.validate();
            }
        }
    }

    public setStatus(status: ValidStatus, options?: SetStatusModel): void {
        if (this._status !== status) {
            this._status = status;

            if (options !== null && options !== undefined) {
                if (options.emitEvent !== null && options.emitEvent !== undefined && options.emitEvent === true) {
                    this._statusChanges.next(status);
                }
            }

            if (status === 'PENDING') {
                this.validate();
            }
        }
    }

    public disable(): void {
        if (this._status === 'DISABLED') {
            return;
        }

        this._valueAccessor?.setStatus('DISABLED');
        this._status = 'DISABLED';
        this.errors = [];
        this._statusChanges.next(this._status);
    }

    public enable(): void {
        if (this._status !== 'DISABLED') {
            return;
        }

        this._status = 'PENDING';
        this.validate();
        this._valueAccessor?.setStatus('PENDING');
    }

    public markAsTouched(): void {
        this._valueAccessor?.markAsTouched();
        this.validate();
        this._touched = true;
    }

    public addValidator(validator: ControlValidator): void {
        validator.control = this;
        this.validators.push(validator);

        if (this._touched) {
            this.validate();
        }
    }

    public removeValidator(validatorIdentifier: string): void {
        const index = this.validators.findIndex(f => f.identifier === validatorIdentifier);

        if (index !== -1) {
            this.validators.splice(index, 1);

            if (this._touched) {
                this.validate();
            }
        }
    }

    public setValueAccessor(valueAccessor: ValidControlValueAccessor<T> | undefined): void {
        if (this._valueAccessorSubscriptions !== undefined) {
            for (const sub of this._valueAccessorSubscriptions) {
                sub.unsubscribe();
            }
        }

        this._valueAccessor = valueAccessor;

        if (valueAccessor !== null && valueAccessor !== undefined) {
            valueAccessor.setValue(this._value);

            this._valueAccessorSubscriptions = [
                valueAccessor.valueChanged.subscribe({
                    next: this.onValueAccessorValueChanged.bind(this),
                }),
                valueAccessor.statusChanged.subscribe({
                    next: this.onValueAccessorStatusChanged.bind(this),
                }),
                valueAccessor.touched.subscribe({
                    next: this.onValueAccessorTouched.bind(this),
                }),
            ];
        }
    }

    public validType(): ValidType {
        return 'CONTROL';
    }

    private validate(): void {
        if (this._status === 'DISABLED') {
            return;
        }

        const inactiveGroups: string[] = this._parent?.inactiveGroups ?? [];

        const results: ValidationResult[] = [];
        const errorResults: ValidationResult[] = [];

        if (this.required && this.requiredGroups.filter((f) => inactiveGroups.includes(f)).length === 0) {
            const result: boolean = this.requiredFn(this);

            if (!result) {
                const resultModel: ValidationResult = {
                    identifier: 'required',
                    severity: 'ERROR',
                    format: (err) => err,
                };
                results.push(resultModel);
                errorResults.push(resultModel);
            }
        }

        for (const validator of this.validators) {
            if (validator.groups.filter((f) => inactiveGroups.includes(f)).length === 0) {
                const result: boolean = validator.fn();

                if (!result) {
                    const resultModel: ValidationResult = {
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

        const status: ValidStatus = errorResults.length === 0
            ? (this._valueAccessor?.getStatus() ?? 'VALID')
            : 'INVALID'

        if (status !== this._status) {
            this._status = status;
            this._statusChanges.next(status);
        }

        this.errors = results;
    }

    private onValueAccessorValueChanged(value: T | undefined): void {
        this._value = value;
        this._dirty = true;
        this._touched = true;

        this.validate();
        this._valueChanges.next(value);
    }

    private onValueAccessorStatusChanged(status: ValidStatus): void {
        if (this._status !== status) {
            this._status = status;
            this._statusChanges.next(status);
        }
    }

    private onValueAccessorTouched(): void {
        this._touched = true;

        this.validate();
    }
}