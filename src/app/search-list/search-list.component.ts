import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.css']
})
export class SearchListComponent implements OnInit {
  usernames$: Observable<any[]> = new Observable<any[]>();

  constructor(private firestore: AngularFirestore) { }

  ngOnInit() {
    this.usernames$ = this.firestore.collection('users').valueChanges();
  }
}