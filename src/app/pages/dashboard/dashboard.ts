import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Appointment {
  id: string;
  userCc: string;
  specialty: string;
  doctor?: string;
  datetime: string; // ISO
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  isAuthenticated = false;
  currentUser: { cc: string; name: string; loginTime?: string } | null = null;

  // appointments loaded for current user
  appointments: Appointment[] = [];

  // UI state
  activeTab = 'upcoming';
  showMessageModal = false;
  messageTitle = '';
  messageContent = '';

  // New appointment modal state
  showNewAppointmentModal = false;
  // Especialidades y doctores (configurable)
  specialties = [
    'Cardiología',
    'Medicina General',
    'Odontología',
    'Nutrición',
    'Oftalmología'
  ];

  doctorsMap: Record<string, string[]> = {
    'Cardiología': ['Dr. Elena Torres', 'Dr. Ricardo Méndez', 'Dra. Paula Ruiz'],
    'Medicina General': ['Dr. Ricardo Pérez', 'Dra. Marta López', 'Dr. Hugo Salazar'],
    'Odontología': ['Dra. Claudia Ramos', 'Dr. Andrés Molina', 'Dra. Laura Castro'],
    'Nutrición': ['Lic. Javier Soto', 'Lic. Silvia Ortega', 'Lic. Mario Díaz'],
    'Oftalmología': ['Dra. Laura Montes', 'Dr. Fernando Gil', 'Dra. Isabel Soto']
  };

  // New appointment modal state (reused)
  newSpecialty = '';
  newDoctor = '';
  newDate = ''; // yyyy-mm-dd
  newTime = ''; // HH:MM
  newNotes = '';
  isSavingAppointment = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAuthentication();
  }

  checkAuthentication() {
    const stored = localStorage.getItem('mf_user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        this.isAuthenticated = true;
        this.loadAppointmentsForUser();
        return;
      } catch {
        // fallthrough
      }
    }
    this.redirectToLogin();
  }

  redirectToLogin() {
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }

  logout() {
    localStorage.removeItem('mf_user');
    this.isAuthenticated = false;
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  // Storage helpers
  private getAllAppointments(): Appointment[] {
    try {
      return JSON.parse(localStorage.getItem('mf_appointments') || '[]');
    } catch {
      return [];
    }
  }

  private saveAllAppointments(list: Appointment[]) {
    localStorage.setItem('mf_appointments', JSON.stringify(list));
  }

  loadAppointmentsForUser() {
    if (!this.currentUser) { this.appointments = []; return; }
    const all = this.getAllAppointments();
    this.appointments = all.filter(a => a.userCc === this.currentUser!.cc)
                           .sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  }

  // Derived lists
  get upcomingAppointments() {
    return this.appointments.filter(a => a.status === 'upcoming');
  }

  get historyAppointments() {
    return this.appointments.filter(a => a.status !== 'upcoming');
  }

  // New appointment modal actions
  openNewAppointmentModal() {
    this.newSpecialty = '';
    this.newDoctor = '';
    this.newDate = '';
    this.newTime = '';
    this.newNotes = '';
    this.showNewAppointmentModal = true;
  }

  onSpecialtyChange() {
    // si hay doctores para la especialidad, seleccionar por defecto el primero (opcional)
    const list = this.getDoctorsForSpecialty();
    this.newDoctor = list.length ? list[0] : '';
  }

  getDoctorsForSpecialty(): string[] {
    return this.doctorsMap[this.newSpecialty] || [];
  }

  // Cierra el modal de nueva cita y limpia el formulario
  closeNewAppointmentModal() {
    this.showNewAppointmentModal = false;
    this.isSavingAppointment = false;
    this.newSpecialty = '';
    this.newDoctor = '';
    this.newDate = '';
    this.newTime = '';
    this.newNotes = '';
  }
  
  addAppointment(e?: Event) {
    e?.preventDefault();
    if (!this.currentUser) return;

    const date = String(this.newDate || '').trim();
    const time = String(this.newTime || '').trim();
    const specialty = String(this.newSpecialty || '').trim();
    // doctor can be optional (empty string)
    const doctor = String(this.newDoctor || '').trim();

    if (!date || !time || !specialty) {
      this.showMessage('Datos incompletos', 'Completa fecha, hora y especialidad para solicitar la cita.');
      return;
    }

    this.isSavingAppointment = true;
    setTimeout(() => {
      const dt = new Date(`${date}T${time}`);
      const appointment: Appointment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        userCc: this.currentUser!.cc,
        specialty,
        doctor: doctor || '',
        datetime: dt.toISOString(),
        notes: this.newNotes?.trim() || '',
        status: 'upcoming',
        createdAt: new Date().toISOString()
      };

      const all = this.getAllAppointments();
      all.push(appointment);
      this.saveAllAppointments(all);

      this.loadAppointmentsForUser();
      this.isSavingAppointment = false;
      this.closeNewAppointmentModal();
      this.activeTab = 'upcoming';
      this.showMessage('Cita solicitada', 'La cita ha sido agregada a tu lista de próximas citas.');
    }, 500);
  }

  // appointment actions
  cancelAppointmentById(id: string) {
    const all = this.getAllAppointments();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return;
    all[idx].status = 'cancelled';
    this.saveAllAppointments(all);
    this.loadAppointmentsForUser();
    this.showMessage('Cita cancelada', 'La cita ha sido marcada como cancelada.');
  }

  markCompleted(id: string) {
    const all = this.getAllAppointments();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return;
    all[idx].status = 'completed';
    this.saveAllAppointments(all);
    this.loadAppointmentsForUser();
    this.showMessage('Cita completada', 'La cita ha sido marcada como realizada.');
  }

  showMessage(title: string, message = '') {
    this.messageTitle = title;
    this.messageContent = message;
    this.showMessageModal = true;
  }

  closeModal() {
    this.showMessageModal = false;
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
  }
}