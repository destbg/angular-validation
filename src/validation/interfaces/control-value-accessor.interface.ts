import { Subject } from 'rxjs';
import { ValidationState } from '../helpers/validation-state';

export interface IControlValueAccessor<T> {
  readonly changed: Subject<T | null | undefined>;
  readonly statusChanged: Subject<ValidationState>;

  writeValue(value: T | null | undefined): void;
  getValue(): T | null | undefined;
  validate(): ValidationState;
  markAsTouched(): void;
}
