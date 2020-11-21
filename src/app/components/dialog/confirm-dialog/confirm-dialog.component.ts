import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {

  title: string;
  message: string;

  constructor(private dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data) {

    this.title = data.title;
    this.message = data.message;
  }

  confirm() {
    this.dialogRef.close(true);
  }

  deny() {
    this.dialogRef.close(false);
  }
}
