import { ControlValidator } from "./control-validator";

export class ValidControlBuilder<T> {
    public value?: T;
    public disabled?: boolean;
    public groups?: string[];
    public required?: boolean;
    public validators?: ControlValidator[];
}