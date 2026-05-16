# 🍽️ Lili y su Sazón Completa — Sistema ERP de Catering

> **"Cocinamos con amor para tu familia"**
> Sistema de gestión integral para empresas de catering artesanal colombiano.

---

## 📌 Objetivo del Sistema

Plataforma web que permite a **administradores** y **vendedores** gestionar de forma centralizada:

- 👥 **Clientes** — directorio, historial de pedidos y preferencias
- 📦 **Productos** — catálogo visual con inventario y precios
- 🛒 **Ventas** — registro de pedidos y seguimiento de entregas
- 🧾 **Facturación** — emisión de facturas y descarga en PDF
- 👨‍💼 **Empleados** — gestión del equipo de trabajo
- 👤 **Usuarios** — control de accesos y roles
- 📊 **Reportes** — estadísticas y análisis del negocio

---

## 🔐 Roles del Sistema

| Rol | Acceso |
|---|---|
| `ADMIN` | Acceso completo a todos los módulos |
| `VENTAS` | Clientes, Productos, Ventas y Facturación |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3 |
| **Backend** | Node.js 18+ (ESM), Express 4 |
| **Base de Datos** | PostgreSQL 16 |
| **Autenticación** | JWT + bcrypt |
| **Imágenes** | Multer (subida local) |
| **Email** | Nodemailer + Mailtrap |
| **PDF** | (próxima fase) |
| **Gestor de Paquetes** | pnpm |
| **Tipografía** | Manrope (Google Fonts) |


---

## 📁 Estructura del Proyecto

```
admonliliysusazoncompleta/
│
├── 📄 package.json                     ← Workspace raíz (scripts concurrentes)
├── 📄 pnpm-workspace.yaml              ← Configuración de workspaces pnpm
├── 📄 .npmrc                           ← Config pnpm (approve-builds)
├── 📄 .gitignore
├── 📄 README.md
│
├── 📂 scripts/                         ← SQL y utilidades
│   ├── schema.sql                      ← DDL: tabla usuarios y empleados
│   ├── schema_productos.sql            ← DDL: tipo_producto y productos
│   ├── migration_reset_password.sql    ← ALTER TABLE: columnas de reset
│   └── check.js                        ← Diagnóstico de conexión y dependencias
│
├── 📂 client/                          ← Frontend React + Vite
│   ├── index.html
│   ├── vite.config.js                  ← Proxy /api y /uploads → localhost:3001
│   ├── tailwind.config.js              ← Paleta artesanal: oliva, crema, naranja
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                    ← Punto de entrada React
│       ├── App.jsx                     ← Árbol de rutas (React Router)
│       ├── index.css                   ← Estilos globales + Tailwind
│       │
│       ├── assets/                     ← Imágenes locales (logo, fondos)
│       │   ├── LOGO_LILI.jpg
│       │   └── ...
│       │
│       ├── components/
│       │   ├── AppLayout.jsx           ← Sidebar + Topbar compartido
│       │   └── ProtectedRoute.jsx      ← Guard de rutas autenticadas
│       │
│       ├── hooks/
│       │   └── useAuth.jsx             ← Contexto global de autenticación
│       │
│       └── pages/
│           ├── LoginPage.jsx           ← Pantalla de inicio de sesión
│           ├── ForgotPasswordPage.jsx  ← Solicitud de recuperación
│           ├── ChangePasswordPage.jsx  ← Nueva contraseña con token
│           ├── DashboardPage.jsx       ← Panel principal con métricas
│           └── ProductosPage.jsx       ← CRUD de productos con imágenes
│
└── 📂 server/                          ← Backend Express (Node.js ESM)
    ├── index.js                        ← Servidor principal + static uploads
    ├── package.json
    ├── .env                            ← Variables de entorno (no subir a git)
    │
    ├── config/
    │   └── db.js                       ← Pool de conexiones PostgreSQL
    │
    ├── controllers/
    │   ├── authController.js           ← Login, perfil, logout
    │   ├── passwordResetController.js  ← Forgot/change password
    │   └── productosController.js      ← CRUD productos + subida de imagen
    │
    ├── middleware/
    │   ├── authMiddleware.js           ← Verificación JWT + control de roles
    │   └── uploadProducto.js           ← Multer: subida de imágenes (5 MB max)
    │
    ├── routes/
    │   ├── authRoutes.js               ← /api/auth/*
    │   └── productosRoutes.js          ← /api/productos/*
    │
    ├── services/
    │   └── emailService.js             ← Nodemailer + template HTML artesanal
    │
    └── uploads/
        └── productos/                  ← Imágenes subidas por los usuarios
```

