import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
	{ path: 'login', component: Login },
	{ path: 'register', component: Register },
	{ path: 'dashboard', component: Dashboard },
	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
