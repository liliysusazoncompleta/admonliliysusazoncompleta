# 🍽️ Lili y su Sazón Completa — Sistema ERP de Catering

> **"Cocinamos con amor para tu familia"**
> Plataforma de gestión para catering artesanal colombiano.

---

## 📌 Descripción

Este proyecto es una aplicación web fullstack para administrar operaciones de catering, con:

- Gestión de productos e inventario
- Gestión integral de proveedores y compras
- Control de usuarios con roles `ADMIN`, `OPERARIO` y `VENDEDOR`
- Autenticación segura con JWT (usuarios vinculados a empleados por cédula)
- Recuperación de contraseña por email
- Subida de imágenes de productos
- Portafolio/Menú para clientes
- Carta interactiva para clientes
- Perfiles de usuario con Mi Cuenta
- Carrito de compras integrado
- Interfaz responsive con drawer móvil
- API REST en Node.js + Express
- Frontend en React + Vite + Tailwind CSS

---

## ✨ Últimas modificaciones implementadas

- ✅ **Campo de descuento en factura** (`CarritoPage`): Se añadió soporte completo para descuentos sobre el subtotal de productos:
  - Campo editable **Porcentaje de descuento** (opcional, 0–100%) en el formulario de checkout.
  - Campo de solo lectura **Valor del descuento**, calculado automáticamente sobre el subtotal de productos.
  - El descuento se refleja en el **resumen de venta** del formulario (solo visible cuando > 0).
  - La **vista previa de factura / PDF** muestra la línea de descuento únicamente cuando se ha diligenciado un porcentaje.
  - El total final se calcula como: `subtotal − descuento + domicilio`.
  - Los campos `porcentaje_descuento` y `valor_descuento` se envían al backend al guardar la venta.
- ✅ **Módulo Empleados**: Visualización, creación, actualización y activación/desactivación de empleados con CRUD completo.
- ✅ **Módulo Usuarios**: Gestión completa de usuarios del sistema con roles (admin, operador, cocinero) y control de acceso. Vinculados a empleados por **cédula única**.
- ✅ **Módulo Ventas** (v2): Visualización de todas las ventas registradas con filtros avanzados:
  - Filtros separados por **año** y **mes** para mayor flexibilidad.
  - Filtros por vendedor y estado de venta.
  - **Tres estados de venta**: entregada, pendiente, cancelada.
  - Cambio dinámico de estado con ciclo: entregada → pendiente → cancelada → entregada.
  - Resumen de totales, comisiones y estadísticas de entregas.
  - Campo `estado` (CHARACTER VARYING) en lugar de `entregada` booleano para mayor control.
- ✅ **Módulo Proveedores**: Gestión completa de proveedores (CRUD):
  - Registro de proveedores con NIT único, nombre, dirección y teléfono.
  - Filtros de búsqueda por nombre y NIT.
  - Control de estado: Activo/Inactivo.
  - Auditoría completa: creado_por, actualizado_por, timestamps.
- ✅ **Módulo Compras**: Registro y seguimiento de compras a proveedores:
  - Número de factura único con validación.
  - Filtros avanzados: por factura, producto, proveedor, fechas, mes y año.
  - Relación con tabla TblProveedores.
  - Cálculo automático de totales.
  - Auditoría completa.
- ✅ **Remoción del campo `hora_entrega` de la tabla de ventas**: El campo de hora ya no se guarda en la base de datos. Solo `fecha_entrega` se persiste ahora.
- ✅ **Portafolio de Clientes**: Visualización de productos y servicios en formato portafolio para clientes finales.
- ✅ **Carta de Menú**: Interfaz de carta/menú interactiva para clientes con acceso a productos disponibles.
- ✅ **Mi Cuenta / Perfil de Usuario**: Página de perfil donde usuarios pueden ver y actualizar su información personal.
- ✅ **Interfaz Mobile Responsive**: Sidebar con drawer automático en dispositivos móviles para mejor navegación.
- La factura en vista previa ahora muestra cualquier campo de cliente diligenciado en el formulario, aún si no está guardado en la base de datos.
- El documento PDF se genera en tamaño `letter` y se escala para que el contenido se visualice mejor en una sola página.
- El nombre del archivo PDF se genera con el cliente y la fecha: `nombrecliente_yyyymmdd.pdf`.
- Los datos adicionales de cliente (`teléfono alterno`, `NIT/CC`, `dirección alterna`, `observaciones`) se muestran en la factura siempre que estén disponibles.

