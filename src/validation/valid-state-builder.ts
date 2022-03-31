import { RequiredValidatorModel, ValidatorModel } from './models/validator.model';

export class ValidStateBuilder<T> {
  public value?: T;
  public disabled?: boolean;
  public groups?: string[];
  public validators?: (ValidatorModel | RequiredValidatorModel)[];
}
