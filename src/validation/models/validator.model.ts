import { IValidControl } from '../interfaces/valid-control.interface';
import { ValidState } from '../valid-state';

export class RequiredValidatorModel {
  /** The groups that must be applied in order for the validation function to trigger. */
  public groups!: string[];
}

export class ValidatorModel {
  /** Used to differentiate the different validators. */
  public identifier!: string;

  /** The function that will get called when a validation must be performed. */
  public fn!: (validState: ValidState) => boolean;

  /** The function that will get called to format the error string. */
  public format!: (error: string) => string;

  /** The groups that must be applied in order for the validation function to trigger. */
  public groups!: string[];

  /** Indicates what is the severity of the validation (can be used to treat the validation only as a warning). */
  public severity: string = 'ERROR';
}

export class ControlValidatorModel {
  /** Used to differentiate the different validators. */
  public identifier!: string;

  /** The function that will get called when a validation must be performed. */
  public fn!: (validState: IValidControl) => boolean;

  /** The function that will get called to format the error string. */
  public format!: (error: string) => string;

  /** The groups that must be applied in order for the validation function to trigger. */
  public groups!: string[];

  /** Indicates what is the severity of the validation (can be used to treat the validation only as a warning). */
  public severity: string = 'ERROR';
}
