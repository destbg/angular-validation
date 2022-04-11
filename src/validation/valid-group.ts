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
            this.validControls = {};
            this.validControlsArray = [];
        } else if (Array.isArray(builder.validStates)) {
            this.validControls = {};
            this.validControlsArray = builder.validStates;
        } else {
            this.validControls = builder.validStates;
            this.validControlsArray = Object.values(this.validControls);
        }

        this.subscriptions = [];

        for (const validControl of this.validControlsArray) {
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

        const validControlsEntries = Object.entries(this.validControls);

        for (const validControl of this.validControlsArray) {
            validControl.setParent(this, validControlsEntries.find(f => f[1] === validControl)?.[0]);
        }

        if (builder.disabled === true) {
            this._status = 'DISABLED';
            this.onDisable();
        }
    }

    public readonly validControls: { [key: string]: ValidState };
    public readonly validControlsArray: ValidState[];
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

        for (const validState of this.validControlsArray) {
            if (validState.groups.filter((f) => this.inactiveGroups.includes(f)).length === 0) {
                validState.enable();
            } else {
                validState.disable();
            }
        }
    }

    public addValidControl(key: string, validControl: ValidState): void {
        const previousValidState = this.validControls[key];

        if (previousValidState !== null && previousValidState !== undefined) {
            throw new Error(`The key ${key} is already added to the valid states collection.`);
        }

        validControl.setParent(this, key);

        this.validControls[key] = validControl;
        this.validControlsArray.push(validControl);

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

    public removeValidControl(key: string): void {
        const validState = this.validControls[key];

        if (validState !== null && validState !== undefined) {
            const index = this.validControlsArray.indexOf(validState);

            if (index !== -1) {
                this.validControlsArray.splice(index, 1);

                this.subscriptions[index][0].unsubscribe();
                this.subscriptions[index][1].unsubscribe();
                this.subscriptions.splice(index, 1);
            }

            delete this.validControls[key];
        }
    }

    public addValidControlToArray(validControl: ValidState): void {
        validControl.setParent(this, undefined);

        this.validControlsArray.push(validControl);

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

    public removeValidControlFromArray(validControl: ValidState): void {
        const index = this.validControlsArray.indexOf(validControl);

        if (index !== -1) {
            const validControlName = Object.entries(this.validControls)
                .find(f => f[1] === validControl)?.[0];

            if (validControlName !== null && validControlName !== undefined) {
                delete this.validControls[validControlName];
            }

            this.validControlsArray.splice(index, 1);

            this.subscriptions[index][0].unsubscribe();
            this.subscriptions[index][1].unsubscribe();
            this.subscriptions.splice(index, 1);
        }
    }

    public clear(): void {
        while (this.validControlsArray.length > 0) {
            const validControl = this.validControlsArray[0];

            const validControlName = Object.entries(this.validControls)
                .find(f => f[1] === validControl)?.[0];

            if (validControlName !== null && validControlName !== undefined) {
                delete this.validControls[validControlName];
            }

            this.validControlsArray.splice(0, 1);

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

        for (const validControl of this.validControlsArray) {
            validControl.validate(inactiveGroups);
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

        let status: ValidationStatus = (errorResults.length === 0 && this.validControlsArray.every(f => f.status !== 'INVALID'))
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
        for (const validState of this.validControlsArray) {
            validState.disable();
        }
    }

    protected onEnable(): void {
        for (const validState of this.validControlsArray) {
            validState.enable();
        }
    }

    protected onTouched(): void {
        for (const validState of this.validControlsArray) {
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
    }

    private validControlStatusChanged(): void {
        if (this._status === 'INVALID' || this._status === 'DISABLED') {
            return;
        }

        let status: ValidationStatus = 'VALID';

        for (const validControl of this.validControlsArray) {
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
