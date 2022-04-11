import { ValidState } from "../valid-state";
import { GroupValidatorModel } from "./validator.model";

export class ValidGroupBuilder {
    public validStates?: { [key: string]: ValidState } | ValidState[];
    public groupFns?: { [key: string]: () => boolean };
    public disabled?: boolean;
    public groups?: string[];
    public required?: boolean;
    public validators?: GroupValidatorModel[];
}
