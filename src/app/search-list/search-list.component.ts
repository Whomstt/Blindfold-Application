import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.css']
})
export class SearchListComponent implements OnInit {
  searchQuery: string = ''; 
  searchResults: any[] = []; 
  currentUserID: string = ''; // Add current user ID property

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['query'] || ''; 
      console.log('Search query:', this.searchQuery); 
      this.fetchUsernames(); 
    });

    // Get current user ID (assuming it's available in your application)
    this.currentUserID = ''; // Set it to the current user's ID
  }

  fetchUsernames() {
    this.firestore.collection('users').valueChanges().subscribe(
      (users: any[]) => {
  
        this.firestore.collection('profiles').valueChanges().subscribe(
          (profiles: any[]) => {
  
            const matchedResults = users.map(user => {
              const profile = profiles.find(p => p.userID === user.userID);
              if (profile) {
                return {
                  user: user,
                  profile: profile,
                  userID: user.userID // Include userID here
                };
              } else {
                console.warn(`Profile not found for user with userID: ${user.userID}`);
                return null;
              }
            }).filter(Boolean); 
            const searchTerms = this.searchQuery.split(',').map(term => term.trim());
  
            const interests = searchTerms.slice(3);
  
            this.searchResults = matchedResults.filter(result =>
              result && result.user &&
              result.userID !== this.currentUserID && // Exclude current user
              (result.user.userName.toLowerCase().startsWith(searchTerms[0].toLowerCase()) ||
                  result.profile.userRealName.toLowerCase().startsWith(searchTerms[0].toLowerCase())) &&
              (searchTerms[1] ? result.profile.userAge >= parseInt(searchTerms[1]) : true) && 
              (searchTerms[2] ? result.profile.userAge <= parseInt(searchTerms[2]) : true) && 
              (interests.length === 0 || interests.some(interest => result.profile['user' + interest.charAt(0).toUpperCase() + interest.slice(1).toLowerCase()] === true))
            );
  
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
  viewProfile(userID: string) {
    this.router.navigate(['/view-other-profile', userID]); // Navigate to view_other_profile page with user ID
  }
}
