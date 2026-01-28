# ⚡ Inicio Rápido - Componente de Estudiantes

## 🚀 Pasos para Comenzar (5 minutos)

### Paso 1: Asegurar que el Backend esté corriendo
```bash
# Tu backend debe estar en http://localhost:8080
# Verificar que los endpoints existan:
# GET    /api/estudiantes
# POST   /api/estudiantes
# PUT    /api/estudiantes/{id}
# DELETE /api/estudiantes/{id}
```

### Paso 2: Iniciar la Aplicación Angular
```bash
cd "C:\Users\Admin\Downloads\now-ui-dashboard-angular-master"
npm install  # Si es la primera vez
npm start    # O: ng serve
```

### Paso 3: Abrir en el Navegador
```
http://localhost:4200
```

### Paso 4: Navegar a Estudiantes
1. Mira el menú lateral izquierdo
2. Haz clic en **"Estudiantes"** (con ícono de mortarboard)
3. ¡Listo! Deberías ver la tabla cargándose

---

## 📌 Acciones Principales

### ✅ Ver Estudiantes
- Automático al cargar la página
- Se cargan desde: `GET http://localhost:8080/api/estudiantes`

### ➕ Crear Estudiante
1. Haz clic en **"Crear Estudiante"** (botón azul arriba a la derecha)
2. Completa el formulario
3. Haz clic en **"Crear"**

### ✏️ Editar Estudiante
1. En la tabla, busca la fila del estudiante
2. Haz clic en el botón **azul con ícono de configuración**
3. Modifica los datos
4. Haz clic en **"Actualizar"**

### 🗑️ Eliminar Estudiante
1. En la tabla, busca la fila del estudiante
2. Haz clic en el botón **rojo con X**
3. Confirma la eliminación
4. ¡Listo!

---

## 📁 Archivos Creados

```
src/app/
├── students/
│   ├── students.component.ts        (✏️ MODIFICADO)
│   ├── students.component.html      (✏️ MODIFICADO)
│   └── students.component.css       (✏️ MODIFICADO)
└── services/
    └── estudiante.service.ts        (✨ NUEVO)

Documentación:
├── IMPLEMENTACION_RESUMEN.md        (Resumen completo)
├── ESTUDIANTES_COMPONENTE.md        (Documentación detallada)
├── GUIA_PRUEBA_ESTUDIANTES.md       (Casos de prueba)
├── BACKEND_ENDPOINTS_GUIA.md        (Endpoints REST)
└── API_ESTUDIANTES_EJEMPLO.json     (Ejemplos JSON)
```

---

## 🔍 Validar Funcionamiento

### En el Navegador:
1. Abre F12 (Developer Tools)
2. Ve a la pestaña "Network"
3. Realiza una acción (crear, editar, eliminar)
4. Deberías ver llamadas HTTP exitosas (status 200, 201, 204)

### En la Consola:
1. Abre F12 → "Console"
2. No debería haber errores en rojo
3. Puedes ver logs de operaciones exitosas

---

## ⚠️ Si Hay Problemas

### "La tabla está vacía"
**Causa**: El backend no está corriendo o no hay datos
**Solución**: 
1. Verifica que `http://localhost:8080` esté disponible
2. Crea un estudiante nuevo manualmente

### "Error al crear/editar"
**Causa**: Datos inválidos o campos obligatorios vacíos
**Solución**:
1. Revisa los campos marcados con *
2. Email debe ser válido
3. Teléfono debe tener 10 dígitos

### "Modal no abre"
**Causa**: Problema con ng-bootstrap
**Solución**: Reinicia el servidor Angular

### "Errores en consola"
**Causa**: Módulos no importados
**Solución**: Verifica que `admin-layout.module.ts` tenga:
- `ReactiveFormsModule`
- `NgbModule`
- `FormsModule`

---

## 📋 Checklist de Verificación

- [ ] Backend corriendo en puerto 8080
- [ ] Angular corriendo en puerto 4200
- [ ] Menú lateral muestra "Estudiantes"
- [ ] Tabla carga estudiantes
- [ ] Botón "Crear Estudiante" abre modal
- [ ] Modal tiene campos (nombre, email, etc.)
- [ ] Puedo crear un estudiante
- [ ] Puedo editar un estudiante
- [ ] Puedo eliminar un estudiante
- [ ] Veo notificaciones de éxito/error

---

## 🎯 Columnas de la Tabla

La tabla muestra 6 columnas principales:

| Columna | Contenido | Ancho |
|---------|-----------|-------|
| ID | ID del estudiante | 10% |
| Nombre Completo | Nombre completo | 25% |
| Email | Correo electrónico | 20% |
| Sede | Campus del estudiante | 20% |
| Teléfono | Número de celular | 15% |
| Acciones | Botones editar/eliminar | 10% |

---

## 🎨 Tema y Colores

El componente usa la paleta del dashboard:
- **Naranja (#f96332)**: Color principal
- **Verde**: Mensajes de éxito
- **Rojo**: Mensajes de error
- **Amarillo**: Advertencias

---

## 📱 Responsividad

- ✅ **Desktop (>768px)**: Tabla completa
- ✅ **Tablet (576-768px)**: Tabla ajustada
- ✅ **Mobile (<576px)**: Vista de tarjetas

---

## 🔗 Enlaces Útiles

1. **Documentación completa**
   → [ESTUDIANTES_COMPONENTE.md](ESTUDIANTES_COMPONENTE.md)

2. **Guía de prueba**
   → [GUIA_PRUEBA_ESTUDIANTES.md](GUIA_PRUEBA_ESTUDIANTES.md)

3. **Endpoints del API**
   → [BACKEND_ENDPOINTS_GUIA.md](BACKEND_ENDPOINTS_GUIA.md)

4. **Ejemplos JSON**
   → [API_ESTUDIANTES_EJEMPLO.json](API_ESTUDIANTES_EJEMPLO.json)

5. **Resumen de implementación**
   → [IMPLEMENTACION_RESUMEN.md](IMPLEMENTACION_RESUMEN.md)

---

## 💡 Consejos

1. **Usa datos reales**: Para testing, completa el formulario con datos reales
2. **Revisa validaciones**: El formulario valida email, teléfono, documento
3. **Prueba en mobile**: Abre DevTools (F12) y prueba responsive
4. **Ver logs**: Abre consola (F12 → Console) para debugging
5. **Network tab**: Monitoriza llamadas HTTP en F12 → Network

---

## 🆘 Soporte Rápido

**Problema**: ¿No carga nada?
→ Verifica consola (F12) para errores

**Problema**: ¿No conecta con backend?
→ Asegúrate que backend esté en puerto 8080

**Problema**: ¿Validaciones extrañas?
→ Lee los mensajes de error del formulario

**Problema**: ¿Tabla no se ve bien?
→ Redimensiona la ventana o recarga (F5)

---

## 📞 Siguiente Paso

Una vez que todo funciona:

1. Lee la [documentación completa](ESTUDIANTES_COMPONENTE.md)
2. Personaliza campos según necesidad
3. Agrega más validaciones si es necesario
4. Implementa filtros/búsqueda
5. Exporta datos (Excel, PDF)

---

## ✨ ¡Listo!

El componente está completamente funcional. 
Si todo está en orden, ¡a disfrutar! 🎉

**Tiempo de setup**: ~5 minutos
**Complejidad**: Fácil
**Estado**: ✅ Producción

