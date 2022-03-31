import { AfterViewInit, Component, ElementRef, Self, ViewChild } from '@angular/core';
import { TLControl } from 'src/validation';
import { ValidationState } from 'src/validation/helpers/validation-state';
import { BaseControlValidationComponent } from 'src/validation/validation-component';

@Component({
  selector: 'app-input-control',
  templateUrl: './input-control.component.html',
})
export class InputControlComponent extends BaseControlValidationComponent<string> implements AfterViewInit {
  @ViewChild('input')
  public input?: ElementRef<HTMLInputElement>;

  constructor(@Self() control: TLControl) {
    super(control);
  }

  public ngAfterViewInit(): void {
    this.input!.nativeElement.addEventListener('keyup', () => {
      this.changed.next(this.getValue());
    });
  }

  public writeValue(value: string | null | undefined): void {
    if (this.input !== null && this.input !== undefined) {
      this.input.nativeElement.value = value ?? '';
    }
  }

  public getValue(): string | null | undefined {
    if (this.input !== null && this.input !== undefined) {
      if (this.input.nativeElement.value === null || this.input.nativeElement.value === undefined) {
        return this.input.nativeElement.value;
      }

      if (this.input.nativeElement.value.length === 0) {
        return undefined;
      }

      return this.input.nativeElement.value;
    }

    return undefined;
  }

  public validate(): ValidationState {
    return 'VALID';
  }

  public markAsTouched(): void {
    // TODO:
  }
}
