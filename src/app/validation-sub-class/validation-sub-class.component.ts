import { Component, OnInit, Self } from '@angular/core';
import { BaseComponent, Guard, TLControl, ValidControl, ValidGroup } from 'src/validation';
import { Loader } from '../loader';
import { TestModel } from '../test.model';

@Component({
  selector: 'app-validation-sub-class',
  templateUrl: './validation-sub-class.component.html',
})
export class ValidationSubClassComponent extends BaseComponent<TestModel> implements OnInit {
  private disableText: boolean = false;

  public hideInputControl: boolean = true;
  public timestamp: Date = new Date();
  public groupTimestamp: Date = new Date();

  public textControl!: ValidControl<string>;
  public text2Control!: ValidControl<string>;
  public text3Control!: ValidControl<string>;

  private readonly loader: Loader;

  constructor(@Self() control: TLControl) {
    super(control);

    this.loader = new Loader(this.getNomenclatures.bind(this));
  }

  public ngOnInit(): void {
    this.loader.load();
  }

  public onDisableText(): void {
    this.disableText = !this.disableText;
    this.validGroup.checkGroups();
  }

  public onHideInputControl(): void {
    this.hideInputControl = !this.hideInputControl;
    this.validGroup.checkGroups();
  }

  public writeValue(value: TestModel | null | undefined): void {
    this.loader.load(() => {
      if (value !== null && value !== undefined) {
        this.textControl.setValue(value.text);
        this.text2Control.setValue(value.text2);
        this.text3Control.setValue(value.text3);
      } else {
        this.textControl.setValue('undefined value provided');
        this.text2Control.setValue('undefined value provided 2');
        this.text3Control.setValue('undefined value provided 3');
      }
    });
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
      groups: ['DisableHiddenText'],
      validators: [Guard.required(), Guard.notEqual(['testt', 'testtttttttt']), Guard.max(10)],
    });

    this.textControl.valueChanges.subscribe({
      next: this.updateTimestamp.bind(this),
    });

    this.text2Control.valueChanges.subscribe({
      next: this.updateTimestamp.bind(this),
    });

    this.text3Control.valueChanges.subscribe({
      next: this.updateTimestamp.bind(this),
    });

    const group = new ValidGroup(
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

    group.childValueChanges.subscribe({
      next: () => {
        this.groupTimestamp = new Date();
      },
    });

    return group;
  }

  public getValue(): TestModel | null | undefined {
    return new TestModel({
      text: this.textControl.value,
      text2: this.text2Control.value,
      text3: this.text3Control.value,
    });
  }

  private updateTimestamp(): void {
    this.timestamp = new Date();
  }

  private getNomenclatures(): void {
    setTimeout(() => {
      this.loader.complete();
    }, 1000);
  }
}
