import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { AbstractValidControl } from "./abstract-valid-control";
import { ValidationStatus } from "./helpers/validation-status";
import { IControlValueAccessor } from "./interfaces/control-value-accessor.interface";
import { TLControl } from "./tl-control";
import { ReactiveFormsUtil } from "./utils/reactive-forms.util";
import { ValidControl } from "./valid-control";

export abstract class BaseReactiveFormsComponent<T> implements IControlValueAccessor<T> {
    private _validControl: ValidControl<T> | null | undefined;
    private _abstractControl!: AbstractControl;

    public get control(): FormControl {
        return this._abstractControl as FormControl;
    }

    public get form(): FormGroup {
        return this._abstractControl as FormGroup;
    }

    public get formArray(): FormArray {
        return this._abstractControl as FormArray;
    }

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

        this._abstractControl = this.buildValidation();

        this._abstractControl.valueChanges.subscribe({
            next: this.onChanged.bind(this),
        });

        this._abstractControl.statusChanges.subscribe({
            next: this.onStatusChanged.bind(this),
        });
    }

    public abstract writeValue(value: T | null | undefined): void;

    public abstract getValue(): T | null | undefined;

    public validate(): ValidationStatus {
        this._abstractControl.markAsPending();
        return ReactiveFormsUtil.mapStatus(this._abstractControl.status);
    }

    public markAsTouched(): void {
        this._abstractControl.markAsTouched();
    }

    protected abstract buildValidation(): AbstractControl;

    protected onChanged(): void {
        this.changed.next(this.getValue());
    }

    protected onStatusChanged(): void {
        this.statusChanged.next(ReactiveFormsUtil.mapStatus(this._abstractControl.status));
    }

    private controlChanged(validControl: AbstractValidControl | null | undefined): void {
        if (this._validControl !== null && this._validControl !== undefined) {
            this._validControl.setValueAccessor(undefined);
        }

        this._validControl = validControl as ValidControl<T>;

        if (this._validControl !== null && this._validControl !== undefined) {
            this._validControl.setValueAccessor(this);

            this._validControl.statusChanges.subscribe({
                next: this.onValidControlStatusChanged.bind(this),
            });
        }
    }

    private onValidControlStatusChanged(status: ValidationStatus): void {
        if (status === 'DISABLED') {
            this.isDisabled = true;
            this._abstractControl.disable();
        } else {
            this.isDisabled = false;
            this._abstractControl.enable();
        }
    }
}
