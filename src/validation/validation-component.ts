import { Component, Input } from '@angular/core';
import { ValidArray } from './valid-array';
import { ValidControl } from './valid-control';
import { ValidGroup } from './valid-group';
import { ValidState } from './valid-state';

// TODO: Make it so the valid state injects thru the constructor

@Component({
  template: '',
})
export abstract class BaseValidationComponent<T> {
  private validation!: ValidState<T>;
  private changingValue: boolean = false;

  @Input()
  public validState?: ValidState<T>;

  public validGroup!: ValidGroup<T>;
  public validArray!: ValidArray<T>;
  public validControl!: ValidControl<T>;

  public isDisabled: boolean = false;

  protected initValidation(): void {
    const form = this.buildValidation();

    if (this.validState !== null && this.validState !== undefined) {
      this.validState.setBoundControl(form);

      this.validState.valueChanges.subscribe({
        next: this.onValidStateValueChanged.bind(this),
      });
    }

    this.validation = form;

    form.statusChanges.subscribe({
      next: this.onValidationStatusChanges.bind(this),
    });

    if (form instanceof ValidGroup) {
      this.validGroup = form;

      form.childValueChanges.subscribe({
        next: this.onValidationChildValueChanged.bind(this),
      });
    } else if (form instanceof ValidArray) {
      this.validArray = form;

      form.childValueChanges.subscribe({
        next: this.onValidationChildValueChanged.bind(this),
      });
    } else if (form instanceof ValidControl) {
      this.validControl = form;
    }
  }

  protected abstract writeValue(value: T | undefined | null): void;
  protected abstract buildValidation(): ValidState<T>;
  protected abstract getValue(): T | undefined | null;

  protected onChanged(): void {
    this.changingValue = true;
    this.validation.setValue(this.getValue());
    this.changingValue = false;
  }

  private onValidationStatusChanges(status: 'VALID' | 'INVALID' | 'DISABLED') {
    this.isDisabled = status === 'DISABLED';
  }

  private onValidationChildValueChanged(): void {
    this.onChanged();
  }

  private onValidStateValueChanged(value: T | undefined | null): void {
    if (this.changingValue === false) {
      this.writeValue(value);
    }
  }
}
