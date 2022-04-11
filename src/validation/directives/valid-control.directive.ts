import { Directive, forwardRef, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { Subject } from "rxjs";
import { AbstractValidControl } from "../abstractions/abstract-valid-control";
import { TLControl } from "../abstractions/tl-control";

export const validControlBinding: any = {
    provide: TLControl,
    useExisting: forwardRef(() => ValidControlDirective),
};

@Directive({
    selector: '[validControl]',
    providers: [validControlBinding],
    exportAs: 'tlForm',
})
export class ValidControlDirective extends TLControl implements OnChanges, OnDestroy {
    private readonly _validControlChanges: Subject<AbstractValidControl | undefined>;

    @Input()
    public validControl: AbstractValidControl | undefined;

    constructor() {
        const validControlChanges = new Subject<AbstractValidControl | undefined>();
        super(validControlChanges.asObservable());

        this._validControlChanges = validControlChanges;
    }

    public ngOnDestroy(): void {
        this._validControlChanges.next(undefined);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if ('validControl' in changes) {
            this._validControlChanges.next(this.validControl);
        }
    }
}
