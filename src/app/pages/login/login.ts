import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit {
  ngAfterViewInit(): void {
    const toggleButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;
    const eyeIcon = document.getElementById('eyeIcon');

    if (!toggleButton || !passwordInput || !eyeIcon) return;

    toggleButton.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);

      if (type === 'text') {
        eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7s.24-1.22.77-2.31M7 7c-.52.92-.8 1.93-.8 3.03M15.4 15.4c-.67.67-1.55 1.05-2.5 1.05A3.5 3.5 0 0 1 9.4 10.4M2 2l20 20"/>';
        toggleButton.setAttribute('title', 'Ocultar contraseña');
      } else {
        eyeIcon.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle>';
        toggleButton.setAttribute('title', 'Mostrar contraseña');
      }
    });
  }
}
