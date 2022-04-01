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

  public hideInputControl: boolean = true;

  public textControl!: ValidControl<string>;
  public text2Control!: ValidControl<string>;
  public text3Control!: ValidControl<string>;

  constructor(@Self() control: TLControl) {
    super(control);
  }

  public onDisableText(): void {
    this.disableText = !this.disableText;
    this.validGroup.checkGroups();
  }

  public onHideInputControl(): void {
    this.hideInputControl = !this.hideInputControl;
  }

  public writeValue(value: TestModel | null | undefined): void {
    if (value !== null && value !== undefined) {
      this.textControl.setValue(value.text);
      this.text2Control.setValue(value.text2);
      this.text3Control.setValue(value.text3);
    } else {
      this.textControl.setValue('undefined value provided');
      this.text2Control.setValue('undefined value provided 2');
      this.text3Control.setValue('undefined value provided 3');
    }
  }

  protected buildValidation(): ValidGroup {
    this.textControl = new ValidControl({
      value: '',
      groups: ['DisableText'],
      validators: [Guard.required(), Guard.notEqual(['testt', 'testtttttttt']), Guard.max(10)],
    });

    this.text2Control = new ValidControl({
      value: '',
      groups: ['DisableText'],
      validators: [Guard.required(), Guard.notEqual(['testt', 'testtttttttt']), Guard.max(10)],
    });

    this.text3Control = new ValidControl({
      value: '',
      groups: ['DisableText'],
      validators: [Guard.required(), Guard.notEqual(['testt', 'testtttttttt']), Guard.max(10)],
    });

    return new ValidGroup(
      {
        textControl: this.textControl,
        text2Control: this.text2Control,
        text3Control: this.text3Control,
      },
      {
        DisableText: () => this.disableText,
        DisableHiddenText: () => !this.hideInputControl,
      }
    );
  }

  public getValue(): TestModel | null | undefined {
    return new TestModel({
      text: this.textControl.value,
      text2: this.text2Control.value,
      text3: this.text3Control.value,
    });
  }
}