---

## 🗄️ Base de Datos PostgreSQL

**Cadena de conexión:**
```
postgresql://postgres:5241271@localhost:5432/LiliysuSazonCompleta_DB
```

### Tablas implementadas

#### `public.usuarios`
| Campo | Tipo | Descripción |
|---|---|---|
| id_usuario | SERIAL PK | Clave primaria |
| id_empleado | INT FK | Referencia a empleados |
| correo | VARCHAR(150) | Correo de acceso (único) |
| password_hash | TEXT | Hash bcrypt (12 rounds) |
| rol | VARCHAR(20) | `ADMIN` o `VENTAS` |
| ultimo_login | TIMESTAMP | Último inicio de sesión |
| reset_token | VARCHAR(128) | Token de recuperación (128 chars hex) |
| reset_token_expires | TIMESTAMP | Expiración del token (30 min) |
| activo | BOOLEAN | Cuenta habilitada |

#### `public.tipo_producto`
| Campo | Tipo | Descripción |
|---|---|---|
| id_tipo_producto | SERIAL PK | Clave primaria |
| nombre | VARCHAR(100) | Nombre único del tipo |
| descripcion | TEXT | Descripción opcional |
| activo | BOOLEAN | Tipo habilitado |

#### `public.productos`
| Campo | Tipo | Descripción |
|---|---|---|
| id_producto | SERIAL PK | Clave primaria |
| codigo | VARCHAR(30) | Código único (ej: PRD-001) |
| nombre | VARCHAR(150) | Nombre del producto |
| id_tipo_producto | INT FK | Tipo de producto |
| presentacion | VARCHAR(100) | Presentación (ej: Bandeja 10 pax) |
| valor | NUMERIC(14,2) | Precio en COP |
| descripcion | TEXT | Descripción detallada |
| imagen_url | VARCHAR(500) | Ruta local o URL de imagen |
| activo | BOOLEAN | Producto visible |

### Tipos de producto iniciales
`Arroz` · `Carne` · `Entradas` · `Refrigerios` · `Sopas` · `Postres`

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- **Node.js** ≥ 18.x
- **pnpm** ≥ 9.x → `npm install -g pnpm`
- **PostgreSQL** ≥ 14 activo en localhost

### Paso 1 — Instalar dependencias

```powershell
# Desde la carpeta raíz lili-sazoncompleta\
pnpm install

cd server
pnpm install
cd ..

cd client
pnpm install
cd ..
```

### Paso 2 — Configurar variables de entorno

Edita `server\.env`:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de datos
DATABASE_URL=postgresql://postgres:5241271@localhost:5432/LiliysuSazonCompleta_DB

# JWT
JWT_SECRET=lili_sazon_super_secret_key_change_in_production_2024
JWT_EXPIRES_IN=8h

# CORS
CLIENT_URL=http://localhost:5173

# Mailtrap — Email Testing
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=TU_USERNAME_MAILTRAP
SMTP_PASS=TU_PASSWORD_MAILTRAP
EMAIL_FROM="Lili y su Sazón Completa <no-reply@liliysazon.com>"

# Recuperación de contraseña
FRONTEND_URL=http://localhost:5173
RESET_TOKEN_EXPIRES_MINUTES=30
```

### Paso 3 — Crear la base de datos

```powershell
# Crear la BD
psql -U postgres -c "CREATE DATABASE LiliysuSazonCompleta_DB"

# Ejecutar migraciones en orden
psql -U postgres -d LiliysuSazonCompleta_DB -f scripts/schema.sql
psql -U postgres -d LiliysuSazonCompleta_DB -f scripts/migration_reset_password.sql
psql -U postgres -d LiliysuSazonCompleta_DB -f scripts/schema_productos.sql
```

### Paso 4 — Crear usuario administrador

```sql
-- Generar hash primero desde PowerShell:
-- node -e "import('bcrypt').then(b => b.default.hash('TuContraseña@2024', 12).then(console.log))"

