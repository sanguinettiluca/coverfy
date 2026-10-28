# Coverfy

**Plataforma CRM para corredores de seguros — gestión de cartera, pólizas y siniestros en un solo lugar.**

[![Status](https://img.shields.io/badge/estado-en%20desarrollo-f59e0b?style=for-the-badge&logo=statuspage&logoColor=white)](.)
[![License](https://img.shields.io/badge/licencia-MIT-10b981?style=for-the-badge)](LICENSE)

---

## Características

- Gestión integral de cartera de clientes (multi-tenant por corredor)
- Gestión de pólizas y seguimiento de siniestros
- Autenticación con JWT y doble factor (2FA)
- Autocompletado de formularios con IA (Google Gemini)
- Extracción de datos desde documentos con OCR
- Reportes en PDF y gráficos
- Interfaz moderna, responsiva y multilenguaje

---

## Stack Tecnológico

**Frontend**
- React 19 + TypeScript + Vite
- Redux Toolkit y React Router
- react-hook-form + Joi para validaciones
- Chart.js, @react-pdf/renderer, i18next

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM sobre PostgreSQL
- Joi para validación de payloads
- JWT, bcryptjs y otplib (2FA)
- tesseract.js (OCR) y Google Gemini (IA)

**Despliegue:** Vercel (frontend)

---

## Requisitos previos

- Node.js 20+
- PostgreSQL 14+

## Instalación

```bash
git clone https://github.com/sanguinettiluca/coverfy.git
cd coverfy
npm install
```

Configurar las variables de entorno:

- `packages/backend/.env`: `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_MODEL_FALLBACK`, `PORT`
- `packages/frontend/.env`: `VITE_API_URL`

Base de datos:

```bash
cd packages/backend
npx prisma generate
npx prisma migrate dev
npm run seed        # opcional: datos de ejemplo
```

## Ejecución

Desde la raíz del repositorio:

```bash
npm run dev         # levanta frontend y backend
```

Scripts útiles:

```bash
npm run test -w packages/backend     # tests del backend (Vitest)
npm run build -w packages/frontend   # build de producción del frontend
```

---

## Estado del proyecto

En desarrollo.

## Licencia

Distribuido bajo licencia MIT. Ver [LICENSE](LICENSE).
