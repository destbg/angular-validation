import { Observable } from 'rxjs';
import { IValidControl } from './interfaces/valid-control.interface';

export abstract class TLControl {
  constructor(controlChanges: Observable<IValidControl | null | undefined>) {
    this.controlChanges = controlChanges;
  }

  public readonly controlChanges: Observable<IValidControl | null | undefined>;
}
