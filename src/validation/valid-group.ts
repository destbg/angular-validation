import { Observable, Subject, Subscription } from 'rxjs';
import { ValidationStatus } from './helpers/validation-status';
import { IValidControl } from './interfaces/valid-control.interface';
import { ValidationResultModel } from './models/validation-result.model';
import { ValidatorModel } from './models/validator.model';
import { ValidState } from './valid-state';

export class ValidGroup extends ValidState {
  private readonly subscriptions: [Subscription, Subscription][];
  private readonly _childValueChanged: Subject<void>;
  private _massUpdateCount: number = 0;
  private _updateFiredDuringMassUpdate: boolean = false;

  constructor(validControls?: { [key: string]: IValidControl } | IValidControl[], groups?: { [key: string]: () => boolean }) {
    super();

    this.validators = [];

    this._childValueChanged = new Subject<void>();
    this.childValueChanges = this._childValueChanged.asObservable();

    this.groupsFns = groups ?? {};
    this.inactiveGroups = Object.entries(this.groupsFns)
      .filter((f) => f[1]())
      .map((f) => f[0]);

    if (validControls === null || validControls === undefined) {
      this.validControls = {};
      this.validControlsArray = [];
    } else if (Array.isArray(validControls)) {
      this.validControls = {};
      this.validControlsArray = validControls;
    } else {
      this.validControls = validControls;
      this.validControlsArray = Object.values(this.validControls);
    }

    this.subscriptions = this.validControlsArray.map((f) => [
      f.anyValueChanges.subscribe({
        next: this.validControlValueChanged.bind(this),
      }),
      f.statusChanges.subscribe({
        next: this.validControlStatusChanged.bind(this),
      }),
    ]);

    const validControlsEntries = Object.entries(this.validControls);

    for (const validControl of this.validControlsArray) {
      validControl.setParent(this, validControlsEntries.find(f => f[1] === validControl)?.[0]);
    }
  }

  public readonly validControls: { [key: string]: IValidControl };
  public readonly validControlsArray: IValidControl[];
  public readonly groupsFns: { [key: string]: () => boolean };

  public readonly childValueChanges: Observable<void>;

  /** The valid state's validators. */
  public readonly validators: ValidatorModel[];

  /** The inactive groups of the valid state. */
  public inactiveGroups: string[];

  public checkGroups(): void {
    this.inactiveGroups = Object.entries(this.groupsFns)
      .filter((f) => f[1]())
      .map((f) => f[0]);

    for (const validState of this.validControlsArray) {
      if (validState.groups.filter((f) => this.inactiveGroups.includes(f)).length === 0) {
        validState.enable();
      } else {
        validState.disable();
      }
    }
  }

  public addValidControl(key: string, validControl: IValidControl): void {
    const previousValidState = this.validControls[key];

    if (previousValidState !== null && previousValidState !== undefined) {
      throw new Error(`The key ${key} is already added to the valid states collection.`);
    }

    validControl.setParent(this, key);

    this.validControls[key] = validControl;
    this.validControlsArray.push(validControl);

    this.subscriptions.push([
      validControl.anyValueChanges.subscribe({
        next: this.validControlValueChanged.bind(this),
      }),
      validControl.statusChanges.subscribe({
        next: this.validControlStatusChanged.bind(this),
      }),
    ]);

    this.checkGroups();
  }

  public removeValidControl(key: string): void {
    const validState = this.validControls[key];

    if (validState !== null && validState !== undefined) {
      const index = this.validControlsArray.indexOf(validState);

      if (index !== -1) {
        this.validControlsArray.splice(index, 1);

        this.subscriptions[index][0].unsubscribe();
        this.subscriptions[index][1].unsubscribe();
        this.subscriptions.splice(index, 1);
      }

      delete this.validControls[key];
    }
  }

  public addValidControlToArray(validControl: IValidControl): void {
    validControl.setParent(this, undefined);

    this.validControlsArray.push(validControl);

    this.subscriptions.push([
      validControl.anyValueChanges.subscribe({
        next: this.validControlValueChanged.bind(this),
      }),
      validControl.statusChanges.subscribe({
        next: this.validControlStatusChanged.bind(this),
      }),
    ]);

    this.checkGroups();
  }

  public removeValidControlFromArray(validControl: IValidControl): void {
    const index = this.validControlsArray.indexOf(validControl);

    if (index !== -1) {
      const validControlName = Object.entries(this.validControls)
        .find(f => f[1] === validControl)?.[0];

      if (validControlName !== null && validControlName !== undefined) {
        delete this.validControls[validControlName];
      }

      this.validControlsArray.splice(index, 1);

      this.subscriptions[index][0].unsubscribe();
      this.subscriptions[index][1].unsubscribe();
      this.subscriptions.splice(index, 1);
    }
  }

  public clear(): void {
    while (this.validControlsArray.length > 0) {
      const validControl = this.validControlsArray[0];

      const validControlName = Object.entries(this.validControls)
        .find(f => f[1] === validControl)?.[0];

      if (validControlName !== null && validControlName !== undefined) {
        delete this.validControls[validControlName];
      }

      this.validControlsArray.splice(0, 1);

      this.subscriptions[0][0].unsubscribe();
      this.subscriptions[0][1].unsubscribe();
      this.subscriptions.splice(0, 1);
    }
  }

  public validate(inactiveGroups: string[]): ValidationResultModel[] {
    const results: ValidationResultModel[] = [];

    for (const validControl of this.validControlsArray) {
      const validControlResults = validControl.validate(inactiveGroups);

      results.push(...validControlResults);
    }

    return results;
  }

  protected onDisable(): void {
    for (const validState of this.validControlsArray) {
      validState.disable();
    }
  }

  protected onEnable(): void {
    for (const validState of this.validControlsArray) {
      validState.enable();
    }
  }

  protected onTouched(): void {
    for (const validState of this.validControlsArray) {
      validState.markAsTouched();
    }
  }

  /** @internal */
  startMassUpdate(): void {
    this._massUpdateCount++;
  }

  /** @internal */
  endMassUpdate(): void {
    this._massUpdateCount--;

    if (this._massUpdateCount === 0 && this._updateFiredDuringMassUpdate === true) {
      this._childValueChanged.next();
    }
  }

  private validControlValueChanged(): void {
    if (this._massUpdateCount > 0) {
      this._updateFiredDuringMassUpdate = true;
      return;
    }

    this.checkGroups();
    this._childValueChanged.next();
  }

  private validControlStatusChanged(): void {
    if (this._status === 'INVALID' || this._status === 'DISABLED') {
      return;
    }

    let status: ValidationStatus = 'VALID';

    for (const validControl of this.validControlsArray) {
      if (validControl.status === 'INVALID') {
        status = 'INVALID';
        break;
      }
    }

    if (this._status !== status) {
      this._status = status;
      this._statusChanges.next(status);
    }
  }
}
