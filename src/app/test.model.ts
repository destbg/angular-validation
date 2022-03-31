export class TestModel {
  public text!: string | undefined | null;

  constructor(params: Partial<TestModel>) {
    Object.assign(this, params);
  }
}
