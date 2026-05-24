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

- La factura en vista previa ahora muestra cualquier campo de cliente diligenciado en el formulario, aún si no está guardado en la base de datos.
- El documento PDF se genera en tamaño `letter` y se escala para que el contenido se visualice mejor en una sola página.
- El horario de entrega en la factura se muestra en formato de 12 horas (`AM/PM`).
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
admonliliysusazoncompleta/
├── package.json
├── pnpm-workspace.yaml
├── README.md
├── scripts/
│   ├── check.js
│   ├── migration_reset_password.sql
│   ├── schema.sql
│   └── schema_productos.sql
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       ├── hooks/
│       └── pages/
└── server/
    ├── package.json
    ├── index.js
    ├── .env
    ├── config/db.js
    ├── controllers/
    ├── middleware/
    ├── routes/
    ├── services/
    └── uploads/productos/
```

---

## 🔐 Roles del sistema

- `ADMIN` — acceso completo a todos los módulos.
- `VENTAS` — acceso a clientes, productos, ventas y facturación.

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
| nombres | VARCHAR(150) | Nombres del empleado |
| apellidos | VARCHAR(150) | Apellidos del empleado |
| documento | VARCHAR(30) | Documento único |
| telefono | VARCHAR(20) | Teléfono único |
| correo | VARCHAR(150) | Correo único |
| direccion | TEXT | Dirección |
| cargo | VARCHAR(100) | Cargo o función |
| porcentaje_comision | NUMERIC(5,2) | Comisión del empleado |
| observaciones | TEXT | Observaciones internas |
| created_at | TIMESTAMP | Fecha creación |
| created_by | INT | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | INT | Usuario actualizador |
| activo | BOOLEAN | Eliminación lógica |

#### `public.usuarios`
| Campo | Tipo | Descripción |
|---|---|---|
| id_usuario | SERIAL PK | Clave primaria |
| id_empleado | INT | Referencia a `empleados` |
| nombres | VARCHAR(150) | Nombre de usuario |
| correo | VARCHAR(150) | Correo de acceso único |
| password_hash | TEXT | Hash bcrypt |
| rol | VARCHAR(20) | `ADMIN` o `VENTAS` |
| ultimo_login | TIMESTAMP | Último inicio de sesión |
| created_at | TIMESTAMP | Fecha creación |
| created_by | INT | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | INT | Usuario actualizador |
| activo | BOOLEAN | Cuenta activa |

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
| hora_entrega | TIME | Hora de entrega |
| valor_factura | NUMERIC(14,2) | Total factura |
| porcentaje_comision | NUMERIC(5,2) | % de comisión |
| valor_comision | NUMERIC(14,2) | Valor comisión |
| valor_domicilio | NUMERIC(14,2) | Valor de domicilio |
| observaciones | TEXT | Notas de la venta |
| created_at | TIMESTAMP | Fecha creación |
| created_by | INT | Usuario creador |
| updated_at | TIMESTAMP | Fecha actualización |
| updated_by | INT | Usuario actualizador |
| activo | BOOLEAN | Venta activa |

### Notas de diseño

- Todas las tablas contienen auditoría: `created_at`, `created_by`, `updated_at`, `updated_by`, `activo`.
- La eliminación lógica se gestiona con `activo = false`.
- Los usuarios se asocian opcionalmente a empleados.
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

## 📄 Notas

- El backend usa ESM (`import/export`).
- Las imágenes se guardan localmente en `server/uploads/productos/`.
- Los productos usan soft delete con `activo = false`.

---

## 📞 Contacto

**Lili y su Sazón Completa**

*© 2026 Lili y su Sazón Completa*