- ✅ **Control de visibilidad del menú principal según permisos de sesión**:
  - El frontend ahora oculta automáticamente las opciones del menú principal que el usuario en sesión no tiene permiso de ver. La lógica se implementó en `client/src/components/AppLayout.jsx` y utiliza la información de `usuario.rol` expuesta por `useAuth`.
  - El backend normaliza los roles (por ejemplo: `ventas` → `vendedor`, `operador` → `operario`, variantes de administrador → `admin`) en `server/controllers/authController.js`, por lo que las comprobaciones en el cliente son en minúsculas.
  - Archivos modificados:
    - `client/src/components/AppLayout.jsx` — filtrado de `NAV_ITEMS` según rol y renderizado de `itemsVisibles`.
    - `client/src/hooks/useAuth.jsx` — restauración de sesión desde `localStorage` y `usuario` expuesto al cliente.
  - Resultado: usuarios con roles restringidos (ej. `vendedor`, `operario`) no verán módulos como `ventas`, `empleados`, `usuarios`, `proveedores` o `compras` según la configuración de permisos.
- ✅ **Sincronización automática de imágenes de productos**:
  - Se incorporó el script `server/scripts/sync-images.js` para relacionar productos con fotos por similitud de nombre.
  - Comando de prueba (sin cambios en BD): `pnpm sync-images` (dentro de `server`).
  - Comando para aplicar cambios en `productos.imagen_url`: `pnpm sync-images:apply`.
  - Las imágenes del catálogo se sirven desde `GET /productos/<archivo>` usando la carpeta `server/public/productos`.

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
│       │   ├── AppLayout.jsx              # Layout principal (Sidebar + Topbar) — control de menú por rol
│       │   ├── ProtectedRoute.jsx         # Ruta protegida por autenticación/roles
│       │   ├── (otros componentes compartidos)
│       │   └── ...
│       │
│       ├── hooks/                          # Custom hooks
│       │   ├── useAuth.jsx                 # Contexto de autenticación (restauración de sesión)
│       │   ├── useCart.jsx                 # Hook del carrito (estado y cálculos)
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
    ├── scripts/                            # Scripts de backend
    │   ├── run_seed_node.js
    │   └── sync-images.js                  # Sincroniza imagen_url con archivos de fotos
    │
    ├── public/
    │   └── productos/                      # Carpeta oficial de fotos del catálogo
    │       ├── README.md
    │       └── (imágenes .jpg/.png/.webp)
    │
    └── uploads/                            # Archivos subidos por formularios (Multer)
      └── productos/
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
- Proveedores
- Compras
- Portafolio
- Carta
- Mi Cuenta
- Carrito
- Login
- Cambiar Contraseña
- Recuperar Contraseña

**`server/controllers/`** — Controladores por módulo:
- empleadosController.js
- usuariosController.js
- ventasController.js
- productosController.js
- clientesController.js
- proveedoresController.js
- comprasController.js
- authController.js

**`server/routes/`** — Rutas agrupadas:
- auth.routes.js
- empleados.routes.js
- usuarios.routes.js
- ventas.routes.js
- productos.routes.js
- clientes.routes.js
- proveedores.routes.js
- compras.routes.js

---

## 🔐 Roles del sistema

- `Admin` — acceso completo a todos los módulos y paneles administrativos.
- `Operario` — acceso de apoyo operativo: gestión de productos, clientes y operaciones de apoyo (no ve módulos de administración como `usuarios`).
- `Vendedor` — acceso restringido orientado a ventas: catálogo, carrito y ventas asignadas.

Nota: los roles se normalizan en el backend y se comparan en minúsculas en el cliente. Si necesitas ajustar las restricciones visibles en el menú, edita `client/src/components/AppLayout.jsx` y la constante `OCULTOS_PARA`.

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
- `public."TblProveedores"`
- `public."TblCompras"`

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
| cedula |  VARCHAR(30) | Referencia a `empleados` |
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
| valor_factura | NUMERIC | Total factura (con descuento y domicilio) |
| porcentaje_comision | NUMERIC | % de comisión |
| valor_comision | NUMERIC | Valor comisión |
| valor_domicilio | NUMERIC | Valor de domicilio |
| porcentaje_descuento | NUMERIC | % de descuento aplicado al subtotal (opcional) |
| valor_descuento | NUMERIC | Valor monetario del descuento (opcional) |
| observaciones | TEXT | Notas de la venta |
| estado | CHARACTER VARYING | Estado: 'entregada', 'pendiente', 'cancelada' |
| created_at | TIMESTAMP | Fecha creación |
| created_by | INT | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | INT | Usuario actualizador |
| activo | BOOLEAN | Venta activa |

