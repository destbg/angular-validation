import { Subject } from 'rxjs';
import { ValidationStatus } from '../helpers/validation-status';

export interface IControlValueAccessor<T> {
  readonly changed: Subject<T | null | undefined>;
  readonly statusChanged: Subject<ValidationStatus>;

  writeValue(value: T | null | undefined): void;
  getValue(): T | null | undefined;
  validate(): ValidationStatus;
  markAsTouched(): void;
}
