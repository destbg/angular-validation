import { Component, OnInit } from '@angular/core';
import { ValidControl } from 'src/validation/valid-control';
import { ValidGroup } from 'src/validation/valid-group';
import { ValidState } from 'src/validation/valid-state';
import { BaseValidationComponent } from 'src/validation/validation-component';
import { TestModel } from '../test.model';

@Component({
  selector: 'app-validation-page',
  templateUrl: './validation-page.component.html',
})
export class ValidationPageComponent extends BaseValidationComponent<TestModel> implements OnInit {
  private disableText: boolean = false;

  constructor() {
    super();
  }

  public textControl!: ValidControl<string>;

  public ngOnInit(): void {
    this.initValidation();
  }

  protected writeValue(value: TestModel | null | undefined): void {
    console.log(value);
  }

  protected buildValidation(): ValidState<TestModel> {
    this.textControl = new ValidControl({
      value: '',
      groups: ['DisableText'],
    });

    return new ValidGroup<TestModel>(
      {
        textControl: this.textControl,
      },
      {
        DisableText: () => !this.disableText,
      }
    );
  }

  protected getValue(): TestModel | null | undefined {
    return new TestModel({
      text: this.textControl.value,
    });
  }
}
