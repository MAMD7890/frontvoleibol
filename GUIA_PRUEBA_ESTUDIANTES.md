# Guía de Prueba del Componente de Estudiantes

## Requisitos Previos

1. **Backend corriendo en**: `http://localhost:8080`
2. **Angular corriendo en**: `http://localhost:4200` (o tu puerto configurado)
3. **Endpoints implementados en el backend**:
   - `GET /api/estudiantes`
   - `POST /api/estudiantes`
   - `PUT /api/estudiantes/{id}`
   - `DELETE /api/estudiantes/{id}`

## Pasos para Probar

### 1. Iniciar la Aplicación Angular

```bash
cd "C:\Users\Admin\Downloads\now-ui-dashboard-angular-master"
npm start
```

O si prefieres con ng:
```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

### 2. Navegar al Componente

1. Abre el dashboard en tu navegador
2. En el menú lateral izquierdo, busca "Estudiantes" 
3. Haz clic en la opción (tiene ícono de mortarboard)

### 3. Probar Listar Estudiantes

- **Esperado**: La tabla debe mostrar todos los estudiantes del API
- **Tabla visible con columnas**:
  - ID
  - Nombre Completo
  - Email
  - Campus/Sede
  - Teléfono
  - Acciones

### 4. Probar Crear Estudiante

1. Haz clic en el botón **"Crear Estudiante"** (arriba a la derecha)
2. Se abrirá un modal con un formulario vacío
3. Llena los campos obligatorios (*):
   - Nombre Completo: `Juan Pérez`
   - Número Documento: `1234567890`
   - Tipo Documento: `CC`
   - Fecha Nacimiento: `2005-05-15`
   - Sexo: `MASCULINO`
   - Email: `juan@example.com`
   - Celular: `3001234567` (exactamente 10 dígitos)
   - Dirección: `Calle 10 #20`
   - Barrio: `San Alonso`
   - Campus: Elige uno del dropdown
   - Institución: `Colegio Colombiano`
   - Jornada: `MAÑANA`
   - Grado: `10`
   - EPS: `Salud Total`
   - Nombre Tutor: `María García`
   - Parentesco: `Madre`
   - Documento Tutor: `987654321`
   - Teléfono Tutor: `3007654321`
   - Email Tutor: `maria@example.com`
   - Posición: `Colocador`
   - Nivel: `INTERMEDIO`
   - Dominancia: `DERECHA`
   - Tipo Sangre: `O+`
   - Nombre Camiseta: `Juan`
   - Número Camiseta: `10`
4. Haz clic en **"Crear"**
5. **Esperado**: Mensaje de éxito y tabla actualizada con el nuevo estudiante

### 5. Probar Editar Estudiante

1. En la tabla, busca un estudiante
2. Haz clic en el botón **azul de configuración** en la columna "Acciones"
3. Se abrirá el modal con los datos del estudiante pre-llenados
4. Modifica algunos campos (ej: nombre, email)
5. Haz clic en **"Actualizar"**
6. **Esperado**: Mensaje de éxito y tabla actualizada

### 6. Probar Eliminar Estudiante

1. En la tabla, busca un estudiante
2. Haz clic en el botón **rojo con X** en la columna "Acciones"
3. Se mostrará una confirmación: "¿Estás seguro de que deseas eliminar a [Nombre]?"
4. Haz clic en **"Aceptar"** en la confirmación
5. **Esperado**: Mensaje de éxito y estudiante eliminado de la tabla

## Validaciones a Probar

### Validación de Campos

1. **Nombre incorrecto**: 
   - Intenta dejar en blanco o con menos de 5 caracteres
   - **Esperado**: Mensaje de error rojo bajo el campo

2. **Email inválido**:
   - Intenta: `juanemail.com` (sin @)
   - **Esperado**: Campo resaltado en rojo

3. **Teléfono inválido**:
   - Intenta: `300` o `30012345678` (más de 10)
   - **Esperado**: Campo resaltado en rojo

4. **Documento inválido**:
   - Intenta: `ABC123` (solo números permitidos)
   - **Esperado**: Campo resaltado en rojo

### Validación del Formulario

1. Haz clic en **"Crear"** sin completar campos obligatorios
2. **Esperado**: Mensaje de advertencia "Por favor completa todos los campos correctamente"

## Responsive Design

### Prueba en Desktop
1. Abre en navegador normal
2. La tabla debe mostrar todas las columnas

### Prueba en Tablet
1. Abre DevTools (F12)
2. Selecciona vista responsive (768px de ancho)
3. La tabla debe ajustarse sin perder funcionalidad

### Prueba en Mobile
1. DevTools con ancho menor a 576px
2. Tabla se transforma en vista de tarjetas
3. Los botones deben ser accesibles

## Notificaciones

Deberías ver notificaciones `ngx-toastr` en la esquina superior derecha para:

- ✅ **Éxito (Verde)**: Cuando creas, editas o eliminas un estudiante
- ⚠️ **Advertencia (Amarillo)**: Cuando hay errores en validación
- ❌ **Error (Rojo)**: Cuando hay problemas con la API

## Solución de Problemas

### Tabla vacía
- **Problema**: La tabla no muestra estudiantes
- **Causa probable**: El backend no está corriendo o no hay datos
- **Solución**: 
  1. Verifica que el backend esté en `http://localhost:8080`
  2. Revisa la consola del navegador (F12) para ver errores HTTP
  3. Crea un estudiante nuevo

### Modal no abre
- **Problema**: Al hacer clic en "Crear" o "Editar" no aparece el modal
- **Causa probable**: Problema con ng-bootstrap
- **Solución**: Verifica que `NgbModule` esté importado en `admin-layout.module.ts`

### Validaciones no funcionan
- **Problema**: El formulario no valida campos
- **Causa probable**: ReactiveFormsModule no está importado
- **Solución**: Verifica que esté en `admin-layout.module.ts`

### Error "Cannot GET /api/estudiantes"
- **Problema**: Errores de CORS o endpoint no existe
- **Causa probable**: Backend no tiene los endpoints configurados
- **Solución**: Implementa los endpoints en tu backend Spring Boot

## Verificar en Consola del Navegador

Para debugging, abre F12 y ve a la pestaña "Network":

1. Cuando cargas la página de estudiantes, deberías ver:
   - `GET /api/estudiantes` → Status 200

2. Cuando creas un estudiante:
   - `POST /api/estudiantes` → Status 200 o 201

3. Cuando editas:
   - `PUT /api/estudiantes/{id}` → Status 200

4. Cuando eliminas:
   - `DELETE /api/estudiantes/{id}` → Status 204

## Características Adicionales Confirmadas

✅ Tabla responsiva
✅ Modal crear/editar
✅ Dropdown de sedes/campus
✅ Validaciones de formulario
✅ Notificaciones toastr
✅ Confirmación de eliminación
✅ Integración en menú lateral
✅ Estados de carga
✅ Mensaje cuando no hay datos
✅ Estilos responsive

## Notas Importantes

- El componente está completamente funcional con Bootstrap 4
- Los ícones usan la fuente `now-ui-icons` del dashboard
- Las validaciones se hacen en el cliente (Angular)
- El componente se comunica con el backend vía HTTP
- No se almacenan datos localmente (todo viene del API)
