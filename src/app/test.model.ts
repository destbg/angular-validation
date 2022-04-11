export class TestModel {
  public text!: string | undefined;
  public text2!: string | undefined;
  public text3!: string | undefined;

  constructor(params: Partial<TestModel>) {
    Object.assign(this, params);
  }
}
