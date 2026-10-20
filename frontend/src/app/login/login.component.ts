import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

const API_BASE_URL = 'https://api-bearer-login.onrender.com';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isRegister = true;
  form = {
    username: '',
    password: '',
    fullName: '',
    email: ''
  };
  message = '';

  constructor(private router: Router) {}

  async submitForm() {
    const endpoint = this.isRegister
      ? `${API_BASE_URL}/api/register`
      : `${API_BASE_URL}/api/login`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          this.isRegister
            ? {
                username: this.form.username,
                password: this.form.password,
                fullName: this.form.fullName,
                email: this.form.email
              }
            : {
                username: this.form.username,
                password: this.form.password
              }
        )
      });

      const data = await response.json();

      if (!response.ok) {
        this.message = data.message || 'Request failed';
        return;
      }

      if (data.token) {
        localStorage.setItem('jwt_token', data.token);
      }

      this.message = data.message || 'Success';
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.message = 'Server is unreachable. Start the backend first.';
      console.error(error);
    }
  }
}