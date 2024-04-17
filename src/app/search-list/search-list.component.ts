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
  searchResults: any[] = []; 

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
      (users: any[]) => {
        console.log('Users:', users); 

        // Fetch profiles
        this.firestore.collection('profiles').valueChanges().subscribe(
          (profiles: any[]) => {
            console.log('Profiles:', profiles);

            // Match profiles with users
            this.searchResults = profiles.map(profile => {
              const user = users.find(u => u.uid === profile.uid);
              return {
                user: user,
                profile: profile
              };
            });

            console.log('Search results:', this.searchResults);
          },
          error => {
            console.error('Error fetching profiles:', error);
          }
        );
      },
      error => {
        console.error('Error fetching users:', error);
      }
    );
  }
}
