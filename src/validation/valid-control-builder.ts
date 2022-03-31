import { ControlValidatorModel, RequiredValidatorModel } from './models/validator.model';

export class ValidControlBuilder<T> {
  public value?: T;
  public disabled?: boolean;
  public groups?: string[];
  public validators?: (RequiredValidatorModel | ControlValidatorModel)[];
}
