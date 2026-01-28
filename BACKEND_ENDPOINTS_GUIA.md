# Configuración del Backend - Endpoints Esperados

## Descripción

Este documento describe los endpoints REST que el componente Angular de estudiantes espera del backend.

## Base URL

```
http://localhost:8080/api/estudiantes
```

## Endpoints Requeridos

### 1. Obtener Todos los Estudiantes

**Endpoint:**
```
GET /api/estudiantes
```

**Descripción:** Obtiene la lista completa de todos los estudiantes registrados.

**Respuesta (200 OK):**
```json
[
  {
    "idEstudiante": 1,
    "nombreCompleto": "Juan Carlos López García",
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    "fechaNacimiento": "2008-05-15",
    "edad": 16,
    "sexo": "MASCULINO",
    "direccionResidencia": "Calle 10 #20-30",
    "barrio": "San Alonso",
    "celularEstudiante": "3001234567",
    "whatsappEstudiante": "3001234567",
    "correoEstudiante": "juan.lopez@email.com",
    "sede": {
      "idSede": 1,
      "nombreSede": "Sede Principal",
      "direccion": "Cra 5 #10-20",
      "ciudad": "Bogotá"
    },
    "nombreTutor": "María García López",
    "parentescoTutor": "Madre",
    "documentoTutor": "987654321",
    "telefonoTutor": "3007654321",
    "correoTutor": "maria.garcia@email.com",
    "ocupacionTutor": "Ingeniera",
    "institucionEducativa": "Colegio Nacional José María",
    "jornada": "MAÑANA",
    "gradoActual": 10,
    "eps": "Salud Total",
    "tipoSangre": "O+",
    "alergias": "Alergia a la penicilina",
    "enfermedadesCondiciones": "Asma alérgica",
    "medicamentos": "Salbutamol",
    "certificadoMedicoDeportivo": true,
    "diaPagoMes": 5,
    "nombreEmergencia": "Rosa López García",
    "telefonoEmergencia": "3009876543",
    "parentescoEmergencia": "Tía",
    "ocupacionEmergencia": "Docente",
    "correoEmergencia": "rosa.lopez@email.com",
    "pertenecelgbtiq": false,
    "personaDiscapacidad": false,
    "condicionDiscapacidad": null,
    "migranteRefugiado": false,
    "poblacionEtnica": "Mestizo",
    "religion": "Católica",
    "experienciaVoleibol": "2 años en club juvenil",
    "otrasDisciplinas": "Fútbol",
    "posicionPreferida": "Colocador",
    "dominancia": "DERECHA",
    "nivelActual": "INTERMEDIO",
    "clubesAnteriores": "Volei Club Bogotá",
    "aceptaConsentimiento": true,
    "firmaDigital": "https://...",
    "fechaDiligenciamiento": "2024-01-15",
    "nombreCamiseta": "Juan López",
    "numeroCamiseta": 10,
    "fotoUrl": "https://...",
    "fotoNombre": "juan_lopez.jpg",
    "estado": true
  }
]
```

---

### 2. Obtener un Estudiante Específico

**Endpoint:**
```
GET /api/estudiantes/{id}
```

**Parámetro:**
- `id` (path) - ID del estudiante (número entero)

**Respuesta (200 OK):**
```json
{
  "idEstudiante": 1,
  "nombreCompleto": "Juan Carlos López García",
  // ... resto de campos igual al endpoint anterior
}
```

**Errores:**
- `404 NOT FOUND` - Si el estudiante no existe

---

### 3. Crear un Nuevo Estudiante

**Endpoint:**
```
POST /api/estudiantes
```

**Content-Type:** `application/json`

