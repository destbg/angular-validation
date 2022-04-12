import { Observable } from "rxjs";
import { ValidState } from "../valid-states/valid-state";

export abstract class TLControl {
    constructor(controlChanges: Observable<ValidState | undefined>) {
        this.controlChanges = controlChanges;
    }

    public readonly controlChanges: Observable<ValidState | undefined>;
}