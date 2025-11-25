import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements AfterViewInit {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  private readonly DEFAULT_USER = {
    cc: 'admin123',
    password: 'demo1234',
    name: 'Ana García'
  };

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.setupPasswordToggle();
  }

  setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const eyeIcon = document.getElementById('eyeIcon');

    if (toggleBtn && passwordInput && eyeIcon) {
      toggleBtn.addEventListener('click', () => {
        this.showPassword = !this.showPassword;
        passwordInput.type = this.showPassword ? 'text' : 'password';
        // swap simple icon paths
        eyeIcon.innerHTML = this.showPassword
          ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/>'
          : '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>';
      });
    }
  }

  private getRegisteredUsers(): any[] {
    try {
      return JSON.parse(localStorage.getItem('mf_users') || '[]');
    } catch {
      return [];
    }
  }

  handleLogin(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.isLoading = true;

    setTimeout(() => {
      // Check default user first
      if (this.email.trim() === this.DEFAULT_USER.cc && this.password === this.DEFAULT_USER.password) {
        const user = { cc: this.DEFAULT_USER.cc, name: this.DEFAULT_USER.name, loginTime: new Date().toISOString() };
        localStorage.setItem('mf_user', JSON.stringify(user));
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
        return;
      }

      // Check registered users
      const users = this.getRegisteredUsers();
      const found = users.find(u => (u.cc === this.email.trim() || u.phone === this.email.trim()) && u.password === this.password);

      if (found) {
        const session = { cc: found.cc, name: found.name, loginTime: new Date().toISOString() };
        localStorage.setItem('mf_user', JSON.stringify(session));
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
        console.log('Logged in user:', session);
        return;
      }

      this.errorMessage = 'Credenciales incorrectas. Verifica C.C/telefono y contraseña.';
      this.isLoading = false;
    }, 600);
  }

  fillDemo() {
    this.email = this.DEFAULT_USER.cc;
    this.password = this.DEFAULT_USER.password;
  }
}
