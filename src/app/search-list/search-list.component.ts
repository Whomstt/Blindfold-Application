import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.css']
})
export class SearchListComponent implements OnInit {
  searchQuery: string = ''; 
  searchResults: string[] = [];
  usernames: string[] = []; 

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
  this.route.queryParams.subscribe(params => {
    this.searchQuery = params['query'] || ''; 
    console.log('Search query:', this.searchQuery); 
    this.fetchUsernames(); 
  });
}

  fetchUsernames() {
  this.firestore.collection('users').valueChanges().subscribe(
  (usernames: any[]) => {
    console.log('Usernames:', usernames); 
    this.usernames = usernames.map(user => user.userName); 
    this.filterSearchResults(); 
  },
  error => {
    console.error('Error fetching usernames:', error);
  }
);
}

 filterSearchResults() {
  if (this.usernames && this.usernames.length > 0) {
    this.searchResults = this.usernames.filter(username =>
      username && username.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  } else {
    this.searchResults = [];
  }
}
}