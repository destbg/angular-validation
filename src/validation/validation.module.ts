import { NgModule } from "@angular/core";
import { ValidControlNameDirective } from "./directives/valid-control-name.directive";
import { ValidControlDirective } from "./directives/valid-control.directive";
import { ValidGroupDirective } from "./directives/valid-group.directive";

@NgModule({
    declarations: [ValidControlDirective, ValidGroupDirective, ValidControlNameDirective],
    exports: [ValidControlDirective, ValidGroupDirective, ValidControlNameDirective],
})
export class ValidationModule { }