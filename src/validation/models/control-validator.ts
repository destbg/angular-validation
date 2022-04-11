import { AbstractValidControl } from "../abstractions/abstract-valid-control";
import { Validator } from "../abstractions/validator";
import { ValidatorBuilder } from "./validator-builder";

export class ControlValidator extends Validator {
    constructor(builder: ValidatorBuilder) {
        super(builder);
    }

    /* @Internal */
    control!: AbstractValidControl;
}