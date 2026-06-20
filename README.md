# 🍽️ Lili y su Sazón Completa — Sistema ERP de Catering

> **"Cocinamos con amor para tu familia"**
> Plataforma de gestión para catering artesanal colombiano.

---

## 📌 Descripción

Este proyecto es una aplicación web fullstack para administrar operaciones de catering, con:

- Gestión de productos e inventario
- Control de usuarios con roles `ADMIN` y `VENTAS`
- Autenticación segura con JWT
- Recuperación de contraseña por email
- Subida de imágenes de productos
- API REST en Node.js + Express
- Frontend en React + Vite + Tailwind CSS

---

## ✨ Últimas modificaciones implementadas

- ✅ **Módulo Empleados**: Visualización, creación, actualización y activación/desactivación de empleados con CRUD completo.
- ✅ **Módulo Usuarios**: Gestión completa de usuarios del sistema con roles (admin, operador, cocinero) y control de acceso.
- ✅ **Módulo Ventas** (v2): Visualización de todas las ventas registradas con filtros avanzados:
  - Filtros separados por **año** y **mes** para mayor flexibilidad.
  - Filtros por vendedor y estado de venta.
  - **Tres estados de venta**: entregada, pendiente, cancelada.
  - Cambio dinámico de estado con ciclo: entregada → pendiente → cancelada → entregada.
  - Resumen de totales, comisiones y estadísticas de entregas.
  - Campo `estado` (CHARACTER VARYING) en lugar de `entregada` booleano para mayor control.
- ✅ **Remoción del campo `hora_entrega` de la tabla de ventas**: El campo de hora ya no se guarda en la base de datos. Solo `fecha_entrega` se persiste ahora.
- La factura en vista previa ahora muestra cualquier campo de cliente diligenciado en el formulario, aún si no está guardado en la base de datos.
- El documento PDF se genera en tamaño `letter` y se escala para que el contenido se visualice mejor en una sola página.
- El nombre del archivo PDF se genera con el cliente y la fecha: `nombrecliente_yyyymmdd.pdf`.
- Los datos adicionales de cliente (`teléfono alterno`, `NIT/CC`, `dirección alterna`, `observaciones`) se muestran en la factura siempre que estén disponibles.

---

## 🧱 Tecnologías usadas

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3 |
| **Backend** | Node.js 18+, Express 4, ESM |
| **Base de datos** | PostgreSQL |
| **Autenticación** | JWT, bcrypt |
| **Upload** | Multer |
| **Email** | Nodemailer + Mailtrap |
| **Gestor de paquetes** | pnpm |

---

## 📁 Estructura del proyecto

```
admonliliysusazoncompleta/                 # Raíz del monorepo
│
├── package.json                            # Dependencias compartidas
├── pnpm-workspace.yaml                    # Configuración workspace pnpm
├── README.md                               # Este archivo
│
├── scripts/                                # Scripts de utilidad
│   ├── check.js                            # Diagnóstico de dependencias
│   ├── migration_reset_password.sql       # Migración: reset password
│   ├── schema.sql                          # Esquema principal de BD
│   └── schema_productos.sql               # Esquema adicional productos
│
├── client/                                 # Aplicación React (Frontend)
│   ├── package.json
│   ├── vite.config.js                      # Configuración Vite
│   ├── tailwind.config.js                  # Configuración Tailwind CSS
│   ├── postcss.config.js                   # Configuración PostCSS
│   ├── index.html                          # HTML principal
│   │
│   └── src/                                # Código fuente React
│       ├── App.jsx                         # Componente raíz
│       ├── main.jsx                        # Punto entrada React
│       ├── index.css                       # Estilos globales
│       │
│       ├── components/                     # Componentes reutilizables
│       │   ├── (componentes compartidos)
│       │   └── ...
│       │
│       ├── hooks/                          # Custom hooks
│       │   ├── (hooks personalizados)
│       │   └── ...
│       │
│       └── pages/                          # Páginas/vistas
│           ├── (páginas del sistema)
│           └── ...
│
└── server/                                 # API Node.js (Backend)
    ├── package.json
    ├── index.js                            # Punto entrada del servidor
    ├── .env                                # Variables de entorno
    │
    ├── config/                             # Configuraciones
    │   ├── db.js                           # Conexión PostgreSQL
    │   └── ...
    │
    ├── controllers/                        # Controladores (lógica)
    │   ├── (controladores por módulo)
    │   └── ...
    │
    ├── middleware/                         # Middlewares Express
    │   ├── (validación, autenticación, etc)
    │   └── ...
    │
    ├── routes/                             # Rutas API
    │   ├── (rutas por módulo)
    │   └── ...
    │
    ├── services/                           # Servicios (lógica de negocio)
    │   ├── (servicios por módulo)
    │   └── ...
    │
    └── uploads/                            # Almacenamiento de archivos
        └── productos/                      # Imágenes de productos
            ├── (imágenes cargadas)
            └── ...
```

