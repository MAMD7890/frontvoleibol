# 🧪 Guía de Pruebas CRUD - Componente Profesores

## Requisitos Previos
- ✅ Backend Spring Boot ejecutándose en `http://localhost:8080`
- ✅ Frontend Angular ejecutándose en `http://localhost:4200`
- ✅ Componente ProfesoresComponent integrado

## 📱 Acceso al Componente

**URL**: `http://localhost:4200/admin/profesores`

O desde el menú lateral → "Profesores"

---

## ✅ PRUEBA 1: READ (Leer/Listar)

### Objetivo
Verificar que se carga la lista de profesores correctamente del API

### Pasos
1. Navega a `http://localhost:4200/admin/profesores`
2. Observa la tabla cargando (spinner visible)
3. Espera a que cargue completamente

### Resultados Esperados
- ✅ La tabla muestra los profesores existentes
- ✅ Se muestran 6 columnas: #, Nombre, Documento, Teléfono, Salario/Clase, Estado, Acciones
- ✅ Los datos coinciden con el backend
- ✅ El estado muestra badges (Activo=verde, Inactivo=rojo)
- ✅ Si no hay profesores, muestra mensaje "No hay profesores registrados"

### URL de la API Consumida
```
GET http://localhost:8080/api/profesores
```

---

## ➕ PRUEBA 2: CREATE (Crear)

### Objetivo
Crear un nuevo profesor mediante el formulario

### Pasos
1. En la tabla, haz click en botón azul "Crear Profesor" (esquina superior derecha)
2. Completa el formulario con:
   - **Nombre**: "Juan Pérez García"
   - **Documento**: "987654321"
   - **Teléfono**: "3109876543"
   - **Salario por Clase**: "45000"
   - **URL de Foto**: (opcional) "https://example.com/juan.jpg"
   - **Nombre de Foto**: (opcional) "juan.jpg"
   - **Estado**: Activo (checkbox marcado)
3. Haz click en botón "Crear"

### Resultados Esperados
- ✅ Se muestra toast de éxito: "Profesor creado exitosamente"
- ✅ Modal se cierra automáticamente
- ✅ La tabla se recarga
- ✅ Nuevo profesor aparece en la lista
- ✅ Se enviaron datos correctamente al API

### URL de la API Consumida
```
POST http://localhost:8080/api/profesores
```

### JSON Enviado (Ejemplo)
```json
{
  "nombre": "Juan Pérez García",
  "documento": "987654321",
  "telefono": "3109876543",
  "salarioPorClase": 45000,
  "fotoUrl": "https://example.com/juan.jpg",
  "fotoNombre": "juan.jpg",
  "estado": true
}
```

### Validaciones a Probar
- ✗ Intenta enviar sin llenar campo "Nombre" → Botón "Crear" debe estar deshabilitado
- ✗ Intenta llenar "Documento" con letras → Debe mostrar error
- ✗ Intenta llenar "Teléfono" con menos de 7 dígitos → Debe mostrar error

---

## ✏️ PRUEBA 3: UPDATE (Actualizar)

### Objetivo
Editar un profesor existente

### Pasos
1. En la tabla, haz click en el botón azul (engranaje) de cualquier profesor
2. Cambia algunos datos, por ejemplo:
   - **Nombre**: Agrega " (Actualizado)"
   - **Salario**: Aumenta en 10000
3. Haz click en "Actualizar"

### Resultados Esperados
- ✅ Se muestra toast de éxito: "Profesor actualizado exitosamente"
- ✅ Modal se cierra automáticamente
- ✅ La tabla se recarga
- ✅ Los datos del profesor están actualizados en la tabla
- ✅ Los cambios se reflejan en la base de datos

### URL de la API Consumida
```
PUT http://localhost:8080/api/profesores/{id}
```

### JSON Enviado (Ejemplo)
```json
{
  "nombre": "Juan Pérez García (Actualizado)",
  "documento": "987654321",
  "telefono": "3109876543",
  "salarioPorClase": 55000,
  "fotoUrl": "https://example.com/juan.jpg",
  "fotoNombre": "juan.jpg",
  "estado": true
}
```

---

## 🗑️ PRUEBA 4: DELETE (Eliminar)

### Objetivo
Eliminar un profesor de la base de datos

### Pasos
1. En la tabla, haz click en el botón rojo (X) de un profesor que acabas de crear
2. Se abre modal de confirmación con el nombre del profesor
3. Haz click en botón "Eliminar"

### Resultados Esperados
- ✅ Se muestra toast de éxito: "Profesor eliminado exitosamente"
- ✅ Modal se cierra automáticamente
- ✅ La tabla se recarga
- ✅ El profesor ya no aparece en la lista
- ✅ El registro se eliminó de la base de datos

### URL de la API Consumida
```
DELETE http://localhost:8080/api/profesores/{id}
```

---

## 🔄 CICLO COMPLETO DE PRUEBA

