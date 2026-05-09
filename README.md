# 🍽️ Lili y su Sazón Completa — Sistema ERP de Catering

> *Cocinamos con amor para tu familia* 🌿

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Backend | Node.js (ESM), Express 4 |
| Base de Datos | PostgreSQL 16 |
| Autenticación | JWT + bcrypt |
| Gestor de Paquetes | pnpm |
| Tipografía | Manrope (Google Fonts) |

---

## 📁 Estructura del Proyecto

```
lili-sazoncompleta/
├── package.json              ← Workspace raíz
├── pnpm-workspace.yaml       ← Configuración de workspaces pnpm
├── .gitignore
├── README.md
├── scripts/
│   └── schema.sql            ← DDL de la base de datos
├── client/                   ← Frontend React + Vite
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   └── DashboardPage.jsx
│       ├── components/
│       │   └── ProtectedRoute.jsx
│       └── hooks/
│           └── useAuth.jsx
└── server/                   ← Backend Express
    ├── index.js
    ├── package.json
    ├── .env
    ├── config/
    │   └── db.js
    ├── controllers/
    │   └── authController.js
    ├── middleware/
    │   └── authMiddleware.js
    └── routes/
        └── authRoutes.js
```

---

## 🚀 Instalación paso a paso (Windows PowerShell)

### Paso 1 — Instalar dependencias

Abre PowerShell en la carpeta raíz `lili-sazoncompleta\` y ejecuta **cada línea por separado**:

```powershell
pnpm install
```

Ese único comando instala TODO gracias a `pnpm-workspace.yaml` (raíz + server + client).

---

### Paso 2 — Configurar variables de entorno

El archivo `server\.env` ya está listo con los valores de desarrollo:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:5241271@localhost:5432/LiliysuSazonCompleta_DB
JWT_SECRET=lili_sazon_super_secret_key_change_in_production_2024
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
```

---

### Paso 3 — Crear la base de datos

```powershell
psql -U postgres -c "CREATE DATABASE LiliysuSazonCompleta_DB"
psql -U postgres -d LiliysuSazonCompleta_DB -f scripts/schema.sql
```

---

### Paso 4 — Ejecutar la aplicación

**Opción A — Todo junto (recomendado):**
```powershell
pnpm dev
```

**Opción B — Terminales separadas (si falla la opción A):**

Terminal 1 (Backend):
```powershell
pnpm dev:server
```

Terminal 2 (Frontend):
```powershell
pnpm dev:client
```

---

### URLs de acceso

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |
| API Health | http://localhost:3001/api/health |

---

## 🗄️ Base de Datos

**Cadena de conexión:**
```
postgresql://postgres:5241271@localhost:5432/LiliysuSazonCompleta_DB
```

### Esquema `public.usuarios`

```sql
CREATE TABLE public.usuarios (
  id_usuario    SERIAL        PRIMARY KEY,
  id_empleado   INTEGER       NOT NULL UNIQUE,
  correo        VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  rol           VARCHAR(50)   NOT NULL DEFAULT 'operador',
  ultimo_login  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by    INTEGER,
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_by    INTEGER,
  activo        BOOLEAN       NOT NULL DEFAULT TRUE
);
```

### Crear usuario de prueba

```powershell
# Generar hash de contraseña primero:
node -e "import('bcrypt').then(b => b.default.hash('Admin@2024', 12).then(console.log))"
```

Luego en psql:
```sql
INSERT INTO public.usuarios (id_empleado, correo, password_hash, rol, activo)
VALUES (1, 'admin@liliysazon.com', 'PEGA_EL_HASH_AQUI', 'admin', true);
```

---

## 🔐 API de Autenticación

### POST `/api/auth/login`
```json
{ "correo": "admin@liliysazon.com", "password": "Admin@2024" }
```

### GET `/api/auth/me` *(Bearer Token requerido)*

### POST `/api/auth/logout` *(Bearer Token requerido)*

---

## 🎨 Paleta de Colores

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#476500` | Botones, acciones principales |
| `surface` | `#fafaed` | Fondo general |
| `surface-container-lowest` | `#ffffff` | Cards y formularios |
| `on-surface` | `#1a1c15` | Texto principal |

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (cost 12)
- Tokens **JWT** firmados HS256, expiran en 8h
- Headers seguros con **helmet**
- Consultas **parametrizadas** contra SQL injection
- CORS restringido al dominio del cliente

---

*© 2024 Lili y su Sazón Completa · Hecho con ❤️ en Colombia 🇨🇴*
