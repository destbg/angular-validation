import { Observable, Subject, Subscription } from 'rxjs';
import { AbstractValidControl } from './abstract-valid-control';
import { ValidType } from './helpers/valid-type';
import { ValidationStatus } from './helpers/validation-status';
import { ValidGroupBuilder } from './models/valid-group-builder';
import { ValidationResultModel } from './models/validation-result.model';
import { GroupValidatorModel } from './models/validator.model';
import { ValidState } from './valid-state';

export class ValidGroup extends ValidState {
    private readonly subscriptions: [Subscription, Subscription][];
    private readonly _childValueChanged: Subject<void>;
    private _massUpdateCount: number = 0;
    private _updateFiredDuringMassUpdate: boolean = false;

    constructor(builder: ValidGroupBuilder) {
        super();

        this.validators = [];

        this._childValueChanged = new Subject<void>();
        this.childValueChanges = this._childValueChanged.asObservable();

        this.groupsFns = builder.groupFns ?? {};
        this.inactiveGroups = Object.entries(this.groupsFns)
            .filter((f) => f[1]())
            .map((f) => f[0]);

        if (builder.validators !== null && builder.validators !== undefined) {
            this.validators = builder.validators;
        }

        if (builder.required === true) {
            this.required = builder.required;
        }

        if (builder.groups !== null && builder.groups !== undefined) {
            this.groups = builder.groups;
        }

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

        for (const validControl of this.validStatesArray) {
            let sub: Subscription;
            if (validControl.validType() === 'GROUP') {
                sub = (validControl as ValidGroup).childValueChanges.subscribe({
                    next: this.validControlValueChanged.bind(this),
                });
            }
            else {
                sub = (validControl as AbstractValidControl).anyValueChanges.subscribe({
                    next: this.validControlValueChanged.bind(this),
                });
            }

            this.subscriptions.push([
                sub,
                validControl.statusChanges.subscribe({
                    next: this.validControlStatusChanged.bind(this),
                }),
            ]);
        }

        const validControlsEntries = Object.entries(this.validStates);

        for (const validControl of this.validStatesArray) {
            validControl.setParent(this, validControlsEntries.find(f => f[1] === validControl)?.[0]);
        }

        if (builder.disabled === true) {
            this._status = 'DISABLED';
            this.onDisable();
        }
    }

    public readonly validStates: { [key: string]: ValidState };
    public readonly validStatesArray: ValidState[];
    public readonly groupsFns: { [key: string]: () => boolean };

    public readonly childValueChanges: Observable<void>;

    /** The inactive groups of the valid state. */
    public inactiveGroups: string[];

    /** The valid state's validators. */
    public validators: GroupValidatorModel[];

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

    public addValidState(key: string, validControl: ValidState): void {
        const previousValidState = this.validStates[key];

        if (previousValidState !== null && previousValidState !== undefined) {
            throw new Error(`The key ${key} is already added to the valid states collection.`);
        }

        validControl.setParent(this, key);

        this.validStates[key] = validControl;
        this.validStatesArray.push(validControl);

        let sub: Subscription;
        if (validControl.validType() === 'GROUP') {
            sub = (validControl as ValidGroup).childValueChanges.subscribe({
                next: this.validControlValueChanged.bind(this),
            });
        }
        else {
            sub = (validControl as AbstractValidControl).anyValueChanges.subscribe({
                next: this.validControlValueChanged.bind(this),
            });
        }

        this.subscriptions.push([
            sub,
            validControl.statusChanges.subscribe({
                next: this.validControlStatusChanged.bind(this),
            }),
        ]);

        this.checkGroups();
    }

    public removeValidState(key: string): void {
        const validState = this.validStates[key];

        if (validState !== null && validState !== undefined) {
            const index = this.validStatesArray.indexOf(validState);

            if (index !== -1) {
                this.validStatesArray.splice(index, 1);

                this.subscriptions[index][0].unsubscribe();
                this.subscriptions[index][1].unsubscribe();
                this.subscriptions.splice(index, 1);
            }

            delete this.validStates[key];
        }
    }

    public addValidStateToArray(validControl: ValidState): void {
        validControl.setParent(this, undefined);

        this.validStatesArray.push(validControl);

        let sub: Subscription;
        if (validControl.validType() === 'GROUP') {
            sub = (validControl as ValidGroup).childValueChanges.subscribe({
                next: this.validControlValueChanged.bind(this),
            });
        }
        else {
            sub = (validControl as AbstractValidControl).anyValueChanges.subscribe({
                next: this.validControlValueChanged.bind(this),
            });
        }

        this.subscriptions.push([
            sub,
            validControl.statusChanges.subscribe({
                next: this.validControlStatusChanged.bind(this),
            }),
        ]);

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

            this.subscriptions[index][0].unsubscribe();
            this.subscriptions[index][1].unsubscribe();
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

            this.subscriptions[0][0].unsubscribe();
            this.subscriptions[0][1].unsubscribe();
            this.subscriptions.splice(0, 1);
        }
    }

    public addValidator(validator: GroupValidatorModel): void {
        this.validators.push(validator);

        if (this._touched) {
            this.validate(this._parent?.inactiveGroups ?? []);
        }
    }

    public removeValidator(validatorIdentifier: string): void {
        const index = this.validators.findIndex(f => f.identifier === validatorIdentifier);

        if (index !== -1) {
            this.validators.splice(index, 1);
        }

        if (this._touched) {
            this.validate(this._parent?.inactiveGroups ?? []);
        }
    }

    public validate(inactiveGroups: string[]): ValidationResultModel[] {
        if (this.disabled) {
            return [];
        }

        for (const validState of this.validStatesArray) {
            validState.validate(this.inactiveGroups);
        }

        const results: ValidationResultModel[] = [];
        const errorResults: ValidationResultModel[] = [];

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

        let status: ValidationStatus = (errorResults.length === 0 && this.validStatesArray.every(f => f.status === 'VALID' || f.status === 'DISABLED'))
            ? 'VALID'
            : 'INVALID';

        if (status !== this._status) {
            this._status = status;
            this._statusChanges.next(status);
        }

        this.errors = results;
        return results;
    }

    public validType(): ValidType {
        return 'GROUP';
    }

    protected onDisable(): void {
        for (const validState of this.validStatesArray) {
            validState.disable();
        }
    }

    protected onEnable(): void {
        for (const validState of this.validStatesArray) {
            validState.enable();
        }
    }

    protected onTouched(): void {
        for (const validState of this.validStatesArray) {
            validState.markAsTouched();
        }
    }

    /** @internal */
    startMassUpdate(): void {
        this._massUpdateCount++;
    }

    /** @internal */
    endMassUpdate(): void {
        this._massUpdateCount--;

        if (this._massUpdateCount === 0 && this._updateFiredDuringMassUpdate === true) {
            this._childValueChanged.next();
        }
    }

    private validControlValueChanged(): void {
        if (this._massUpdateCount > 0) {
            this._updateFiredDuringMassUpdate = true;
            return;
        }

        this.checkGroups();
        this._childValueChanged.next();
        this.validate(this.inactiveGroups);
    }

    private validControlStatusChanged(): void {
        if (this._status === 'INVALID' || this._status === 'DISABLED') {
            return;
        }

        let status: ValidationStatus = 'VALID';

        for (const validControl of this.validStatesArray) {
            if (validControl.status === 'INVALID') {
                status = 'INVALID';
                break;
            }
        }

        if (this._status !== status) {
            this._status = status;
            this._statusChanges.next(status);
        }
    }
}
