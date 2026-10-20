import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: any = null;
  token = '';
  message = 'Loading profile...';

  ngOnInit(): void {
    this.token = localStorage.getItem('jwt_token') || '';

    if (!this.token) {
      this.message = 'No token found. Please login first.';
      return;
    }

    this.loadProfile();
  }

  async loadProfile() {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        this.message = data.message || 'Unable to load profile';
        return;
      }

      this.user = data.user;
      this.message = 'Profile loaded successfully';
    } catch (error) {
      this.message = 'Unable to load profile from the backend.';
      console.error(error);
    }
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.user = null;
    this.token = '';
    this.message = 'You logged out.';
  }
}
