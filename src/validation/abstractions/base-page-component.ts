import { ValidStatus } from "../helpers/valid-status";
import { ValidGroup } from "../valid-states/valid-group";

export abstract class BasePageComponent {
    public validGroup!: ValidGroup;

    public isDisabled: boolean = false;

    constructor() {
        this.validGroup = this.buildValidation();
        this.isDisabled = this.validGroup.disabled;

        this.validGroup.statusChanges.subscribe({
            next: this.onValidGroupStatusChanged.bind(this),
        });
    }

    protected abstract buildValidation(): ValidGroup;

    private onValidGroupStatusChanged(status: ValidStatus): void {
        if (status === 'DISABLED') {
            this.isDisabled = true;
        } else {
            this.isDisabled = false;
        }
    }
}