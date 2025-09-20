# Merre Data Platform

> **Plataforma educativa moderna para gestión de evaluaciones y análisis de datos académicos**

## Descripción

Merre Data Platform es una aplicación web robusta desarrollada con React y TypeScript que integra múltiples librerías modernas para crear una plataforma versátil de gestión de datos educativos. Combina Material-UI, Bootstrap, Firebase y herramientas avanzadas de formularios para ofrecer una experiencia de usuario completa en el ámbito educativo.

## Características Principales

### Funcionalidades

- **Sistema de Autenticación:** Gestión completa de usuarios con Firebase Auth
- **Gestión de Evaluaciones:** Creación, edición y aplicación de exámenes
- **Dashboard Administrativo:** Panel de control para administradores
- **Análisis de Resultados:** Visualización de estadísticas y métricas
- **Gestión de Usuarios:** Administración de estudiantes y profesores
- **Responsive Design:** Interfaz adaptativa para todos los dispositivos

### Características Técnicas

- **Clean Architecture:** Implementación con separación de responsabilidades
- **Type Safety:** TypeScript estricto en toda la aplicación
- **Componentes Reutilizables:** Biblioteca de componentes UI consistente
- **Formularios Avanzados:** Validación robusta con React Hook Form
- **Estado Global:** Gestión eficiente del estado de la aplicación
- **Firebase Integration:** Backend como servicio completo

## Stack Tecnológico

### Frontend
- **React 18.2.0** - Biblioteca principal
- **TypeScript 5.3.3** - Tipado estático
- **Material-UI 5.15.15** - Sistema de diseño
- **React Bootstrap 2.10.2** - Componentes adicionales
- **React Hook Form 7.51.3** - Gestión de formularios

### Backend y Servicios
- **Firebase 10.11.0** - Backend como servicio
- **Firebase Auth** - Autenticación
- **Firestore** - Base de datos NoSQL
- **Firebase Storage** - Almacenamiento de archivos

### Herramientas de Desarrollo
- **Create React App** - Configuración base
- **React Router DOM 6.22.3** - Enrutamiento
- **React DatePicker 6.8.0** - Selector de fechas
- **Axios 1.6.8** - Cliente HTTP

## Arquitectura

### Estructura del Proyecto

```
src/
├── domain/                     # Capa de Dominio
│   ├── entities/              # Entidades de negocio
│   │   ├── User.ts           # Entidad Usuario
│   │   ├── Assessment.ts     # Entidad Evaluación
│   │   └── Admin.ts          # Entidad Administrador
│   └── interfaces/           # Contratos y abstracciones
│       ├── repositories/     # Interfaces de repositorio
│       └── common/          # Tipos comunes
├── application/              # Capa de Aplicación
│   ├── usecases/            # Casos de uso
│   │   ├── AuthUseCases.ts  # Casos de uso de autenticación
│   │   ├── UserUseCases.ts  # Casos de uso de usuarios
│   │   └── AssessmentUseCases.ts # Casos de uso de evaluaciones
│   └── dto/                 # DTOs de aplicación
├── infrastructure/          # Capa de Infraestructura
│   ├── firebase/           # Configuración Firebase
│   ├── repositories/       # Implementaciones de repositorio
│   └── http/              # Clientes HTTP
└── presentation/           # Capa de Presentación
    ├── components/         # Componentes React
    ├── pages/             # Páginas principales
    └── hooks/             # Custom hooks
```

### Casos de Uso Implementados

#### Autenticación
```typescript
// Login de usuario
const loginResult = await authUseCases.login(email, password);

// Registro de usuario
const registerResult = await authUseCases.register(userData);

// Logout
await authUseCases.logout();
```

#### Gestión de Evaluaciones
```typescript
// Crear evaluación
const assessment = await assessmentUseCases.create(assessmentData);

// Obtener evaluaciones
const assessments = await assessmentUseCases.getAll();

// Evaluar respuestas
const result = await assessmentUseCases.evaluate(answers);
```

