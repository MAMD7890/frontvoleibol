# Componente Profesores - Guía Completa

## 📋 Resumen
Se ha creado un componente completo para la gestión de profesores con las siguientes características:
- Tabla responsiva con 6 columnas
- CRUD completo (Create, Read, Update, Delete)
- Modales para crear, editar y eliminar
- Validación de formularios
- Integración con API REST

## 📂 Archivos Creados/Modificados

### 1. **Servicio: `profesor.service.ts`**
```
src/app/services/profesor.service.ts
```
**Descripción**: Servicio que consume la API REST de profesores

**Métodos principales**:
- `obtenerProfesores()`: GET `/api/profesores` - Obtiene todos los profesores
- `obtenerProfesorPorId(id)`: GET `/api/profesores/{id}` - Obtiene un profesor específico
- `obtenerActivos()`: GET `/api/profesores/activos/lista` - Obtiene profesores activos
- `crearProfesor(profesor)`: POST `/api/profesores` - Crea un nuevo profesor
- `actualizarProfesor(id, profesor)`: PUT `/api/profesores/{id}` - Actualiza un profesor
- `eliminarProfesor(id)`: DELETE `/api/profesores/{id}` - Elimina un profesor
- `desactivarProfesor(id)`: PATCH `/api/profesores/{id}/desactivar` - Desactiva un profesor

**Interfaz Profesor**:
```typescript
export interface Profesor {
  id?: number;
  nombre: string;
  documento: string;
  telefono: string;
  salarioPorClase: number;
  fotoUrl: string;
  fotoNombre: string;
  estado: boolean;
}
```

### 2. **Componente TS: `profesores.component.ts`**
```
src/app/profesores/profesores.component.ts
```
**Descripción**: Lógica del componente de gestión de profesores

**Propiedades principales**:
- `profesores[]`: Array de profesores cargados
- `formulario`: FormGroup para crear/editar
- `editando`: Boolean indicando si se está editando
- `profesorIdEditando`: ID del profesor en edición
- `profesorIdAEliminar`: ID del profesor a eliminar
- `cargando`: Estado de carga

**Métodos principales**:
- `cargarProfesores()`: Carga la lista de profesores desde el API
- `crearFormulario()`: Crea el formulario reactivo con validaciones
- `abrirModalCrear()`: Abre modal para crear nuevo profesor
- `abrirModalEditar(profesor)`: Abre modal para editar un profesor
- `guardarProfesor()`: Guarda (crea o actualiza) un profesor
- `crearProfesor()`: Hace POST al API
- `actualizarProfesor()`: Hace PUT al API
- `eliminarProfesor(id, nombre)`: Abre modal de confirmación
- `confirmarEliminar()`: Hace DELETE al API
- `cerrarModal()`: Cierra modales y resetea formulario

**Validaciones en el formulario**:
- **nombre**: Requerido, mínimo 3 caracteres
- **documento**: Requerido, solo números
- **telefono**: Requerido, mínimo 7 dígitos
- **salarioPorClase**: Requerido, mayor a 0
- **fotoUrl**: Opcional
- **fotoNombre**: Opcional
- **estado**: Booleano (Activo/Inactivo)

### 3. **Componente HTML: `profesores.component.html`**
```
src/app/profesores/profesores.component.html
```
**Descripción**: Template del componente

**Secciones**:
1. **Header**: Título "Gestión de Profesores" + botón crear
2. **Tabla**: 
   - Columna #: Número secuencial
   - Nombre: Nombre del profesor
   - Documento: Número de documento
   - Teléfono: Número de teléfono
   - Salario/Clase: Salario formateado como moneda
   - Estado: Badge (Activo/Inactivo)
   - Acciones: Botones editar y eliminar

3. **Modal Crear/Editar**:
   - Campos: nombre, documento, teléfono, salarioPorClase, fotoUrl, fotoNombre, estado
   - Validación en tiempo real
   - Botones: Cancelar, Guardar/Actualizar

4. **Modal Confirmación**:
   - Mensaje personalizado
   - Botones: Cancelar, Eliminar

