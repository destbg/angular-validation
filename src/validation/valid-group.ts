import { Observable, Subject, Subscription } from 'rxjs';
import { IValidState } from './interfaces/valid-state.interface';
import { ValidState } from './valid-state';

export class ValidGroup<T> extends ValidState<T> {
  private readonly subscriptions: [Subscription, Subscription][];
  private readonly _childValueChanged: Subject<void>;

  constructor(validStates?: { [key: string]: IValidState }, groups?: { [key: string]: () => boolean }) {
    super();
    this.validStates = validStates ?? {};
    this.validStatesArray = Object.values(this.validStates);

    this.subscriptions = this.validStatesArray.map((f) => [
      f.anyValueChanges.subscribe({
        next: this.validStateValueChanged.bind(this),
      }),
      f.statusChanges.subscribe({
        next: this.validStateStatusChanged.bind(this),
      }),
    ]);

    for (const validState of this.validStatesArray) {
      validState.setParent(this);
    }

    this.groupsFns = groups ?? {};
    this.inactiveGroups = Object.entries(this.groupsFns)
      .filter((f) => f[1]())
      .map((f) => f[0]);

    this._childValueChanged = new Subject<void>();
    this.childValueChanges = this._childValueChanged.asObservable();
  }

  public readonly validStates: { [key: string]: IValidState };
  public readonly validStatesArray: IValidState[];
  public readonly groupsFns: { [key: string]: () => boolean };

  public readonly childValueChanges: Observable<void>;

  public checkGroups(): void {
    this.inactiveGroups = Object.entries(this.groupsFns)
      .filter((f) => f[1]())
      .map((f) => f[0]);

    for (const validState of this.validStatesArray) {
      if (validState.groups.filter((f) => this.inactiveGroups.includes(f)).length === 0) {
        validState.enable();
      } else {
        validState.disable();
      }
    }
  }

  public addValidState(key: string, validState: IValidState): void {
    const previousValidState = this.validStates[key];

    if (previousValidState !== null && previousValidState !== undefined) {
      throw new Error(`The key ${key} is already added to the valid states collection.`);
    }

    validState.setParent(this);

    this.validStates[key] = validState;
    this.validStatesArray.push(validState);

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

  public removeValidState(key: string): void {
    const validState = this.validStates[key];

    if (validState !== null && validState !== undefined) {
      const index = this.validStatesArray.indexOf(validState);

      if (index !== -1) {
        this.validStatesArray.splice(index, 1);

        this.subscriptions[index][0].unsubscribe();
        this.subscriptions[index][1].unsubscribe();
        this.subscriptions.splice(index, 1);
      }

      delete this.validStates[key];
    }
  }

  protected onDisable(): void {
    for (const validState of this.validStatesArray) {
      validState.parentDisabled();
    }
  }

  protected onEnable(): void {
    for (const validState of this.validStatesArray) {
      validState.parentEnabled();
    }
  }

  protected onTouched(): void {
    for (const validState of this.validStatesArray) {
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
