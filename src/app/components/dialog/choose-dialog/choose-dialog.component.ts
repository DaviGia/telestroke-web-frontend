import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Validators, FormControl } from '@angular/forms';

export interface SelectItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-choose-dialog',
  templateUrl: './choose-dialog.component.html',
  styleUrls: ['./choose-dialog.component.css']
})
export class ChooseDialogComponent implements OnInit {

  title: string;
  label: string;
  message: string;
  items: SelectItem[];

  selectFormControl = new FormControl('', Validators.required);

  constructor(private dialogRef: MatDialogRef<ChooseDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data) {

    this.title = data.title as string;
    this.message = data.message as string;
    this.items = data.items as SelectItem[];
  }

  ngOnInit() {
  }

  confirm() {
    let selectedValue = this.selectFormControl.value;
    this.dialogRef.close(selectedValue);
  }

  deny() {
    this.dialogRef.close('');
  }
}
