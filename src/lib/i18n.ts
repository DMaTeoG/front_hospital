import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      welcome: 'Bienvenido',
      appointments: 'Citas',
      doctors: 'Médicos',
      patients: 'Pacientes',
      schedules: 'Horarios',
      users: 'Usuarios',
      dashboard: 'Tablero',
      logout: 'Cerrar sesión',
    },
  },
  en: {
    translation: {
      welcome: 'Welcome',
      appointments: 'Appointments',
      doctors: 'Doctors',
      patients: 'Patients',
      schedules: 'Schedules',
      users: 'Users',
      dashboard: 'Dashboard',
      logout: 'Sign out',
    },
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'es',
      interpolation: {
        escapeValue: false,
      },
    })
    .catch(() => {
      // silent fail, app can continue without i18n
    });
}

export { i18n };
