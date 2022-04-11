import { AfterViewInit, Component, ElementRef, Input, OnChanges, Self, SimpleChanges, ViewChild } from '@angular/core';
import { BaseControlComponent, TLControl, ValidationResult, ValidStatus } from 'src/validation';

@Component({
    selector: 'app-input-control',
    templateUrl: './input-control.component.html',
})
export class InputControlComponent extends BaseControlComponent<string> implements OnChanges, AfterViewInit {
    @Input()
    public label: string | undefined;

    @ViewChild('input')
    public input?: ElementRef<HTMLInputElement>;

    constructor(@Self() control: TLControl) {
        super(control);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if ('label' in changes) {
            this.validControl.label = this.label;
        }
    }

    public ngAfterViewInit(): void {
        this.input!.nativeElement.addEventListener('input', () => {
            this.valueChanged.next(this.getValue());
        });

        this.input!.nativeElement.addEventListener('focusout', () => {
            this.touched.next();
        });

        if (this.validControl !== null && this.validControl !== undefined) {
            this.setValue(this.validControl.value);
        }
    }

    public getStatus(): ValidStatus {
        return 'VALID';
    }

    public setStatus(status: ValidStatus): void {
        //
    }

    public setValue(value: string | undefined): void {
        if (this.input !== null && this.input !== undefined) {
            this.input.nativeElement.value = value ?? '';
        }
    }

    public getValue(): string | undefined {
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

    public markAsTouched(): void { }

    protected validControlChanged(): void {
        this.validControl.label = this.label;
    }

    private readonly errorTranslations: { [key: string]: string } = {
        contain: 'Field does not contain {0}',
        creditCard: 'Field is not a valid credit card',
        email: 'Field is not a valid email',
        isEnum: 'Field does not match {0}',
        equal: 'Field is not equal to {0}',
        exactLength: 'Field must have a length of {0}',
        fraction: 'Field must have a fraction of {0}',
        greaterThanOrEqual: 'Field must be greater than or equal to {0}',
        greaterThan: 'Field must be greater than {0}',
        lessThanOrEqual: 'Field must be less than or equal to {0}',
        lessThan: 'Field must be less than {0}',
        maxFraction: 'Field cannot have more than {0} fraction',
        max: 'Field cannot be over {0}',
        minFraction: 'Field cannot have less than {0} fraction',
        min: 'Field cannot be less than {0}',
        notContain: 'Field cannot contain {0}',
        notEmpty: 'Field cannot be empty',
        notEqual: 'Field cannot be equal to {0}',
        pattern: 'Field does not match pattern {0}',
        range: 'Field must be between {0} and {1}',
    };

    public formatError(result: ValidationResult): string {
        return result.format(this.errorTranslations[result.identifier]!);
    }
}
