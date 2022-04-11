export class ValidationResult {
    /** The unique identifier for the validator (should be the same as the name of the validator) */
    public identifier!: string;

    /** Indicates what is the severity of the validation (can be used to treat the validation only as a warning). */
    public severity: string = 'ERROR';

    /** The function that will get called to format the error string. */
    public format!: (error: string) => string;
}