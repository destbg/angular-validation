import { Observable, Subject, Subscription } from "rxjs";
import { AbstractValidControl } from "../abstractions/abstract-valid-control";
import { ValidStatus } from "../helpers/valid-status";
import { ValidType } from "../helpers/valid-type";
import { GroupValidator } from "../models/group-validator";
import { SetStatusModel } from "../models/set-status.model";
import { ValidGroupBuilder } from "../models/valid-group-builder";
import { ValidationResult } from "../models/validation-result";
import { ValidState } from "./valid-state";

export class ValidGroup extends ValidState {
    private readonly subscriptions: Subscription[][];
    private readonly _childValueChanged: Subject<void>;

    constructor(builder: ValidGroupBuilder) {
        super();

        this._childValueChanged = new Subject<void>();
        this.childValueChanges = this._childValueChanged.asObservable();

        this.groupsFns = builder.groupFns ?? {};
        this.inactiveGroups = Object.entries(this.groupsFns)
            .filter((f) => f[1]())
            .map((f) => f[0]);

        if (builder.validators !== null && builder.validators !== undefined) {
            for (const validator of builder.validators) {
                validator.group = this;
            }

            this.validators = builder.validators ?? [];
        }
        else {
            this.validators = [];
        }

        this.required = builder.required ?? false;
        this.groups = builder.groups ?? [];

        if (builder.validStates === null || builder.validStates === undefined) {
            this.validStates = {};
            this.validStatesArray = [];
        } else if (Array.isArray(builder.validStates)) {
            this.validStates = {};
            this.validStatesArray = builder.validStates;
        } else {
            this.validStates = builder.validStates;
            this.validStatesArray = Object.values(this.validStates);
        }

        this.subscriptions = [];
        const validStatesEntries = Object.entries(this.validStates);

        for (const validState of this.validStatesArray) {
            this.subscribeToValidState(validState);
            validState.setParent(this, validStatesEntries.find(f => f[1] === validState)?.[0]);
        }

        if (builder.disabled === true) {
            this.disable();
        }
        else {
            this.checkGroups();
        }
    }

    public readonly validStates: { [key: string]: ValidState };
    public readonly validStatesArray: ValidState[];
    public readonly groupsFns: { [key: string]: () => boolean };
    public readonly childValueChanges: Observable<void>;
    public readonly validators: GroupValidator[];

    public inactiveGroups: string[];

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

    public checkGroups(): void {
        this.inactiveGroups = Object.entries(this.groupsFns)
            .filter((f) => f[1]())
            .map((f) => f[0]);

        for (const validState of this.validStatesArray) {
            if (validState.groups.filter((f) => this.inactiveGroups.includes(f)).length === 0) {
                validState.enable();
            } else {
                validState.disable();
            }
        }
    }

    public addValidState(key: string, validState: ValidState): void {
        const previousValidState = this.validStates[key];

        if (previousValidState !== null && previousValidState !== undefined) {
            throw new Error(`The key ${key} is already added to the valid states collection.`);
        }

        validState.setParent(this, key);

        this.validStates[key] = validState;
        this.validStatesArray.push(validState);
        this.subscribeToValidState(validState);

        this.checkGroups();
    }

    public removeValidState(key: string): void {
        const validState = this.validStates[key];

        if (validState !== null && validState !== undefined) {
            const index = this.validStatesArray.indexOf(validState);

            if (index !== -1) {
                this.validStatesArray.splice(index, 1);

                this.unsubscribeFromValidState(index);
                this.subscriptions.splice(index, 1);
            }

            delete this.validStates[key];
        }
    }

    public addValidStateToArray(validState: ValidState): void {
        validState.setParent(this, undefined);

        this.validStatesArray.push(validState);
        this.subscribeToValidState(validState);

        this.checkGroups();
    }

    public removeValidStateFromArray(validControl: ValidState): void {
        const index = this.validStatesArray.indexOf(validControl);

        if (index !== -1) {
            const validControlName = Object.entries(this.validStates)
                .find(f => f[1] === validControl)?.[0];

            if (validControlName !== null && validControlName !== undefined) {
                delete this.validStates[validControlName];
            }

            this.validStatesArray.splice(index, 1);

            this.unsubscribeFromValidState(index);
            this.subscriptions.splice(index, 1);
        }
    }

    public clear(): void {
        while (this.validStatesArray.length > 0) {
            const validControl = this.validStatesArray[0];

            const validControlName = Object.entries(this.validStates)
                .find(f => f[1] === validControl)?.[0];

            if (validControlName !== null && validControlName !== undefined) {
                delete this.validStates[validControlName];
            }

            this.validStatesArray.splice(0, 1);

            this.unsubscribeFromValidState(0);
            this.subscriptions.splice(0, 1);
        }
    }

    public addValidator(validator: GroupValidator): void {
        validator.group = this;
        this.validators.push(validator);

        if (this._touched) {
            this.validate();
        }
    }

    public removeValidator(validatorIdentifier: string): void {
        const index = this.validators.findIndex(f => f.identifier === validatorIdentifier);

        if (index !== -1) {
            this.validators.splice(index, 1);
        }

        if (this._touched) {
            this.validate();
        }
    }

    public validType(): ValidType {
        return 'GROUP';
    }

    public disable(): void {
        if (this._status === 'DISABLED') {
            return;
        }

        for (const validState of this.validStatesArray) {
            validState.disable();
        }

        this._status = 'DISABLED';
        this.errors = [];
        this._statusChanges.next(this._status);
    }

    public enable(): void {
        if (this._status !== 'DISABLED') {
            return;
        }

        for (const validState of this.validStatesArray) {
            validState.enable();
        }

        this._status = 'PENDING';
        this.validate();
    }

    public markAsTouched(): void {
        for (const validState of this.validStatesArray) {
            validState.markAsTouched();
        }

        this.validate();
        this._touched = true;
    }

    private validate(): void {
        if (this._status === 'DISABLED') {
            return;
        }

        const inactiveGroups: string[] = this._parent?.inactiveGroups ?? [];

        const results: ValidationResult[] = [];
        const errorResults: ValidationResult[] = [];

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

        const validControlsValid = this.validStatesArray.every(f => f.status !== 'INVALID');

        const status: ValidStatus = errorResults.length === 0 && validControlsValid ? 'VALID' : 'INVALID'

        if (status !== this._status) {
            this._status = status;
            this._statusChanges.next(status);
        }

        this.errors = results;
    }

    private subscribeToValidState(validState: ValidState): void {
        let sub: Subscription;
        if (validState.validType() === 'GROUP') {
            sub = (validState as ValidGroup).childValueChanges.subscribe({
                next: this.validControlValueChanged.bind(this),
            });
        }
        else {
            sub = (validState as AbstractValidControl).anyValueChanges.subscribe({
                next: this.validControlValueChanged.bind(this),
            });
        }

        this.subscriptions.push([
            sub,
            validState.statusChanges.subscribe({
                next: this.validControlStatusChanged.bind(this),
            }),
        ]);
    }

    private unsubscribeFromValidState(index: number): void {
        for (const sub of this.subscriptions[index]) {
            sub.unsubscribe();
        }
    }

    private validControlValueChanged(): void {
        this.checkGroups();
        this.validate();
        this._childValueChanged.next();
    }

    private validControlStatusChanged(): void {
        if (this._status === 'INVALID' || this._status === 'DISABLED') {
            return;
        }

        let status: ValidStatus = this.validStatesArray.every(f => f.status !== 'INVALID')
            ? 'VALID'
            : 'INVALID';

        if (this._status !== status) {
            this._status = status;
            this._statusChanges.next(status);
        }
    }
}