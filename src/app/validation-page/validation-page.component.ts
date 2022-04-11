import { Component, OnInit } from '@angular/core';
import { BasePageComponent, ValidControl, ValidGroup } from 'src/validation';
import { TestModel } from '../test.model';

@Component({
    selector: 'app-validation-page',
    templateUrl: './validation-page.component.html',
})
export class ValidationPageComponent extends BasePageComponent implements OnInit {
    private disableInnerControl: boolean = false;

    public timestamp: Date = new Date();

    public innerControl!: ValidControl<TestModel>;
    public innerControl2!: ValidControl<TestModel>;

    constructor() {
        super();
    }

    public ngOnInit(): void {
        this.innerControl.setValue(
            new TestModel({
                text: 'test',
                text2: 'test 2',
                text3: 'test 3',
            })
        );
    }

    public getChildValue(): string {
        return JSON.stringify(this.innerControl.value);
    }

    public onDisableInnerControl(): void {
        this.disableInnerControl = !this.disableInnerControl;
        this.validGroup.checkGroups();
    }

    public onMarkAsTouched(): void {
        this.innerControl2.markAsTouched();
    }

    protected buildValidation(): ValidGroup {
        this.innerControl = new ValidControl();
        this.innerControl2 = new ValidControl();

        const group = new ValidGroup({
            validStates: {
                innerControl: new ValidGroup({
                    validStates: {
                        innerControl: this.innerControl
                    },
                    groups: ['DisableInnerControl']
                }),
                innerControl2: this.innerControl2,
            },
            groupFns: {
                DisableInnerControl: () => this.disableInnerControl,
            }
        });

        group.childValueChanges.subscribe({
            next: () => {
                this.timestamp = new Date();
            },
        });

        return group;
    }
}
