import { Observable } from "rxjs";
import { ControlValidatorModel } from "./models/validator.model";
import { ValidState } from "./valid-state";

export abstract class AbstractValidControl extends ValidState {
    constructor() {
        super();
        this.validators = [];
    }

    /** A multicasting observable of value changes for the valid state that emits every time the value of the valid state changes in the UI, but not programmatically. */
    public abstract readonly anyValueChanges: Observable<any | null | undefined>;

    /** The valid state's value. */
    public abstract get anyValue(): any | null | undefined;

    /** The valid state's validators. */
    public validators: ControlValidatorModel[];

    public addValidator(validator: ControlValidatorModel): void {
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
}