#### `public."TblProveedores"`
| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL PK | Clave primaria |
| nit | VARCHAR(20) UNIQUE | NIT único del proveedor |
| nombre | VARCHAR(150) | Nombre del proveedor |
| direccion | VARCHAR(250) | Dirección del proveedor |
| telefono | VARCHAR(20) | Teléfono del proveedor |
| estado | VARCHAR(10) | Estado: 'Activo' o 'Inactivo' |
| created_at | TIMESTAMP | Fecha creación |
| created_by | VARCHAR(100) | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | VARCHAR(100) | Usuario actualizador |

#### `public."TblCompras"`
| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL PK | Clave primaria |
| num_factura | VARCHAR(50) UNIQUE | Número de factura único |
| fecha_compra | DATE | Fecha de la compra |
| proveedor_nit | VARCHAR(20) FK | Referencia a `TblProveedores.nit` |
| producto | VARCHAR(200) | Nombre del producto |
| valor | NUMERIC(14,2) | Valor total de la compra |
| created_at | TIMESTAMP | Fecha creación |
| created_by | VARCHAR(100) | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | VARCHAR(100) | Usuario actualizador |

### Notas de diseño

- Todas las tablas contienen auditoría: `created_at`, `created_by`, `updated_at`, `updated_by`, `activo`.
- La eliminación lógica se gestiona con `activo = false`.
- Los usuarios se asocian a empleados mediante `cedula`.
- Los clientes requieren teléfono único y admiten NIT opcional.
- Las tablas `TblProveedores` y `TblCompras` incluyen auditoría completa con `estado` (Activo/Inactivo).
- Los proveedores se identifican de forma única por NIT.
- Las compras se relacionan con proveedores mediante el NIT con integridad referencial (FK ON UPDATE CASCADE, ON DELETE RESTRICT).
- Los campos `porcentaje_descuento` y `valor_descuento` en `ventas` son opcionales (NULL cuando no se aplica descuento). El descuento se aplica **sobre el subtotal de productos**, antes de sumar el domicilio.

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

- Frontend: `http://localhost:5173/admonliliysusazoncompleta/`
- Backend: `http://localhost:3001`
- Health check: `http://localhost:3001/api/health`
- Imágenes catálogo (archivos en `server/public/productos`): `http://localhost:3001/productos/<archivo>`
- Imágenes subidas por formulario (Multer): `http://localhost:3001/uploads/productos/<archivo>`

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

### `/api/proveedores`

- `GET /` (con filtros: q, estado, page, limit)
- `GET /:id`
- `POST /` (crear proveedor)
- `PUT /:id` (actualizar proveedor)
- `PATCH /:id/estado` (toggle Activo/Inactivo)
- `DELETE /:id`

### `/api/compras`

- `GET /` (con filtros: q, proveedor, fecha_desde, fecha_hasta, mes, ano)
- `POST /` (crear compra)
- `PUT /:id` (actualizar compra)
- `DELETE /:id`

---

## 🧪 Diagnóstico

Ejecuta el script de diagnóstico para validar dependencias y conexión:

```powershell
node scripts/check.js
```

### Sincronizar imágenes con productos

```powershell
cd server
pnpm sync-images
pnpm sync-images:apply
```

`sync-images` solo genera reporte. `sync-images:apply` actualiza `imagen_url` en la base de datos.

---

## 🔒 Seguridad

- Hash de contraseñas con `bcrypt`
- Autenticación con `JWT`
- CORS restringido al cliente
- SQL parametrizadas
- Tokens de recuperación con expiración

---

## 📌 Estado del proyecto

- ✅ Autenticación: completo
- ✅ Recuperación de contraseña: completo
- ✅ Productos: completo
- ✅ Dashboard: completo
- ✅ Clientes: completo
- ✅ Ventas: completo
- ✅ Empleados: completo
- ✅ Usuarios: completo
- ✅ Portafolio: completo
- ✅ Carta: completo
- ✅ Mi Cuenta: completo
- ✅ Carrito: completo
- ✅ Proveedores: completo
- ✅ Compras: completo


