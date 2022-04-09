export class Loader {
  private readonly _method: () => void;
  private _resolvers: (() => void)[] | undefined;
  private _hasLoaded: boolean;
  private _methodLoading: boolean;

  constructor(method: () => void) {
    this._method = method;
    this._hasLoaded = false;
    this._methodLoading = false;
    this._resolvers = [];
  }

  public load(callback?: () => void): void {
    if (this._hasLoaded) {
      callback?.();
      return;
    }

    if (!this._methodLoading) {
      this._methodLoading = true;
      this._method();
    }

    if (callback !== null && callback !== undefined) {
      this._resolvers!.push(() => {
        callback();
      });
    }
  }

  public complete(): void {
    if (this._hasLoaded) {
      return;
    }

    this._hasLoaded = true;

    for (const resolver of this._resolvers!) {
      resolver();
    }

    this._resolvers = undefined;
  }
}