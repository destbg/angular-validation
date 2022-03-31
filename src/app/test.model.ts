export class TestModel {
  public text!: string | null | undefined;
  public text2!: string | null | undefined;

  constructor(params: Partial<TestModel>) {
    Object.assign(this, params);
  }
}
