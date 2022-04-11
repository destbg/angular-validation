import { Subject } from "rxjs";
import { ValidStatus } from "../helpers/valid-status";
import { ValidControl } from "../valid-states/valid-control";
import { AbstractValidControl } from "./abstract-valid-control";
import { TLControl } from "./tl-control";
import { ValidControlValueAccessor } from "./valid-control-value-accessor";

export abstract class BaseControlComponent<T> implements ValidControlValueAccessor<T> {
    public validControl!: ValidControl<T>;

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
    }

    public abstract setValue(value: T | undefined): void;

    public abstract getStatus(): ValidStatus;

    public abstract setStatus(status: ValidStatus): void;

    public abstract getValue(): T | undefined;

    public abstract markAsTouched(): void;

    protected abstract validControlChanged(): void;

    private controlChanged(validControl: AbstractValidControl | undefined): void {
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

    private onValidControlStatusChanged(status: ValidStatus): void {
        if (status === 'DISABLED') {
            this.isDisabled = true;
        } else {
            this.isDisabled = false;
        }
    }
}