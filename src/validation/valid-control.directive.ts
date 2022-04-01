import { Directive, forwardRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { IValidControl } from './interfaces/valid-control.interface';
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
  private readonly _validControlChanges: Subject<IValidControl | null | undefined>;

  @Input()
  public validControl: IValidControl | null | undefined;

  constructor() {
    const validControlChanges = new Subject<IValidControl | null | undefined>();
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
