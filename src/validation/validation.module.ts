import { NgModule } from "@angular/core";
import { ValidControlDirective } from "./directives/valid-control.directive";

@NgModule({
    declarations: [ValidControlDirective],
    exports: [ValidControlDirective]
})
export class ValidationModule { }