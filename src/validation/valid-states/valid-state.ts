import { Observable, Subject } from "rxjs";
import { ValidStatus } from "../helpers/valid-status";
import { ValidType } from "../helpers/valid-type";
import { SetStatusModel } from "../models/set-status.model";
import { ValidationResult } from "../models/validation-result";
import { ValidGroup } from "./valid-group";

export abstract class ValidState {
    protected readonly _statusChanges: Subject<ValidStatus>;

    protected _status: ValidStatus;
    protected _dirty: boolean;
    protected _touched: boolean;
    protected _parent: ValidGroup | undefined;
    protected _name: string | undefined;
    protected _label: string | undefined;

    constructor() {
        this._status = 'VALID';
        this._dirty = false;
        this._touched = false;
        this.errors = [];
        this.groups = [];
        this.required = false;
        this.requiredGroups = [];

        this._statusChanges = new Subject<ValidStatus>();
        this.statusChanges = this._statusChanges.asObservable();
    }

    public readonly statusChanges: Observable<ValidStatus>;
    public readonly requiredGroups: string[];
    public required: boolean;
    public groups: string[];
    public errors: ValidationResult[];

    public get status(): ValidStatus {
        return this._status;
    }

    public get valid(): boolean {
        return this._status !== 'INVALID';
    }

    public get invalid(): boolean {
        return this._status === 'INVALID';
    }

    public get disabled(): boolean {
        return this._status === 'DISABLED';
    }

    public get enabled(): boolean {
        return !this.disabled;
    }

    public get dirty(): boolean {
        return this._dirty === true;
    }

    public get touched(): boolean {
        return this._touched === true;
    }

    public get untouched(): boolean {
        return this._touched === false;
    }

    public get parent(): ValidGroup | undefined {
        return this._parent;
    }

    public get name(): string | undefined {
        return this._name;
    }

    public get label(): string | undefined {
        return this._label;
    }
    public set label(value: string | undefined) {
        this._label = value;
    }

    public abstract setStatus(status: ValidStatus, options?: SetStatusModel): void;

    public abstract disable(): void;
    public abstract enable(): void;
    public abstract markAsTouched(): void;

    public setParent(parent: ValidGroup, name: string | undefined): void {
        this._parent = parent;
        this._name = name;
    }

    public abstract validType(): ValidType;
}