Para una verificación integral, sigue este orden:

### 1️⃣ Carga Inicial (READ)
```
✅ Accede a /admin/profesores
✅ Verifica que se carguen los profesores existentes
```

### 2️⃣ Crear Profesor (CREATE)
```
✅ Click "Crear Profesor"
✅ Completa formulario con:
   - Nombre: "Profesor Test 1"
   - Documento: "1111111111"
   - Teléfono: "3001111111"
   - Salario: "50000"
   - Estado: Activo
✅ Haz click "Crear"
✅ Verifica que aparece en la tabla
```

### 3️⃣ Editar Profesor (UPDATE)
```
✅ Busca "Profesor Test 1" en la tabla
✅ Haz click en botón azul (editar)
✅ Cambia nombre a "Profesor Test 1 - Actualizado"
✅ Cambia salario a "60000"
✅ Haz click "Actualizar"
✅ Verifica cambios en la tabla
```

### 4️⃣ Eliminar Profesor (DELETE)
```
✅ Busca "Profesor Test 1 - Actualizado"
✅ Haz click en botón rojo (eliminar)
✅ Confirma eliminación
✅ Verifica que desaparece de la tabla
```

---

## 🐛 Depuración

Si algo no funciona, revisa:

### Consola del Navegador (F12)
```
1. Abre DevTools (F12)
2. Ve a "Console"
3. Verifica si hay errores en rojo
4. Mira los logs de la aplicación
```

### Network (Pestaña Network en DevTools)
```
1. Abre DevTools (F12)
2. Ve a "Network"
3. Realiza una acción (crear, editar, eliminar)
4. Verifica que se envíe la solicitud HTTP correcta:
   - GET /api/profesores (carga)
   - POST /api/profesores (crear)
   - PUT /api/profesores/{id} (actualizar)
   - DELETE /api/profesores/{id} (eliminar)
5. Verifica el Status Code:
   - 200 OK (éxito)
   - 404 Not Found (recurso no existe)
   - 500 Server Error (error del backend)
```

### Validación del Backend
```
1. Verifica que el backend esté ejecutándose: http://localhost:8080
2. Revisa los logs del backend
3. Verifica la base de datos directamente
```

---

## ✨ Casos de Prueba Adicionales

### Test 1: Validaciones del Formulario
```
□ Campo Nombre vacío → No permitir crear
□ Campo Documento con letras → Mostrar error
□ Campo Teléfono con menos de 7 dígitos → Mostrar error
□ Campo Salario con valor negativo → Mostrar error
```

### Test 2: Modales
```
□ Click "Crear" abre modal con campos vacíos
□ Click "Editar" abre modal con datos precargados
□ Click "Eliminar" abre modal de confirmación con nombre
□ Click "Cancelar" cierra modal sin guardar cambios
□ Click afuera del modal → No cierra (backdrop static)
```

### Test 3: Responsividad
```
□ Tabla se visualiza bien en computadora
□ Tabla se adapta en tablet
□ Tabla se adapta en celular
□ Botones son accesibles en todos los tamaños
```

### Test 4: Manejo de Errores
```
□ Si el backend no responde → Mostrar error en toast
□ Si la creación falla → Mostrar error específico
□ Si la actualización falla → Mostrar error específico
□ Si la eliminación falla → Mostrar error específico
```

---

## 📊 Matriz de Pruebas

| Funcionalidad | Método | Endpoint | Status Esperado | Resultado |
|--------------|--------|----------|-----------------|-----------|
| Listar | GET | `/api/profesores` | 200 | ✅ |
| Crear | POST | `/api/profesores` | 201 | ✅ |
| Obtener por ID | GET | `/api/profesores/{id}` | 200 | ✅ |
| Actualizar | PUT | `/api/profesores/{id}` | 200 | ✅ |
| Eliminar | DELETE | `/api/profesores/{id}` | 204 | ✅ |
| Obtener Activos | GET | `/api/profesores/activos/lista` | 200 | ✅ |
| Desactivar | PATCH | `/api/profesores/{id}/desactivar` | 200 | ✅ |

---

## 📝 Registro de Pruebas

**Fecha**: ___________
**Probador**: ___________
**Versión del Componente**: 1.0

| Test | Resultado | Notas |
|------|-----------|-------|
| READ - Listar profesores | ✅ / ❌ | |
| CREATE - Crear profesor | ✅ / ❌ | |
| UPDATE - Actualizar profesor | ✅ / ❌ | |
| DELETE - Eliminar profesor | ✅ / ❌ | |
| Validaciones | ✅ / ❌ | |
| Responsividad | ✅ / ❌ | |
| Manejo de errores | ✅ / ❌ | |

---

## 🎯 Conclusión

Si todas las pruebas marcan ✅, el componente está 100% funcional y listo para producción.

**Estado Final**: [ ] APROBADO [ ] RECHAZADO
