import { Observable, Subject, Subscription } from 'rxjs';
import { IValidState } from './interfaces/valid-state.interface';
import { ValidState } from './valid-state';

export class ValidArray<T> extends ValidState<T> {
  private readonly subscriptions: [Subscription, Subscription][];
  private readonly _childValueChanged: Subject<void>;

  constructor(validStates?: IValidState[], groups?: { [key: string]: () => boolean }) {
    super();
    this.validStates = validStates ?? [];

    this.subscriptions = this.validStates.map((f) => [
      f.anyValueChanges.subscribe({
        next: this.validStateValueChanged.bind(this),
      }),
      f.statusChanges.subscribe({
        next: this.validStateStatusChanged.bind(this),
      }),
    ]);

    for (const validState of this.validStates) {
      validState.setParent(this);
    }

    this.groupsFns = groups ?? {};
    this.inactiveGroups = Object.entries(this.groupsFns)
      .filter((f) => f[1]())
      .map((f) => f[0]);

    this._childValueChanged = new Subject<void>();
    this.childValueChanges = this._childValueChanged.asObservable();
  }

  public readonly validStates: IValidState[];
  public readonly groupsFns: { [key: string]: () => boolean };

  public readonly childValueChanges: Observable<void>;

  public checkGroups(): void {
    this.inactiveGroups = Object.entries(this.groupsFns)
      .filter((f) => f[1]())
      .map((f) => f[0]);

    for (const validState of this.validStates) {
      if (validState.groups.filter((f) => this.inactiveGroups.includes(f)).length === 0) {
        validState.enable();
      } else {
        validState.disable();
      }
    }
  }

  public addValidState(validState: IValidState): void {
    validState.setParent(this);

    this.validStates.push(validState);

    this.subscriptions.push([
      validState.anyValueChanges.subscribe({
        next: this.validStateValueChanged.bind(this),
      }),
      validState.statusChanges.subscribe({
        next: this.validStateStatusChanged.bind(this),
      }),
    ]);

    this.checkGroups();
  }

  public removeValidState(validState: IValidState): void {
    const index = this.validStates.indexOf(validState);

    if (index !== -1) {
      this.validStates.splice(index, 1);

      this.subscriptions[index][0].unsubscribe();
      this.subscriptions[index][1].unsubscribe();
      this.subscriptions.splice(index, 1);
    }
  }

  protected onDisable(): void {
    for (const validState of this.validStates) {
      validState.parentDisabled();
    }
  }

  protected onEnable(): void {
    for (const validState of this.validStates) {
      validState.parentEnabled();
    }
  }

  protected onTouched(): void {
    for (const validState of this.validStates) {
      validState.wasTouched();
    }
  }

  private validStateValueChanged(): void {
    this.checkGroups();
    this._childValueChanged.next();
  }

  private validStateStatusChanged(status: 'VALID' | 'INVALID' | 'DISABLED'): void {
    if (status === 'INVALID') {
      this.setStatus(status);
    }
  }
}
