import { FormControlStatus } from "@angular/forms";
import { ValidationStatus } from "../helpers/validation-status";

export class ReactiveFormsUtil {
  public static mapStatus(status: FormControlStatus): ValidationStatus {
    switch (status) {
      case "VALID":
        return 'VALID';
      case "INVALID":
        return 'INVALID';
      case 'DISABLED':
        return 'DISABLED';
      case 'PENDING':
        return 'INVALID';
    }
  }
}