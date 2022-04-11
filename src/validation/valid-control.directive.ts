import { Directive, forwardRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { AbstractValidControl } from './abstract-valid-control';
import { TLControl } from './tl-control';

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
    private readonly _validControlChanges: Subject<AbstractValidControl | null | undefined>;

    @Input()
    public validControl: AbstractValidControl | null | undefined;

    constructor() {
        const validControlChanges = new Subject<AbstractValidControl | null | undefined>();
        super(validControlChanges.asObservable());

        this._validControlChanges = validControlChanges;
    }

    public ngOnDestroy(): void {
        this._validControlChanges.next(undefined);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        const validControl = changes['validControl'];

        if (validControl !== null && validControl !== undefined) {
            this._validControlChanges.next(validControl.currentValue);
        }
    }
}
