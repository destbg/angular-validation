import { ValidGroup } from "../valid-states/valid-group";
import { Validator } from "../abstractions/validator";
import { ValidatorBuilder } from "./validator-builder";

export class GroupValidator extends Validator {
    constructor(builder: ValidatorBuilder) {
        super(builder);
    }

    /* @Internal */
    group!: ValidGroup;
}