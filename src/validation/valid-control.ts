import { RequiredValidatorModel, ValidatorModel } from './models/validator.model';
import { ValidState } from './valid-state';
import { ValidStateBuilder } from './valid-state-builder';

export class ValidControl<T> extends ValidState<T> {
  constructor(builder?: ValidStateBuilder<T>) {
    super();

    if (builder !== null && builder !== undefined) {
      this._initialValue = builder.value;
      this._value = builder.value;

      if (builder.disabled !== null && builder.disabled !== undefined) {
        this._disabled = builder.disabled;

        if (this._disabled === true) {
          this._status = 'DISABLED';
        }
      }

      if (builder.groups !== null && builder.groups !== undefined) {
        this.groups = builder.groups;
      }

      if (builder.validators !== null && builder.validators !== undefined) {
        const validators: ValidatorModel[] = [];
        let required: boolean = false;

        for (const validator of builder.validators) {
          if (validator instanceof RequiredValidatorModel) {
            required = true;
          } else {
            validators.push(validator);
          }
        }

        this.required = required;
        this.validators = validators;
      }
    }
  }

  protected onDisable(): void {}
  protected onEnable(): void {}
  protected onTouched(): void {}
}
