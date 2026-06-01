# Coverfy

**Plataforma CRM para corredores de seguros — gestión de cartera, pólizas y siniestros en un solo lugar.**

[![Status](https://img.shields.io/badge/estado-en%20desarrollo-f59e0b?style=for-the-badge&logo=statuspage&logoColor=white)](.)
[![License](https://img.shields.io/badge/licencia-MIT-10b981?style=for-the-badge)](LICENSE)

---

## Características

-  Gestión integral de cartera de clientes
- Seguimiento de siniestros
- Interfaz moderna y responsiva

---

## Stack Tecnológico

- **Frontend:** React, Vite, TypeScript
- **Backend:** Node.js, Express, TypeScript, Prisma, JWT, Bcryptjs
- **Base de datos:** PostgreSQL
- **OCR:** Tesseract

---

## Configuración y prueba local

1. Copia `packages/backend/.env.example` a `packages/backend/.env`.
2. Ajusta `DATABASE_URL` a tu base de datos PostgreSQL local y define `JWT_SECRET`.
3. Instala dependencias en la raíz:

```bash
npm install
```

4. Genera Prisma Client si es necesario:

```bash
cd packages/backend
npx prisma generate
```

5. Ejecuta las migraciones o tu base de datos existente.

6. Crea usuarios iniciales con el seed del backend:

```bash
npm run seed --workspace=packages/backend
```

7. Inicia la app completa:

```bash
npm run dev
```

8. Abre el frontend en el navegador y usa el login para acceder al CRUD de clientes y al OCR.

---

<div align="center">

**[Documentación](#)**

</div>
