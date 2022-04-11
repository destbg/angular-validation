import { Observable } from "rxjs";
import { ControlValidator } from "../models/control-validator";
import { ValidState } from "../valid-states/valid-state";

export abstract class AbstractValidControl extends ValidState {
    constructor() {
        super();
        this.validators = [];
    }

    public abstract readonly anyValueChanges: Observable<any | undefined>;
    public abstract get anyValue(): any | undefined;
    public readonly validators: ControlValidator[];
}