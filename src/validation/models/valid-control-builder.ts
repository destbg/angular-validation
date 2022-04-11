import { ControlValidatorModel } from './validator.model';

export class ValidControlBuilder<T> {
    public value?: T;
    public disabled?: boolean;
    public groups?: string[];
    public required?: boolean;
    public validators?: ControlValidatorModel[];
}
