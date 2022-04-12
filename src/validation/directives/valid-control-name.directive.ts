import { Directive, forwardRef, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { Subject } from "rxjs";
import { TLControl } from "../abstractions/tl-control";
import { ValidGroup } from "../valid-states/valid-group";
import { ValidState } from "../valid-states/valid-state";

export const validControlNameBinding: any = {
    provide: TLControl,
    useExisting: forwardRef(() => ValidControlNameDirective),
};

@Directive({
    selector: '[validControlName]',
    providers: [validControlNameBinding],
    exportAs: 'tlForm',
})
export class ValidControlNameDirective extends TLControl implements OnChanges, OnDestroy {
    private readonly _validControlChanges: Subject<ValidState | undefined>;
    private validGroup: ValidGroup | undefined;
    private boundValidControl: ValidState | undefined;

    @Input()
    public validControlName!: string;

    constructor() {
        const validControlChanges = new Subject<ValidState | undefined>();
        super(validControlChanges.asObservable());

        this._validControlChanges = validControlChanges;
    }

    public ngOnDestroy(): void {
        this._validControlChanges.next(undefined);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if ('validControlName' in changes) {
            this.onChanged();
        }
    }

    public setValidGroup(validGroup: ValidGroup): void {
        this.validGroup = validGroup;
        this.onChanged();
    }

    private onChanged(): void {
        if (this.validGroup !== undefined && this.validControlName !== undefined) {
            const control = this.validGroup.validStates[this.validControlName];

            if (this.boundValidControl !== control) {
                this.boundValidControl = control;
                this._validControlChanges.next(control);
            }
        }
    }
}