#### Administración
```typescript
// Dashboard de estadísticas
const stats = await adminUseCases.getDashboardStats();

// Gestión de usuarios
const users = await adminUseCases.getUsers();
```

## Instalación

### Prerrequisitos

- Node.js >= 16.0.0
- npm >= 8.0.0 o yarn >= 1.22.0
- Cuenta de Firebase

### Configuración

```bash
# Clonar repositorio
git clone https://github.com/Yop007N/merre-data-platform.git
cd merre-data-platform

# Instalar dependencias
npm install

# Configurar Firebase
cp .env.example .env
# Editar .env con las credenciales de Firebase

# Iniciar aplicación
npm start
```

### Variables de Entorno

```bash
# .env
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id
```

## Configuración de Firebase

### Firestore Collections

```javascript
// Estructura de colecciones
users: {
  uid: string,
  email: string,
  displayName: string,
  role: 'student' | 'teacher' | 'admin',
  createdAt: timestamp,
  lastLogin: timestamp
}

assessments: {
  id: string,
  title: string,
  description: string,
  questions: Question[],
  createdBy: string,
  createdAt: timestamp,
  isActive: boolean
}

results: {
  id: string,
  assessmentId: string,
  userId: string,
  answers: Answer[],
  score: number,
  submittedAt: timestamp
}
```

### Reglas de Seguridad

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Only admins can manage assessments
    match /assessments/{assessmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Uso

### Autenticación

```typescript
// Hook de autenticación
const { user, login, logout, loading } = useAuth();

// Componente protegido
function ProtectedComponent() {
  if (!user) return <LoginForm />;
  return <Dashboard />;
}
```

### Formularios

```typescript
// Formulario con validación
const { register, handleSubmit, errors } = useForm({
  resolver: yupResolver(schema)
});

const onSubmit = async (data) => {
  const result = await submitAssessment(data);
  if (result.success) {
    navigate('/results');
  }
};
```

### Gestión de Estado

```typescript
// Context para estado global
const { assessments, loading, error } = useAssessments();

// Actualización de estado
const updateAssessment = async (id, data) => {
  await assessmentService.update(id, data);
  refreshAssessments();
};
```

## Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con cobertura
npm test -- --coverage

# Tests específicos
npm test -- --testNamePattern="AuthUseCases"
```

### Estructura de Tests

```
src/
├── __tests__/
│   ├── components/
│   ├── usecases/
│   └── utils/
└── setupTests.js
```

## Scripts Disponibles

```bash
npm start            # Ejecutar en desarrollo
npm run build        # Build de producción
npm test             # Ejecutar tests
npm run eject        # Ejectar de CRA (no recomendado)
```

## Estructura de Componentes

### Componentes Principales

- **LoginForm** - Formulario de autenticación
- **Dashboard** - Panel principal de usuario
- **AssessmentList** - Lista de evaluaciones
- **AssessmentForm** - Formulario de evaluación
- **ResultsView** - Visualización de resultados
- **AdminPanel** - Panel de administración

### Componentes Reutilizables

- **Card** - Componente de tarjeta
- **Button** - Botón personalizado
- **Input** - Campo de entrada
- **Modal** - Ventana modal
- **Loading** - Indicador de carga

## Deployment

### Build de Producción

```bash
# Generar build optimizado
npm run build

# Los archivos se generan en /build
build/
├── static/
│   ├── css/
│   └── js/
├── index.html
└── manifest.json
```

### Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar proyecto
firebase init hosting

# Desplegar
firebase deploy
```

## Contribución

### Guías de Desarrollo

1. Seguir principios de Clean Architecture
2. Usar TypeScript estricto
3. Escribir tests para componentes nuevos
4. Mantener consistencia en nomenclatura
5. Documentar componentes complejos

### Estructura de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
```

---

**Autor:** Enrique Bobadilla
**Versión:** 2.0.0
**Última actualización:** Diciembre 2024