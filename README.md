# Merre Data Platform

> **Plataforma educativa moderna para gesti??n de evaluaciones y an??lisis de datos acad??micos**

## Descripci??n

Merre Data Platform es una aplicaci??n web robusta desarrollada con React y TypeScript que integra m??ltiples librer??as modernas para crear una plataforma vers??til de gesti??n de datos educativos. Combina Material-UI, Bootstrap, Firebase y herramientas avanzadas de formularios para ofrecer una experiencia de usuario completa en el ??mbito educativo.

## Caracter??sticas Principales

### Funcionalidades

- **Sistema de Autenticaci??n:** Gesti??n completa de usuarios con Firebase Auth
- **Gesti??n de Evaluaciones:** Creaci??n, edici??n y aplicaci??n de ex??menes
- **Dashboard Administrativo:** Panel de control para administradores
- **An??lisis de Resultados:** Visualizaci??n de estad??sticas y m??tricas
- **Gesti??n de Usuarios:** Administraci??n de estudiantes y profesores
- **Responsive Design:** Interfaz adaptativa para todos los dispositivos

### Caracter??sticas T??cnicas

- **Clean Architecture:** Implementaci??n con separaci??n de responsabilidades
- **Type Safety:** TypeScript estricto en toda la aplicaci??n
- **Componentes Reutilizables:** Biblioteca de componentes UI consistente
- **Formularios Avanzados:** Validaci??n robusta con React Hook Form
- **Estado Global:** Gesti??n eficiente del estado de la aplicaci??n
- **Firebase Integration:** Backend como servicio completo

## Stack Tecnol??gico

### Frontend
- **React 18.2.0** - Biblioteca principal
- **TypeScript 5.3.3** - Tipado est??tico
- **Material-UI 5.15.15** - Sistema de dise??o
- **React Bootstrap 2.10.2** - Componentes adicionales
- **React Hook Form 7.51.3** - Gesti??n de formularios

### Backend y Servicios
- **Firebase 10.11.0** - Backend como servicio
- **Firebase Auth** - Autenticaci??n
- **Firestore** - Base de datos NoSQL
- **Firebase Storage** - Almacenamiento de archivos

### Herramientas de Desarrollo
- **Create React App** - Configuraci??n base
- **React Router DOM 6.22.3** - Enrutamiento
- **React DatePicker 6.8.0** - Selector de fechas
- **Axios 1.6.8** - Cliente HTTP

## Arquitectura

### Estructura del Proyecto

```
src/
????????? domain/                     # Capa de Dominio
???   ????????? entities/              # Entidades de negocio
???   ???   ????????? User.ts           # Entidad Usuario
???   ???   ????????? Assessment.ts     # Entidad Evaluaci??n
???   ???   ????????? Admin.ts          # Entidad Administrador
???   ????????? interfaces/           # Contratos y abstracciones
???       ????????? repositories/     # Interfaces de repositorio
???       ????????? common/          # Tipos comunes
????????? application/              # Capa de Aplicaci??n
???   ????????? usecases/            # Casos de uso
???   ???   ????????? AuthUseCases.ts  # Casos de uso de autenticaci??n
???   ???   ????????? UserUseCases.ts  # Casos de uso de usuarios
???   ???   ????????? AssessmentUseCases.ts # Casos de uso de evaluaciones
???   ????????? dto/                 # DTOs de aplicaci??n
????????? infrastructure/          # Capa de Infraestructura
???   ????????? firebase/           # Configuraci??n Firebase
???   ????????? repositories/       # Implementaciones de repositorio
???   ????????? http/              # Clientes HTTP
????????? presentation/           # Capa de Presentaci??n
    ????????? components/         # Componentes React
    ????????? pages/             # P??ginas principales
    ????????? hooks/             # Custom hooks
```

### Casos de Uso Implementados

#### Autenticaci??n
```typescript
// Login de usuario
const loginResult = await authUseCases.login(email, password);

// Registro de usuario
const registerResult = await authUseCases.register(userData);

// Logout
await authUseCases.logout();
```

#### Gesti??n de Evaluaciones
```typescript
// Crear evaluaci??n
const assessment = await assessmentUseCases.create(assessmentData);

// Obtener evaluaciones
const assessments = await assessmentUseCases.getAll();

// Evaluar respuestas
const result = await assessmentUseCases.evaluate(answers);
```

#### Administraci??n
```typescript
// Dashboard de estad??sticas
const stats = await adminUseCases.getDashboardStats();

// Gesti??n de usuarios
const users = await adminUseCases.getUsers();
```

## Instalaci??n

### Prerrequisitos

- Node.js >= 16.0.0
- npm >= 8.0.0 o yarn >= 1.22.0
- Cuenta de Firebase

### Configuraci??n

```bash
# Clonar repositorio
git clone https://github.com/Yop007N/merre-data-platform.git
cd merre-data-platform

# Instalar dependencias
npm install

# Configurar Firebase
cp .env.example .env
# Editar .env con las credenciales de Firebase

# Iniciar aplicaci??n
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

## Configuraci??n de Firebase

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

### Autenticaci??n

```typescript
// Hook de autenticaci??n
const { user, login, logout, loading } = useAuth();

// Componente protegido
function ProtectedComponent() {
  if (!user) return <LoginForm />;
  return <Dashboard />;
}
```

### Formularios

```typescript
// Formulario con validaci??n
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

### Gesti??n de Estado

```typescript
// Context para estado global
const { assessments, loading, error } = useAssessments();

// Actualizaci??n de estado
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

# Tests espec??ficos
npm test -- --testNamePattern="AuthUseCases"
```

### Estructura de Tests

```
src/
????????? __tests__/
???   ????????? components/
???   ????????? usecases/
???   ????????? utils/
????????? setupTests.js
```

## Scripts Disponibles

```bash
npm start            # Ejecutar en desarrollo
npm run build        # Build de producci??n
npm test             # Ejecutar tests
npm run eject        # Ejectar de CRA (no recomendado)
```

## Estructura de Componentes

### Componentes Principales

- **LoginForm** - Formulario de autenticaci??n
- **Dashboard** - Panel principal de usuario
- **AssessmentList** - Lista de evaluaciones
- **AssessmentForm** - Formulario de evaluaci??n
- **ResultsView** - Visualizaci??n de resultados
- **AdminPanel** - Panel de administraci??n

### Componentes Reutilizables

- **Card** - Componente de tarjeta
- **Button** - Bot??n personalizado
- **Input** - Campo de entrada
- **Modal** - Ventana modal
- **Loading** - Indicador de carga

## Deployment

### Build de Producci??n

```bash
# Generar build optimizado
npm run build

# Los archivos se generan en /build
build/
????????? static/
???   ????????? css/
???   ????????? js/
????????? index.html
????????? manifest.json
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

## Contribuci??n

### Gu??as de Desarrollo

1. Seguir principios de Clean Architecture
2. Usar TypeScript estricto
3. Escribir tests para componentes nuevos
4. Mantener consistencia en nomenclatura
5. Documentar componentes complejos

### Estructura de Commits

```
feat: nueva funcionalidad
fix: correcci??n de bug
docs: actualizaci??n de documentaci??n
style: cambios de formato
refactor: refactorizaci??n de c??digo
test: agregar o modificar tests
```

---

**Autor:** Enrique Bobadilla
**Versi??n:** 2.0.0
**??ltima actualizaci??n:** Diciembre 2024
