import { AbstractValidControl } from '../abstract-valid-control';
import { ValidGroup } from '../valid-group';

export class ControlValidatorModel {
    /** Used to differentiate the different validators. */
    public identifier!: string;

    /** The function that will get called when a validation must be performed. */
    public fn!: (validState: AbstractValidControl) => boolean;

    /** The function that will get called to format the error string. */
    public format!: (error: string) => string;

    /** The groups that must be applied in order for the validation function to trigger. */
    public groups!: string[];

    /** Indicates what is the severity of the validation (can be used to treat the validation only as a warning). */
    public severity: string = 'ERROR';
}

export class GroupValidatorModel {
    /** Used to differentiate the different validators. */
    public identifier!: string;

    /** The function that will get called when a validation must be performed. */
    public fn!: (validState: ValidGroup) => boolean;

    /** The function that will get called to format the error string. */
    public format!: (error: string) => string;

    /** The groups that must be applied in order for the validation function to trigger. */
    public groups!: string[];

    /** Indicates what is the severity of the validation (can be used to treat the validation only as a warning). */
    public severity: string = 'ERROR';
}