### 📂 Detalle de carpetas principales

**`client/src/components/`** — Componentes reutilizables (botones, modales, formularios, tarjetas, etc.)

**`client/src/hooks/`** — Lógica compartida (useAuth, useFetch, useForm, etc.)

**`client/src/pages/`** — Páginas del sistema:
- Dashboard
- Empleados
- Usuarios  
- Ventas
- Productos
- Clientes
- Login

**`server/controllers/`** — Controladores por módulo:
- empleadosController.js
- usuariosController.js
- ventasController.js
- productosController.js
- clientesController.js
- authController.js

**`server/routes/`** — Rutas agrupadas:
- auth.routes.js
- empleados.routes.js
- usuarios.routes.js
- ventas.routes.js
- productos.routes.js
- clientes.routes.js

---

## 🔐 Roles del sistema

- `admin` — acceso completo a todos los módulos incluida administración.
- `operador` — acceso a gestión de ventas, clientes y productos.
- `cocinero` — acceso limitado a gestión de producción.

---

## 💾 Base de datos PostgreSQL

**Cadena de conexión:**

```txt
postgresql://postgres:5241271@localhost:5432/LiliysuSazonCompleta_DB
```

### Tablas principales

- `public.empleados`
- `public.usuarios`
- `public.clientes`
- `public.tipo_producto`
- `public.productos`
- `public.ventas`

### Estructura de tablas principales

#### `public.empleados`
| Campo | Tipo | Descripción |
|---|---|---|
| id_empleado | SERIAL PK | Clave primaria |
| nombre | VARCHAR(150) | Nombre completo del empleado |
| cedula | VARCHAR(30) | Cédula única del empleado |
| telefono | VARCHAR(20) | Teléfono único |
| cargo | VARCHAR(100) | Cargo o función |
| salario | NUMERIC(14,2) | Salario del empleado |
| direccion_principal | TEXT | Dirección principal |
| direccion_alterna | TEXT | Dirección alternativa |
| activo | BOOLEAN | Empleado activo |

#### `public.usuarios`
| Campo | Tipo | Descripción |
|---|---|---|
| id_usuario | SERIAL PK | Clave primaria |
| id_empleado | INT | Referencia a `empleados` |
| correo | VARCHAR(255) | Correo de acceso único |
| password_hash | VARCHAR(255) | Hash bcrypt |
| rol | VARCHAR(50) | Rol: admin, operador, cocinero, cliente |
| ultimo_login | TIMESTAMP | Último inicio de sesión |
| created_at | TIMESTAMP | Fecha creación |
| created_by | INT | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | INT | Usuario actualizador |
| activo | BOOLEAN | Usuario activo |

#### `public.clientes`
| Campo | Tipo | Descripción |
|---|---|---|
| id_cliente | SERIAL PK | Clave primaria |
| nombre | VARCHAR(200) | Nombre o razón social |
| nit_cc | VARCHAR(30) | NIT o cédula opcional único |
| telefono | VARCHAR(20) | Teléfono obligatorio único |
| telefono_alt | VARCHAR(20) | Teléfono alternativo |
| direccion_principal | TEXT | Dirección principal |
| direccion_alterna | TEXT | Dirección secundaria |
| observaciones | TEXT | Notas del cliente |
| created_at | TIMESTAMP | Fecha creación |
| created_by | INT | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | INT | Usuario actualizador |
| activo | BOOLEAN | Cliente activo |

#### `public.tipo_producto`
| Campo | Tipo | Descripción |
|---|---|---|
| id_tipo_producto | SERIAL PK | Clave primaria |
| nombre | VARCHAR(100) | Nombre único del tipo |
| descripcion | TEXT | Descripción opcional |
| created_at | TIMESTAMP | Fecha creación |
| created_by | INT | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | INT | Usuario actualizador |
| activo | BOOLEAN | Tipo activo |

