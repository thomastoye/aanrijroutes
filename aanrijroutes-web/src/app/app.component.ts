import { Component, Inject } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { map, Observable } from 'rxjs';

const COLLECTION_NAME = 'routes'

type CollectionEntry = {
  id: string
  creationDate: string
  markers: readonly {
    lat: number
    lng: number
  }[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    @Inject(MatDialog) public dialog: MatDialog,
    private afs: AngularFirestore
  ) {
    this.collection = this.afs.collection(COLLECTION_NAME)
    this.items$ = this.collection.valueChanges().pipe(map(list => ([...list]).sort((a, b) => b.creationDate.localeCompare(a.creationDate))))
  }

  title = 'Aanrijroutes';
  lat = 51.05467898167528;
  lng = 3.7257560729602623;
  items$: Observable<CollectionEntry[]>
  selectedItem$: Observable<CollectionEntry> | null = null
  collection: AngularFirestoreCollection<CollectionEntry>

  mapClicked($event: { coords: { lat: number, lng: number } }, selectedItem: CollectionEntry) {
    const updated: CollectionEntry = {
      ...selectedItem,
      markers: [
        ...selectedItem.markers,
        {
          lat: $event.coords.lat,
          lng: $event.coords.lng
        }
      ]
    }

    this.collection.doc(selectedItem.id).set(updated)
  }

  markerClicked(i: number, selectedItem: CollectionEntry) {
    const updated: CollectionEntry = {
      ...selectedItem,
      markers: [
        ...selectedItem.markers.filter((_, idx) => idx !== i)
      ]
    }

    this.collection.doc(selectedItem.id).set(updated)
  }

  changeSelectedRoute(route: CollectionEntry) {
    console.log('Changed selected route to', route)
    this.selectedItem$ = this.collection.doc(route.id).valueChanges() as Observable<CollectionEntry>
  }

  newRouteDialog() {
    let dialogRef = this.dialog.open(DialogNewRouteDialog, {
      width: '250px',
      data: { name: '' }
    });

    dialogRef.afterClosed().subscribe((result: { name: string }) => {
      if (result == null || result.name == null || result.name == '') {
        return
      }

      const id = result.name.replace(/\s/g, '_')

      const doc: CollectionEntry = {
        id,
        creationDate: new Date().toISOString(),
        markers: [
          {
            lat: 51.05467898167528,
            lng: 3.7257560729602623
          }
        ]
      }

      this.collection.doc(id).set(doc).catch(err => {
        console.error('Could not create new route', err, doc)
      }).then(() => {
        this.selectedItem$ = this.collection.doc(id).valueChanges() as Observable<CollectionEntry>
      })
    });
  }
}

@Component({
  selector: 'dialog-new-route-name',
  template: `
  <h1 mat-dialog-title>Naam voor de nieuwe route</h1>
  <div mat-dialog-content>
    <mat-form-field appearance="fill">
      <mat-label>Naam nieuwe route</mat-label>
      <input matInput [(ngModel)]="data.name">
    </mat-form-field>
  </div>
  <div mat-dialog-actions>
    <button mat-button (click)="onNoClick()">Annuleren</button>
    <button mat-button [mat-dialog-close]="data" cdkFocusInitial>Ok</button>
  </div>
`
})
export class DialogNewRouteDialog {

  constructor(
    @Inject(MatDialogRef) public dialogRef: MatDialogRef<DialogNewRouteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
