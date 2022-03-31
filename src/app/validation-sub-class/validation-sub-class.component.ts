import { Component, Self } from '@angular/core';
import { Guard, TLControl, ValidControl, ValidGroup } from 'src/validation';
import { BaseValidationComponent } from 'src/validation/validation-component';
import { TestModel } from '../test.model';

@Component({
  selector: 'app-validation-sub-class',
  templateUrl: './validation-sub-class.component.html',
})
export class ValidationSubClassComponent extends BaseValidationComponent<TestModel> {
  private disableText: boolean = false;

  public textControl!: ValidControl<string>;

  constructor(@Self() control: TLControl) {
    super(control);
  }

  public onDisableText(): void {
    this.disableText = !this.disableText;
    this.validGroup.checkGroups();
  }

  public writeValue(value: TestModel | null | undefined): void {
    if (value !== null && value !== undefined) {
      this.textControl.setValue(value.text);
    } else {
      this.textControl.setValue('undefined value provided');
    }
  }

  protected buildValidation(): ValidGroup {
    this.textControl = new ValidControl({
      value: '',
      groups: ['DisableText'],
      validators: [Guard.required(), Guard.notEqual(['testt', 'testtttttttt']), Guard.max(10)],
    });

    return new ValidGroup(
      {
        textControl: this.textControl,
      },
      {
        DisableText: () => this.disableText,
      }
    );
  }

  public getValue(): TestModel | null | undefined {
    return new TestModel({
      text: this.textControl.value,
    });
  }
}