**Body (Request):**
```json
{
  "nombreCompleto": "Juan Pérez Rodríguez",
  "tipoDocumento": "CC",
  "numeroDocumento": "1234567890",
  "fechaNacimiento": "2008-05-15",
  "edad": 16,
  "sexo": "MASCULINO",
  "direccionResidencia": "Calle 10 #20-30",
  "barrio": "San Alonso",
  "celularEstudiante": "3001234567",
  "whatsappEstudiante": "3001234567",
  "correoEstudiante": "juan@email.com",
  "sede": {
    "idSede": 1,
    "nombreSede": "Sede Principal",
    "direccion": "Cra 5 #10-20",
    "ciudad": "Bogotá"
  },
  "nombreTutor": "María García López",
  "parentescoTutor": "Madre",
  "documentoTutor": "987654321",
  "telefonoTutor": "3007654321",
  "correoTutor": "maria@email.com",
  "ocupacionTutor": "Ingeniera",
  "institucionEducativa": "Colegio Nacional",
  "jornada": "MAÑANA",
  "gradoActual": 10,
  "eps": "Salud Total",
  "tipoSangre": "O+",
  "alergias": null,
  "enfermedadesCondiciones": null,
  "medicamentos": null,
  "certificadoMedicoDeportivo": true,
  "diaPagoMes": 5,
  "nombreEmergencia": "Rosa López García",
  "telefonoEmergencia": "3009876543",
  "parentescoEmergencia": "Tía",
  "ocupacionEmergencia": "Docente",
  "correoEmergencia": "rosa@email.com",
  "pertenecelgbtiq": false,
  "personaDiscapacidad": false,
  "condicionDiscapacidad": null,
  "migranteRefugiado": false,
  "poblacionEtnica": "Mestizo",
  "religion": "Católica",
  "experienciaVoleibol": "0 años",
  "otrasDisciplinas": "Ninguna",
  "posicionPreferida": "Colocador",
  "dominancia": "DERECHA",
  "nivelActual": "INTERMEDIO",
  "clubesAnteriores": "Ninguno",
  "aceptaConsentimiento": true,
  "firmaDigital": null,
  "fechaDiligenciamiento": "2024-01-15",
  "nombreCamiseta": "Juan",
  "numeroCamiseta": 10,
  "fotoUrl": null,
  "fotoNombre": null,
  "estado": true
}
```

**Respuesta (201 CREATED):**
```json
{
  "idEstudiante": 3,
  "nombreCompleto": "Juan Pérez Rodríguez",
  // ... resto de campos
}
```

**Notas:**
- El `idEstudiante` se genera automáticamente en el backend
- Se debe devolver el objeto creado con el nuevo ID

---

### 4. Actualizar un Estudiante

**Endpoint:**
```
PUT /api/estudiantes/{id}
```

**Parámetro:**
- `id` (path) - ID del estudiante a actualizar

**Content-Type:** `application/json`

**Body (Request):**
```json
{
  "nombreCompleto": "Juan Pérez Rodríguez ACTUALIZADO",
  "tipoDocumento": "CC",
  "numeroDocumento": "1234567890",
  "fechaNacimiento": "2008-05-15",
  "edad": 16,
  "sexo": "MASCULINO",
  "direccionResidencia": "Calle 10 #20-30",
  "barrio": "San Alonso",
  "celularEstudiante": "3001234567",
  "whatsappEstudiante": "3001234567",
  "correoEstudiante": "juanactualizado@email.com",
  "sede": {
    "idSede": 2,
    "nombreSede": "Sede Medellín",
    "direccion": "Cra 50 #30-45",
    "ciudad": "Medellín"
  },
  "nombreTutor": "María García López",
  "parentescoTutor": "Madre",
  "documentoTutor": "987654321",
  "telefonoTutor": "3007654321",
  "correoTutor": "maria@email.com",
  "ocupacionTutor": "Ingeniera",
  "institucionEducativa": "Colegio Nacional",
  "jornada": "MAÑANA",
  "gradoActual": 10,
  "eps": "Salud Total",
  "tipoSangre": "O+",
  "alergias": null,
  "enfermedadesCondiciones": null,
  "medicamentos": null,
  "certificadoMedicoDeportivo": true,
  "diaPagoMes": 5,
  "nombreEmergencia": "Rosa López García",
  "telefonoEmergencia": "3009876543",
  "parentescoEmergencia": "Tía",
  "ocupacionEmergencia": "Docente",
  "correoEmergencia": "rosa@email.com",
  "pertenecelgbtiq": false,
  "personaDiscapacidad": false,
  "condicionDiscapacidad": null,
  "migranteRefugiado": false,
  "poblacionEtnica": "Mestizo",
  "religion": "Católica",
  "experienciaVoleibol": "0 años",
  "otrasDisciplinas": "Ninguna",
  "posicionPreferida": "Colocador",
  "dominancia": "DERECHA",
  "nivelActual": "INTERMEDIO",
  "clubesAnteriores": "Ninguno",
  "aceptaConsentimiento": true,
  "firmaDigital": null,
  "fechaDiligenciamiento": "2024-01-15",
  "nombreCamiseta": "Juan",
  "numeroCamiseta": 15,
  "fotoUrl": null,
  "fotoNombre": null,
  "estado": true
}
```

**Respuesta (200 OK):**
```json
{
  "idEstudiante": 3,
  "nombreCompleto": "Juan Pérez Rodríguez ACTUALIZADO",
  // ... resto de campos actualizados
}
```