#### `public.productos`
| Campo | Tipo | Descripción |
|---|---|---|
| id_producto | SERIAL PK | Clave primaria |
| codigo | VARCHAR(30) | Código único (ej: PRD-001) |
| nombre | VARCHAR(150) | Nombre del producto |
| id_tipo_producto | INT | Referencia a `tipo_producto` |
| presentacion | VARCHAR(100) | Presentación del producto |
| valor | NUMERIC(14,2) | Precio en COP |
| descripcion | TEXT | Descripción detallada |
| imagen_url | TEXT | Ruta o URL de imagen |
| created_at | TIMESTAMP | Fecha creación |
| created_by | INT | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | INT | Usuario actualizador |
| activo | BOOLEAN | Producto activo |

#### `public.ventas`
| Campo | Tipo | Descripción |
|---|---|---|
| id_venta | SERIAL PK | Clave primaria |
| id_cliente | INT | Referencia a `clientes` |
| id_usuario | INT | Referencia a `usuarios` |
| id_empleado_comision | INT | Referencia a `empleados` |
| fecha_factura | DATE | Fecha de factura |
| fecha_entrega | DATE | Fecha de entrega |
| valor_factura | NUMERIC | Total factura |
| porcentaje_comision | NUMERIC | % de comisión |
| valor_comision | NUMERIC | Valor comisión |
| valor_domicilio | NUMERIC | Valor de domicilio |
| observaciones | TEXT | Notas de la venta |
| estado | CHARACTER VARYING | Estado: 'entregada', 'pendiente', 'cancelada' |
| created_at | TIMESTAMP | Fecha creación |
| created_by | INT | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | INT | Usuario actualizador |
| activo | BOOLEAN | Venta activa |

### Notas de diseño

- Todas las tablas contienen auditoría: `created_at`, `created_by`, `updated_at`, `updated_by`, `activo`.
- La eliminación lógica se gestiona con `activo = false`.
- Los usuarios se asocian a empleados mediante `id_empleado`.
- Los clientes requieren teléfono único y admiten NIT opcional.

---

## 🚀 Configuración rápida

### Requisitos

- Node.js ≥ 18
- pnpm ≥ 9
- PostgreSQL instalado y en ejecución

### 1. Instalar dependencias

```powershell
pnpm install
cd server
pnpm install
cd ../client
pnpm install
cd ..
```

### 2. Configurar variables de entorno

Crea `server/.env` con el siguiente contenido:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:5241271@localhost:5432/LiliysuSazonCompleta_DB
JWT_SECRET=lili_sazon_super_secret_key_change_in_production_2024
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=TU_USERNAME_MAILTRAP
SMTP_PASS=TU_PASSWORD_MAILTRAP
EMAIL_FROM="Lili y su Sazón Completa <no-reply@liliysazon.com>"
FRONTEND_URL=http://localhost:5173
RESET_TOKEN_EXPIRES_MINUTES=30
```

### 3. Crear la base de datos

```powershell
psql -U postgres -c "CREATE DATABASE LiliysuSazonCompleta_DB"
psql -U postgres -d LiliysuSazonCompleta_DB -f scripts/schema.sql
psql -U postgres -d LiliysuSazonCompleta_DB -f scripts/migration_reset_password.sql
psql -U postgres -d LiliysuSazonCompleta_DB -f scripts/schema_productos.sql
```

### 4. Crear usuario administrador

1. Genera el hash de la contraseña:

```powershell
node -e "import('bcrypt').then(b => b.default.hash('TuContraseña@2024', 12).then(console.log))"
```

2. Inserta el usuario en la base de datos:

```sql
INSERT INTO public.usuarios (id_empleado, correo, password_hash, rol, activo)
VALUES (1, 'admin@liliysazon.com', 'HASH_GENERADO', 'ADMIN', true);
```

### 5. Iniciar la aplicación

```powershell
pnpm dev
```

#### ¿Qué hacer si los puertos están ocupados?

Si al iniciar el proyecto ves un error de puerto ocupado, puedes identificar el proceso que usa el puerto y detenerlo:

```powershell
netstat -ano | findstr ":3001" 
tasklist /FI "PID eq <PID>"
taskkill /PID <PID> /F
```

Repite el mismo procedimiento para `5173` o el puerto que aparezca en el error.
### Qué hace cada comando
netstat -ano | findstr ":3001"

Busca procesos que estén usando el puerto 3001.
Devuelve una línea con el número de PID del proceso que está escuchando en ese puerto.
tasklist /FI "PID eq <PID>"

Reemplaza <PID> por el número obtenido en el paso anterior.
Muestra qué aplicación o proceso corresponde a ese PID.
taskkill /PID <PID> /F

Termina forzosamente el proceso que está ocupando el puerto.
Libera el puerto para que el servidor pueda arrancar de nuevo.

---

## 🌐 URLs principales

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Health check: `http://localhost:3001/api/health`
- Imágenes: `http://localhost:3001/uploads/productos/`

