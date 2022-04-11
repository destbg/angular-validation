import { Observable } from "rxjs";
import { AbstractValidControl } from "./abstract-valid-control";

export abstract class TLControl {
    constructor(controlChanges: Observable<AbstractValidControl | undefined>) {
        this.controlChanges = controlChanges;
    }

    public readonly controlChanges: Observable<AbstractValidControl | undefined>;
}