### 4. **Componente CSS: `profesores.component.css`**
```
src/app/profesores/profesores.component.css
```
**Características**:
- Tabla responsiva
- Estilos para modales
- Estilos para formularios
- Badges para estado (Activo/Inactivo)
- Botones con colores temáticos
- Media queries para dispositivos móviles

### 5. **Spec del Componente: `profesores.component.spec.ts`**
```
src/app/profesores/profesores.component.spec.ts
```
Archivo de pruebas unitarias

## 🔌 Integración en el módulo

### Modificación en `admin-layout.module.ts`:
```typescript
import { ProfesoresComponent } from '../../profesores/profesores.component';

@NgModule({
  declarations: [
    // ... otros componentes
    ProfesoresComponent
  ],
  // ...
})
```

### Modificación en `admin-layout.routing.ts`:
```typescript
import { ProfesoresComponent } from '../../profesores/profesores.component';

export const AdminLayoutRoutes: Routes = [
  // ... otras rutas
  { path: 'profesores', component: ProfesoresComponent }
];
```

### Modificación en `sidebar.component.ts`:
```typescript
{ path: '/profesores', title: 'Profesores', icon:'education_hat', class: '' }
```

## 🧪 Cómo Usar

### 1. **Listar Profesores**
- La tabla se carga automáticamente al iniciar el componente
- Se obtienen los datos de `http://localhost:8080/api/profesores`

### 2. **Crear Profesor**
- Click en botón "Crear Profesor" (arriba a la derecha)
- Completa los campos del formulario
- Click en "Crear"
- Se enviará POST a `http://localhost:8080/api/profesores`

**Ejemplo de JSON a enviar**:
```json
{
  "nombre": "Carlos García López",
  "documento": "1023456789",
  "telefono": "3105551234",
  "salarioPorClase": 50000.00,
  "fotoUrl": "https://example.com/profesor-carlos.jpg",
  "fotoNombre": "profesor-carlos.jpg",
  "estado": true
}
```

### 3. **Editar Profesor**
- Click en botón azul (engranaje) en la columna Acciones
- Se abre el modal con los datos precargados
- Modifica los campos necesarios
- Click en "Actualizar"
- Se enviará PUT a `http://localhost:8080/api/profesores/{id}`

### 4. **Eliminar Profesor**
- Click en botón rojo (X) en la columna Acciones
- Se abre modal de confirmación
- Confirma con botón "Eliminar"
- Se enviará DELETE a `http://localhost:8080/api/profesores/{id}`

## 🌐 Navegación

Para acceder al componente:
1. Desde el menú lateral, busca "Profesores"
2. O navega a `http://localhost:4200/admin/profesores`

## ✅ Validaciones

El formulario incluye validaciones para:
- **Nombre**: Requerido, mínimo 3 caracteres
- **Documento**: Requerido, solo números
- **Teléfono**: Requerido, solo números (mínimo 7)
- **Salario**: Requerido, mayor a 0

Los botones de "Guardar/Actualizar" se deshabilitan mientras el formulario sea inválido.

## 🎨 Funcionalidades Visuales

- **Tabla Responsiva**: Se adapta a dispositivos móviles
- **Estados**: Badges de color para Activo (verde) e Inactivo (rojo)
- **Spinner**: Indicador de carga mientras se obtienen los datos
- **Toasts**: Mensajes de éxito/error automáticos
- **Modales**: Bootstrap modales con estilos personalizados

## ⚙️ Dependencias Utilizadas

- **Angular**: Core framework
- **NgBootstrap**: Modales, formularios
- **Reactive Forms**: Validación reactiva
- **NgxToastr**: Notificaciones
- **HttpClient**: Consumo de API

## 📝 Notas Importantes

1. El servicio está configurado para conectar a `http://localhost:8080/api/profesores`
2. Asegúrate de que el backend esté ejecutándose en ese puerto
3. Si necesitas cambiar el URL base, modifica la propiedad `apiUrl` en `profesor.service.ts`
4. Todos los botones tienen iconos de la librería Now UI Dashboard

## 🚀 Próximos Pasos

Para mejorar el componente puedes:
1. Agregar paginación a la tabla
2. Agregar búsqueda/filtrado
3. Agregar ordenamiento de columnas
4. Exportar datos a CSV/Excel
5. Agregar más validaciones personalizadas
