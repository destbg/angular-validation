import { Subject } from "rxjs";
import { ValidStatus } from "../helpers/valid-status";
import { ValidControl } from "../valid-states/valid-control";
import { ValidGroup } from "../valid-states/valid-group";
import { AbstractValidControl } from "./abstract-valid-control";
import { TLControl } from "./tl-control";
import { ValidControlValueAccessor } from "./valid-control-value-accessor";

export abstract class BaseComponent<T> implements ValidControlValueAccessor<T> {
    public boundValidControl: ValidControl<T> | undefined;
    public tlControl: TLControl | undefined;

    public validGroup!: ValidGroup;

    public isDisabled: boolean = false;

    public readonly valueChanged: Subject<T | undefined>;
    public readonly statusChanged: Subject<ValidStatus>;
    public readonly touched: Subject<void>;

    constructor(control: TLControl | undefined) {
        this.tlControl = control;
        this.valueChanged = new Subject<T | undefined>();
        this.statusChanged = new Subject<ValidStatus>();
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

    public getStatus(): ValidStatus {
        return this.validGroup.status;
    }

    public setStatus(status: ValidStatus): void {
        this.validGroup.setStatus(status);
    }

    public abstract setValue(value: T | undefined): void;

    public abstract getValue(): T | undefined;

    public markAsTouched(): void {
        this.validGroup.markAsTouched();
    }

    protected abstract buildValidation(): ValidGroup;

    protected onChanged(): void {
        this.valueChanged.next(this.getValue());
    }

    protected onStatusChanged(): void {
        this.statusChanged.next(this.validGroup.status);
    }

    private controlChanged(validControl: AbstractValidControl | undefined): void {
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

    private onValidControlStatusChanged(status: ValidStatus): void {
        if (status === 'DISABLED') {
            this.isDisabled = true;
        } else {
            this.isDisabled = false;
        }
    }
}