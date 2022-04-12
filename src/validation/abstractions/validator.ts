import { ValidatorBuilder } from "../models/validator-builder";

export class Validator {
    /** The function that will get called when a validation must be performed. */
    public fn!: () => boolean;

    /** Used to differentiate the different validators. */
    public identifier: string;

    /** The function that will get called to format the error string. */
    public format: (error: string) => string;

    /** The groups that must be applied in order for the validation function to trigger. */
    public groups: string[];

    /** Indicates what is the severity of the validation (can be used to treat the validation only as a warning). */
    public severity: string = 'ERROR';

    constructor(builder: ValidatorBuilder) {
        this.identifier = builder.identifier;
        this.groups = builder.groups ?? [];
        this.severity = builder.severity ?? 'ERROR';
        this.fn = builder.fn!;

        this.format = builder.format ?? ((error: string) => error);
    }
}