INSERT INTO public.usuarios (id_empleado, correo, password_hash, rol, activo)
VALUES (1, 'admin@liliysazon.com', 'HASH_GENERADO', 'ADMIN', true);
```

### Paso 5 — Ejecutar la aplicación

```powershell
# Desde la raíz — levanta backend y frontend simultáneamente
pnpm dev
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Health check | http://localhost:3001/api/health |
| Imágenes | http://localhost:3001/uploads/productos/ |

---

## 🔌 API — Endpoints disponibles

### Autenticación `/api/auth`
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/login` | Inicio de sesión | ❌ |
| GET | `/me` | Perfil del usuario | ✅ |
| POST | `/logout` | Cerrar sesión | ✅ |
| POST | `/forgot-password` | Solicitar reset por email | ❌ |
| GET | `/validate-token/:token` | Verificar token de reset | ❌ |
| POST | `/change-password` | Cambiar contraseña | ❌ |

### Productos `/api/productos`
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/tipos` | Listar tipos de producto | ✅ |
| GET | `/siguiente-codigo` | Próximo código PRD-XXX | ✅ |
| GET | `/` | Listar productos (filtros + búsqueda) | ✅ |
| GET | `/:id` | Obtener producto por ID | ✅ |
| POST | `/` | Crear producto (multipart/form-data) | ✅ |
| PUT | `/:id` | Actualizar producto (multipart/form-data) | ✅ |
| DELETE | `/:id` | Eliminar producto (soft delete) | ✅ |

### Parámetros de consulta — GET `/api/productos`
```
?tipo=Arroz          → filtrar por tipo
?q=pollo             → búsqueda por nombre o código
?page=1&limit=50     → paginación
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores "Empresa Artesanal"

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#476500` | Botones, acciones, activo |
| `primary2` | `#5d7f13` | Hover de primario |
| `surface` | `#fafaed` | Fondo general |
| `container` | `#eeefe2` | Fondos de inputs |
| `white` | `#ffffff` | Cards y modales |
| `text` | `#1a1c15` | Texto principal |
| `textMuted` | `#747967` | Texto secundario |
| `orange` | `#944a00` | Acento / Ventas |
| `border` | `#e2e3d6` | Bordes y separadores |

### Tipografía
**Manrope** (Google Fonts) — pesos 400, 500, 600, 700, 800

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (cost factor 12)
- Tokens **JWT** firmados HS256, expiran en 8 horas
- Headers seguros con **helmet**
- **CORS** restringido al dominio del cliente
- Consultas **SQL parametrizadas** (protección contra inyección)
- Reset de contraseña con token de un solo uso (30 min)
- Respuestas genéricas en login (anti-enumeración)
- Validación `activo = true` en cada autenticación

---

## 📋 Módulos — Estado de Desarrollo

| Módulo | Backend | Frontend | Estado |
|---|---|---|---|
| Autenticación | ✅ | ✅ | Completo |
| Recuperar contraseña | ✅ | ✅ | Completo |
| Dashboard | — | ✅ | Completo |
| Productos | ✅ | ✅ | Completo |
| Clientes | 🔄 | 🔄 | En desarrollo |
| Ventas | 🔄 | 🔄 | En desarrollo |
| Facturación (PDF) | 🔄 | 🔄 | En desarrollo |
| Empleados | 🔄 | 🔄 | En desarrollo |
| Usuarios | 🔄 | 🔄 | En desarrollo |
| Reportes | 🔄 | 🔄 | En desarrollo |

---

## 🐛 Diagnóstico

```powershell
# Verificar conexión BD y dependencias instaladas
node scripts/check.js
```

---

## 📜 Convenciones de Código

- **ESM** (`import/export`) en todo el proyecto
- Controladores con `try/catch` y respuestas consistentes `{ success, message, data }`
- Soft delete: `activo = false` (nunca se elimina físicamente)
- Imágenes subidas: máximo **5 MB**, formatos JPG, PNG, WEBP
- Códigos de producto: formato `PRD-001` (auto-generado)
- Fechas: `TIMESTAMP` en PostgreSQL, zona horaria Colombia (GMT-5)

---

## 📞 Información del Proyecto

**Empresa:** Lili y su Sazón Completa
**Eslogan:** *Sabor de Familia — Cocinamos con amor para tu familia*
**País:** Colombia 🇨🇴

---

*© 2026 Lili y su Sazón Completa · Todos los derechos reservados*