---

## ✨ Últimas mejoras

- **Descuento en factura**: Campo de porcentaje de descuento (opcional) en el checkout. El valor equivalente se calcula automáticamente sobre el subtotal y aparece en la factura/PDF solo cuando se diligencia. El total final incorpora: `subtotal − descuento + domicilio`.
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

### 🏢 Gestión de Proveedores
- ✅ Visualizar lista completa de proveedores
- ✅ Crear nuevos proveedores con NIT único
- ✅ Editar información de proveedores
- ✅ Activar/desactivar proveedores
- ✅ Filtrar proveedores por nombre o NIT
- ✅ Información: nombre, dirección, teléfono, estado

### 📊 Gestión de Compras
- ✅ Registrar compras con número de factura único
- ✅ Filtrar compras por factura, producto, proveedor
- ✅ Filtrar compras por rango de fechas
- ✅ Filtrar compras por mes y año
- ✅ Información de proveedor vinculado automáticamente
- ✅ Cálculo y registro de valores de compra
- ✅ Auditoría completa de cada compra

### 🛒 Carrito de Compras
- ✅ Agregar productos al carrito desde el catálogo
- ✅ Gestionar cantidades por producto
- ✅ Seleccionar o crear cliente en el checkout
- ✅ Seleccionar vendedor con cálculo automático de comisión
- ✅ **Descuento opcional sobre el subtotal**: ingresar porcentaje → el valor se calcula automáticamente y aparece en la factura solo cuando se diligencia
- ✅ Campo de valor de domicilio
- ✅ Resumen de venta con subtotal, descuento y total final
- ✅ Generar cotizaciones y facturas en PDF
- ✅ Vista previa del documento antes de enviar
- ✅ Enviar por WhatsApp
- ✅ Guardar venta en el sistema

### 🎨 Portafolio de Clientes
- ✅ Visualización profesional de productos y servicios
- ✅ Catálogo organizado para clientes finales
- ✅ Navegación intuitiva por categorías
- ✅ Acceso sin necesidad de login

### 📋 Carta/Menú
- ✅ Interfaz de menú interactiva
- ✅ Visualización clara de productos disponibles
- ✅ Categorización por tipo de producto
- ✅ Información de precios y presentaciones
- ✅ Diseño responsive para móviles

### 👤 Mi Cuenta / Perfil de Usuario
- ✅ Visualización de datos del usuario
- ✅ Actualización de información personal
- ✅ Gestión de perfil
- ✅ Acceso para usuarios autenticados

---

## 📱 Mejoras en Experiencia de Usuario

- **Sidebar Responsive con Drawer**: En dispositivos móviles, el sidebar se transforma en un drawer deslizable para mejor navegación
- **Interfaz Mobile-First**: Todos los módulos se adaptan automáticamente a pantallas pequeñas
- **Navegación Intuitiva**: Menú hamburguesa en móviles para acceso rápido a todas las secciones
- **Optimización de Espacio**: Layouts adaptables que aprovechan el espacio disponible en cada dispositivo

---

## 📄 Notas

- El backend usa ESM (`import/export`).
- Para catálogo, las imágenes oficiales se administran en `server/public/productos/`.
- Las cargas desde formularios administrativos siguen usando `server/uploads/productos/`.
- Los productos usan soft delete con `activo = false`.
- Los módulos de administración (Empleados, Usuarios, Ventas, Proveedores, Compras) requieren autenticación.
- Las migraciones de proveedores y compras son idempotentes (usan `IF NOT EXISTS`).

## Despliegue a producción 
- Trabajas en → desarrollo
- Pruebas localmente → pnpm dev
- Cuando todo funciona:
  - git checkout main
  - git merge desarrollo  
  - git push origin main     ← dispara Railway
  - git checkout desarrollo  ← vuelves a trabajar
  -cd client && pnpm deploy ← actualiza GitHub Pages

# Probar local
pnpm dev

# Cuando funcione, subir a producción
cd client
pnpm build
pnpm exec gh-pages -d dist
cd ..
git add .
git commit -m "fix: sidebar responsive móvil con drawer"
git push origin desarrollo

# Merge a main para Railway
git checkout main
git merge desarrollo
git push origin main
git checkout desarrollo

---

## 📞 Contacto

**Lili y su Sazón Completa**

*© 2026 Lili y su Sazón Completa*
