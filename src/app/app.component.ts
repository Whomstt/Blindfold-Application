import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore'; 
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  items: Observable<any[]> | undefined;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.checkAdminStatus(user.uid);
      } else {
        // If user is not logged in, redirect to login page or another appropriate page
        // Example: this.router.navigate(['/login']);
      }
    });
  }

  checkAdminStatus(uid: string): void {
    // Fetch user data from Firestore to determine admin status
    this.firestore.collection('users').doc(uid).valueChanges().pipe(
      map((userData: any) => userData && userData.userType === 'Admin'), // Check if userType is 'Admin'
      catchError(error => {
        console.error('Error checking admin status:', error);
        return throwError(error);
      })
    ).subscribe(isAdmin => {
      if (isAdmin) {
        // Navigate to the admin page if the user is an admin
        this.router.navigate(['/admin']);
      }
    });
  }
}