**Errores:**
- `404 NOT FOUND` - Si el estudiante no existe
- `400 BAD REQUEST` - Si los datos son inválidos

---

### 5. Eliminar un Estudiante

**Endpoint:**
```
DELETE /api/estudiantes/{id}
```

**Parámetro:**
- `id` (path) - ID del estudiante a eliminar

**Respuesta (204 NO CONTENT):**
```
(sin body)
```

**Errores:**
- `404 NOT FOUND` - Si el estudiante no existe

---

## Configuración CORS

Si el frontend y backend están en puertos diferentes, necesitas configurar CORS en Spring Boot:

### Opción 1: Anotación en Controller

```java
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/estudiantes")
public class EstudianteController {
    // ...
}
```

### Opción 2: Configuración Global

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:4200")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*");
    }
}
```

---

## Validaciones Esperadas

El backend debe validar:

1. **Documento**: No puede estar vacío, debe ser único
2. **Email**: Formato válido, debe ser único
3. **Teléfono**: Formato válido, 10 dígitos
4. **Nombre**: No puede estar vacío, mínimo 5 caracteres
5. **Fechas**: Formato válido (YYYY-MM-DD)
6. **Grado**: Entre 1 y 11
7. **Número camiseta**: Entre 0 y 99

---

## Códigos HTTP Esperados

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | CREATED - Recurso creado |
| 204 | NO CONTENT - Eliminación exitosa |
| 400 | BAD REQUEST - Datos inválidos |
| 404 | NOT FOUND - Recurso no encontrado |
| 409 | CONFLICT - Duplicado (documento/email) |
| 500 | INTERNAL SERVER ERROR - Error del servidor |

---

## Ejemplo Completo en Spring Boot

### Entity
```java
@Entity
@Table(name = "estudiantes")
public class Estudiante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEstudiante;
    
    @Column(nullable = false, length = 100)
    private String nombreCompleto;
    
    @Column(nullable = false, unique = true, length = 20)
    private String numeroDocumento;
    
    @Column(nullable = false, unique = true)
    private String correoEstudiante;
    
    @ManyToOne
    @JoinColumn(name = "id_sede")
    private Sede sede;
    
    // ... resto de campos
}
```

### Controller
```java
@RestController
@RequestMapping("/api/estudiantes")
@CrossOrigin(origins = "http://localhost:4200")
public class EstudianteController {
    
    @GetMapping
    public ResponseEntity<List<Estudiante>> obtenerTodos() {
        return ResponseEntity.ok(estudianteService.obtenerTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Estudiante> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(estudianteService.obtenerPorId(id));
    }
    
    @PostMapping
    public ResponseEntity<Estudiante> crear(@RequestBody Estudiante estudiante) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(estudianteService.crear(estudiante));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Estudiante> actualizar(@PathVariable Integer id, 
                                                  @RequestBody Estudiante estudiante) {
        return ResponseEntity.ok(estudianteService.actualizar(id, estudiante));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        estudianteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## Testing con cURL

### GET - Listar todos
```bash
curl http://localhost:8080/api/estudiantes
```

### GET - Obtener uno
```bash
curl http://localhost:8080/api/estudiantes/1
```

### POST - Crear
```bash
curl -X POST http://localhost:8080/api/estudiantes \
  -H "Content-Type: application/json" \
  -d @estudiante.json
```

### PUT - Actualizar
```bash
curl -X PUT http://localhost:8080/api/estudiantes/1 \
  -H "Content-Type: application/json" \
  -d @estudiante.json
```

### DELETE - Eliminar
```bash
curl -X DELETE http://localhost:8080/api/estudiantes/1
```

---

## Notas Importantes

1. **ID automático**: No enviar `idEstudiante` en POST, se genera automáticamente
2. **Timestamps**: Considerar agregar `createdAt` y `updatedAt`
3. **Auditoría**: Considerar registrar quién creó/modificó cada registro
4. **Soft delete**: Considerar marcar como inactivo en lugar de eliminar
5. **Paginación**: Para listas grandes, implementar paginación
6. **Búsqueda**: Considerar agregar filtros y búsqueda por nombre

---

## Seguridad Recomendada

- ✅ Usar HTTPS en producción
- ✅ Implementar autenticación (JWT o similar)
- ✅ Validar autorización en endpoints
- ✅ Implementar rate limiting
- ✅ Usar prepared statements para SQL
- ✅ Validar entrada de datos
- ✅ Logging y monitoreo

