import { AfterViewInit, Component, ElementRef, Input, Self, ViewChild } from '@angular/core';
import { BaseControlComponent, TLControl } from 'src/validation';
import { ValidationStatus } from 'src/validation/helpers/validation-status';

@Component({
  selector: 'app-input-control',
  templateUrl: './input-control.component.html',
})
export class InputControlComponent extends BaseControlComponent<string> implements AfterViewInit {
  @Input()
  public label: string | undefined;

  @ViewChild('input')
  public input?: ElementRef<HTMLInputElement>;

  constructor(@Self() control: TLControl) {
    super(control);
  }

  public ngAfterViewInit(): void {
    this.input!.nativeElement.addEventListener('input', () => {
      this.changed.next(this.getValue());
    });

    this.input!.nativeElement.addEventListener('focusout', () => {
      this.touched.next();
    });

    if (this.validControl !== null && this.validControl !== undefined) {
      this.writeValue(this.validControl.value);
    }
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

  public validate(): ValidationStatus {
    return 'VALID';
  }

  public markAsTouched(): void { }
}
