import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { ValidStatus } from "../helpers/valid-status";
import { ValidControl } from "../valid-states/valid-control";
import { AbstractValidControl } from "./abstract-valid-control";
import { TLControl } from "./tl-control";
import { ValidControlValueAccessor } from "./valid-control-value-accessor";

export abstract class BaseReactiveFormsComponent<T> implements ValidControlValueAccessor<T> {
    private _validControl: ValidControl<T> | undefined;
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

    public readonly valueChanged: Subject<T | undefined>;
    public readonly statusChanged: Subject<ValidStatus>;
    public readonly touched: Subject<void>;

    constructor(control: TLControl | undefined) {
        this.valueChanged = new Subject<T | undefined>();
        this.statusChanged = new Subject<ValidStatus>();
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

    public getStatus(): ValidStatus {
        return this._abstractControl.status;
    }

    public setStatus(status: ValidStatus): void {
        switch (status) {
            case 'DISABLED':
                this._abstractControl.disable();
                break;
            case 'PENDING':
                this._abstractControl.markAsPending();
                break;
            case 'INVALID':
            case 'VALID':
                this._abstractControl.enable();
                break;
        }
    }

    public abstract setValue(value: T | undefined): void;

    public abstract getValue(): T | undefined;

    public markAsTouched(): void {
        this._abstractControl.markAsTouched();
    }

    protected abstract buildValidation(): AbstractControl;

    protected onChanged(): void {
        this.valueChanged.next(this.getValue());
    }

    protected onStatusChanged(): void {
        this.statusChanged.next(this._abstractControl.status);
    }

    private controlChanged(validControl: AbstractValidControl | undefined): void {
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

    private onValidControlStatusChanged(status: ValidStatus): void {
        if (status === 'DISABLED') {
            this.isDisabled = true;
            this._abstractControl.disable();
        } else {
            this.isDisabled = false;
            this._abstractControl.enable();
        }
    }
}