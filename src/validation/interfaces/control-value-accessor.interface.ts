import { Subject } from 'rxjs';
import { ValidationState } from '../helpers/validation-state';

export interface IControlValueAccessor<T> {
  readonly changed: Subject<T | null | undefined>;

  writeValue(value: T | null | undefined): void;
  getValue(): T | null | undefined;
  validate(): ValidationState;
  markAsTouched(): void;
}
