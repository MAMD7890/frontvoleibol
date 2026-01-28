# Componente de Gestión de Estudiantes

## Descripción
Componente Angular completo para la gestión de estudiantes de voleibol con capacidades CRUD (Crear, Leer, Actualizar, Eliminar).

## Características

### Tabla Responsiva
- **Columnas mostradas** (máximo 6 - más representativas):
  1. ID del Estudiante
  2. Nombre Completo
  3. Email
  4. Campus/Sede
  5. Teléfono
  6. Acciones (Editar/Eliminar)

- **Responsiva**: Se adapta automáticamente a dispositivos móviles
- **Hover effect**: Filas se resaltan al pasar el mouse
- **Loading state**: Muestra indicador de carga mientras se obtienen datos
- **Empty state**: Mensaje cuando no hay datos

### Funcionalidades

#### 1. Listar Estudiantes
- Consulta el endpoint: `GET http://localhost:8080/api/estudiantes`
- Muestra los datos en una tabla responsiva

#### 2. Crear Estudiante
- Botón "Crear Estudiante" en la parte superior derecha
- Modal con formulario completo
- Campos validados (email, teléfono, documento, etc.)
- Envía datos a: `POST http://localhost:8080/api/estudiantes`

#### 3. Editar Estudiante
- Botón "Ver Detalles" (ícono de configuración)
- Abre modal con los datos del estudiante
- Permite actualizar todos los campos
- Incluye selector de Campus/Sede
- Envía actualización a: `PUT http://localhost:8080/api/estudiantes/{id}`

#### 4. Eliminar Estudiante
- Botón "Eliminar" (ícono X rojo)
- Pide confirmación antes de eliminar
- Envía solicitud a: `DELETE http://localhost:8080/api/estudiantes/{id}`

### Campos del Formulario

El formulario está organizado en secciones:

1. **Información Personal**
   - Nombre Completo
   - Tipo de Documento (CC, CE, TI, PA)
   - Número de Documento
   - Fecha de Nacimiento
   - Sexo (Masculino/Femenino)

2. **Contacto**
   - Email
   - Celular
   - Dirección de Residencia
   - Barrio

3. **Educación**
   - Campus/Sede (dropdown con opciones)
   - Institución Educativa
   - Jornada (Mañana/Tarde/Noche)
   - Grado Actual
   - EPS

4. **Información del Tutor**
   - Nombre Tutor
   - Parentesco (Padre/Madre/Abuelo/Otro)
   - Documento Tutor
   - Teléfono Tutor
   - Email Tutor

5. **Información Deportiva**
   - Posición Preferida (Colocador/Pasador/Rematador/Líbero/Central)
   - Nivel Actual (Principiante/Intermedio/Avanzado)
   - Dominancia (Derecha/Izquierda/Ambas)
   - Tipo Sangre
   - Nombre Camiseta
   - Número Camiseta

6. **Estado**
   - Checkbox para activar/desactivar estudiante

### Validaciones
- Nombre completo: mínimo 5 caracteres
- Documento y teléfono: solo números
- Teléfono: exactamente 10 dígitos
- Email: formato válido
- Grado actual: entre 1 y 11
- Número camiseta: entre 0 y 99
- Campos obligatorios marcados con *

### Notificaciones
Utiliza `ngx-toastr` para mostrar mensajes:
- ✓ Éxito: Cuando se crea, edita o elimina un estudiante
- ⚠ Advertencia: Cuando hay errores en validación
- ✗ Error: Cuando hay problemas con la API

## Estructura del Componente

```
src/app/
├── students/
│   ├── students.component.ts        (Lógica del componente)
│   ├── students.component.html      (Template con tabla y modal)
│   └── students.component.css       (Estilos responsivos)
├── services/
│   └── estudiante.service.ts        (Servicio HTTP)
```

## Servicio HTTP

El servicio `EstudianteService` incluye métodos para:

```typescript
// Obtener todos los estudiantes
obtenerEstudiantes(): Observable<Estudiante[]>

// Obtener un estudiante específico
obtenerEstudiante(id: number): Observable<Estudiante>

// Crear un nuevo estudiante
crearEstudiante(estudiante: Estudiante): Observable<Estudiante>

// Actualizar un estudiante
actualizarEstudiante(id: number, estudiante: Estudiante): Observable<Estudiante>

// Eliminar un estudiante
eliminarEstudiante(id: number): Observable<any>
```

## Integración en el Menú Lateral

El componente ya está integrado en el menú lateral con:
- **Ruta**: `/students`
- **Título**: "Estudiantes"
- **Ícono**: `education_hat`

## Dependencias Requeridas

Las siguientes dependencias ya están incluidas en el proyecto:

- `@angular/forms` - Para ReactiveFormsModule
- `@ng-bootstrap/ng-bootstrap` - Para modales
- `ngx-toastr` - Para notificaciones
- `@angular/common/http` - Para HttpClient

## Modelos TypeScript

### Estudiante
Contiene todos los campos necesarios según el JSON proporcionado.

### Sede
Estructura para almacenar información del campus:
- idSede
- nombreSede
- direccion
- ciudad

### Sedes Predefinidas
El componente incluye 3 sedes:
1. Sede Principal (Bogotá)
2. Sede Medellín
3. Sede Cali

## Ejemplo de Uso

1. **Navega a la sección de Estudiantes** desde el menú lateral
2. **Ver tabla de estudiantes** cargados del API
3. **Crear nuevo**: Haz clic en "Crear Estudiante"
4. **Editar**: Haz clic en el botón de configuración en la fila
5. **Eliminar**: Haz clic en el botón X y confirma

## Configuración del Backend

El componente espera un backend en `http://localhost:8080` con los siguientes endpoints:

```
GET    /api/estudiantes          - Listar todos
GET    /api/estudiantes/{id}     - Obtener uno
POST   /api/estudiantes          - Crear
PUT    /api/estudiantes/{id}     - Actualizar
DELETE /api/estudiantes/{id}     - Eliminar
```

## Responsive Design

- **Desktop** (>768px): Tabla con columnas visibles
- **Tablet** (576px-768px): Ajustes de tamaño y espacios
- **Mobile** (<576px): Tabla se convierte a vista de tarjetas

## Mejoras Futuras

- [ ] Paginación en la tabla
- [ ] Búsqueda y filtros
- [ ] Exportar a Excel/PDF
- [ ] Importar datos
- [ ] Fotos de perfil
- [ ] Validaciones adicionales de negocio
- [ ] Historial de cambios
