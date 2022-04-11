import { ValidState } from "../valid-states/valid-state";
import { GroupValidator } from "./group-validator";

export class ValidGroupBuilder {
    public validStates?: { [key: string]: ValidState } | ValidState[];
    public groupFns?: { [key: string]: () => boolean };
    public disabled?: boolean;
    public groups?: string[];
    public required?: boolean;
    public validators?: GroupValidator[];
}