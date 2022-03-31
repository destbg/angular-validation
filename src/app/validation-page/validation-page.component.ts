import { Component, OnInit } from '@angular/core';
import { ValidControl, ValidGroup } from 'src/validation';
import { BasePageValidationComponent } from 'src/validation/validation-component';
import { TestModel } from '../test.model';

@Component({
  selector: 'app-validation-page',
  templateUrl: './validation-page.component.html',
})
export class ValidationPageComponent extends BasePageValidationComponent implements OnInit {
  private disableInnerControl: boolean = false;

  public timestamp: Date = new Date();

  public innerControl!: ValidControl<TestModel>;

  constructor() {
    super();
  }

  public async ngOnInit(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.innerControl.setValue(
      new TestModel({
        text: 'test',
      })
    );
  }

  public getChildValue(): string {
    return JSON.stringify(this.innerControl.value);
  }

  public onDisableInnerControl(): void {
    this.disableInnerControl = !this.disableInnerControl;
    this.validGroup.checkGroups();
  }

  protected buildValidation(): ValidGroup {
    this.innerControl = new ValidControl({
      groups: ['DisableInnerControl'],
    });

    const group = new ValidGroup(
      {
        innerControl: this.innerControl,
      },
      {
        DisableInnerControl: () => this.disableInnerControl,
      }
    );

    group.childValueChanges.subscribe({
      next: () => {
        this.timestamp = new Date();
      },
    });

    return group;
  }
}
