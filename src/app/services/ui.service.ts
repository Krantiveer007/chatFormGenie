import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})

/**
 * Provides UI utilities, such as Snackbars.
 */
export class UiService {

  currentSnackBar: MatSnackBarRef<SimpleSnackBar> = null;

  constructor(private bar: MatSnackBar, private dialog: MatDialog) { }

  /**
   * Displays a message to the user, in the top center of their screen. Wraps angular material snackbar.
   * @param message - message to be display on snackbar
   * @param action - action of message
   * @param config - config of message
   */
  snackbar(message: string, type?: number, action: string = null, config: MatSnackBarConfig = {}): MatSnackBarRef<SimpleSnackBar> {
    if (type) {
      this.currentSnackBar = this.bar.open(message, action, { verticalPosition: 'top', duration: type, panelClass: 'warn', ...config });
    } else {
      this.currentSnackBar = this.bar.open(message, action, { verticalPosition: 'top', duration: 5000, panelClass: 'warn', ...config });
    }
    return this.currentSnackBar;
  }

  /**
   * Closes the currently displayed snackbar. This is called when the user navigates away from a tabs/view
   */
  closeCurrentSnackbar() {
    if (this.currentSnackBar) {
      this.currentSnackBar.dismiss();
    }
  }

  closeCurrentWarningDialog(): void {
    this.dialog.closeAll();
  }
}