---

## 🔌 API disponible

### `/api/auth`

- `POST /login`
- `GET /me`
- `POST /logout`
- `POST /forgot-password`
- `GET /validate-token/:token`
- `POST /change-password`

### `/api/productos`

- `GET /tipos`
- `GET /siguiente-codigo`
- `GET /`
- `GET /:id`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

---

## 🧪 Diagnóstico

Ejecuta el script de diagnóstico para validar dependencias y conexión:

```powershell
node scripts/check.js
```

---

## 🔒 Seguridad

- Hash de contraseñas con `bcrypt`
- Autenticación con `JWT`
- CORS restringido al cliente
- SQL parametrizadas
- Tokens de recuperación con expiración

---

## 📌 Estado del proyecto

- Autenticación: completo
- Recuperación de contraseña: completo
- Productos: completo
- Dashboard: completo
- Clientes: en desarrollo
- Ventas: en desarrollo
- Facturación: en desarrollo
- Empleados: en desarrollo
- Reportes: en desarrollo

---

## ✨ Últimas mejoras

- Se corrigió el flujo de checkout para evitar la pantalla en blanco al abrir "Continuar con la venta".
- El exportado PDF ahora descarga como `cliente_YYYYMMDD.pdf`.
- El botón "Guardar en Drive" abre la carpeta de Google Drive en una pestaña nueva.
- La vista previa excluye los botones y los campos administrativos del documento exportado.
- Se añadió información de pago/contacto al documento generado.
- Se agregó selección de vendedor desde la lista de `empleados`, sin incluirse en el PDF.

---

## 📄 Características por módulo

### 📊 Dashboard
- Visualización de estadísticas generales
- Acceso rápido a todos los módulos

### 👥 Gestión de Empleados
- ✅ Visualizar lista completa de empleados
- ✅ Crear nuevos empleados con datos personales (cédula, teléfono, cargo, salario, direcciones)
- ✅ Editar información de empleados existentes
- ✅ Activar/desactivar empleados (soft delete)
- ✅ Filtrar empleados (búsqueda por nombre, cédula, teléfono)
- ✅ Mostrar estado activo/inactivo

### 🔐 Gestión de Usuarios
- ✅ Visualizar lista de usuarios del sistema
- ✅ Crear usuarios con roles diferenciados (admin, operador, cocinero)
- ✅ Editar información de usuarios
- ✅ Cambiar contraseñas
- ✅ Activar/desactivar usuarios
- ✅ Filtrar usuarios por correo o nombre de empleado
- ✅ Mostrar último login
- ✅ Asocación con empleados

### 💰 Gestión de Ventas
- ✅ Visualizar todas las ventas registradas
- ✅ Filtrar por año (2025, 2026, etc.)
- ✅ Filtrar por mes (enero-diciembre)
- ✅ Filtrar por vendedor/empleado
- ✅ Filtrar por estado (entregada, pendiente, cancelada)
- ✅ Cambiar estado de venta con ciclo: entregada → pendiente → cancelada → entregada
- ✅ Ver resumen de totales:
  - Total de ventas ($)
  - Total de comisiones ($)
  - Cantidad de ventas entregadas vs pendientes
- ✅ Información detallada por venta (cliente, vendedor, fecha, valor, comisión)
- ✅ Gestión de 3 estados de venta para mayor control

### 📦 Gestión de Productos
- Visualizar catálogo completo
- Crear, editar y eliminar productos
- Filtrar por tipo de producto
- Búsqueda por nombre o código
- Asignación de imágenes

### 👤 Gestión de Clientes
- Crear, editar y eliminar clientes
- Información completa (teléfono, dirección, NIT/CC)
- Búsqueda y filtrado

### 🛒 Carrito de Compras
- Agregar productos al carrito
- Gestionar cantidades
- Generar cotizaciones y facturas en PDF
- Enviar por WhatsApp

---

## 📄 Notas

- El backend usa ESM (`import/export`).
- Las imágenes se guardan localmente en `server/uploads/productos/`.
- Los productos usan soft delete con `activo = false`.
- Todos los módulos de administración (Empleados, Usuarios, Ventas) requieren autenticación.

---

## 📞 Contacto

**Lili y su Sazón Completa**

*© 2026 Lili y su Sazón Completa*
