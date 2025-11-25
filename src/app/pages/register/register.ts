import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  name = '';
  cc = '';
  phone:any = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router) {}

  private getUsers(): any[] {
    try {
      return JSON.parse(localStorage.getItem('mf_users') || '[]');
    } catch {
      return [];
    }
  }

  private saveUsers(users: any[]) {
    localStorage.setItem('mf_users', JSON.stringify(users));
  }

  handleRegister(e: Event) {
    e?.preventDefault();
    this.errorMessage = '';

    // Normalizar teléfono a string (input type=number puede devolver number)
    const normalizedPhone = String(this.phone ?? '').trim();

    if (!this.name.trim() || !this.cc.trim() || !this.password || !normalizedPhone) {
      this.errorMessage = 'Completa los campos requeridos.';
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const users = this.getUsers();
      const exists = users.find(u => u.cc === this.cc.trim() || u.phone === normalizedPhone);

      if (exists) {
        this.errorMessage = 'Ya existe un usuario con esa C.C. o teléfono.';
        this.isLoading = false;
        return;
      }

      const newUser = {
        cc: this.cc.trim(),
        name: this.name.trim(),
        phone: normalizedPhone,
        password: this.password,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      this.saveUsers(users);

      this.isLoading = false;
      // Redirigir al login después del registro
      this.router.navigate(['/login']);
    }, 600);
  }
}
