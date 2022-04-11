import { Subject } from "rxjs";
import { ValidStatus } from "../helpers/valid-status";

export interface ValidControlValueAccessor<T> {
    readonly valueChanged: Subject<T | undefined>;
    readonly statusChanged: Subject<ValidStatus>;
    readonly touched: Subject<void>;

    getValue(): T | undefined;
    setValue(value: T | undefined): void;
    getStatus(): ValidStatus;
    setStatus(status: ValidStatus): void;
    markAsTouched(): void;
}