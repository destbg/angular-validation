import { ContentChildren, Directive, DoCheck, forwardRef, Input, OnChanges, OnDestroy, QueryList, SimpleChanges } from "@angular/core";
import { Subject } from "rxjs";
import { TLControl } from "../abstractions/tl-control";
import { ValidGroup } from "../valid-states/valid-group";
import { ValidState } from "../valid-states/valid-state";
import { ValidControlNameDirective } from "./valid-control-name.directive";

export const validGroupBinding: any = {
    provide: TLControl,
    useExisting: forwardRef(() => ValidGroupDirective),
};

@Directive({
    selector: '[validGroup]',
    providers: [validGroupBinding],
    exportAs: 'tlForm',
})
export class ValidGroupDirective extends TLControl implements OnChanges, OnDestroy, DoCheck {
    private readonly _validGroupChanges: Subject<ValidState | undefined>;

    @ContentChildren(ValidControlNameDirective)
    public validControls: QueryList<ValidControlNameDirective> | undefined;

    @Input()
    public validGroup: ValidGroup | undefined;

    constructor() {
        const validControlChanges = new Subject<ValidState | undefined>();
        super(validControlChanges.asObservable());

        this._validGroupChanges = validControlChanges;
    }

    public ngDoCheck(): void {
        this.onChanged();

        // TODO: Maybe there is a better way?
        // This is here because the validControls are not updated if ngIf is triggered.
        setTimeout(() => {
            this.onChanged();
        });
    }

    public ngOnDestroy(): void {
        this._validGroupChanges.next(undefined);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if ('validGroup' in changes) {
            this._validGroupChanges.next(this.validGroup);
            this.onChanged();
        }
    }

    private onChanged(): void {
        if (this.validControls !== undefined && this.validGroup !== undefined) {
            for (const validControl of this.validControls) {
                validControl.setValidGroup(this.validGroup);
            }
        }
    }
}