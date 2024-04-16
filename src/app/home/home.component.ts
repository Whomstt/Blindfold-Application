import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userEmail: string | null = null; // Initialize userEmail
  searchQuery: string = '';

  constructor(
    public firebaseService: FirebaseService,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userEmail = user.email; // Get user email if user is logged in
      }
    });
  }

  async logout() {
    this.firebaseService.logout();
    this.router.navigate(['']);
  }

  onSearch() {
    // Redirect to search-list component with the search query as a parameter
    this.router.navigate(['/search-list'], { queryParams: { query: this.searchQuery } });
  }
}
