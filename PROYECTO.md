# EDEN — Documento de Proyecto

## ¿Qué es EDEN?

EDEN es una herramienta web para vendedores de MercadoLibre Argentina que quieren encontrar oportunidades de negocio y mejorar sus productos. Está construida con Next.js y deployada en Vercel.

**URL pública:** https://eden-kohl-six.vercel.app

---

## Estado actual (funcional)

### Funcionalidad 1: Explorador de categorías + Ranking de oportunidades

El usuario navega por las categorías de MercadoLibre Argentina y obtiene un ranking de subcategorías ordenadas por oportunidad de mercado.

**Flujo:**
1. Pantalla de inicio → muestra las categorías principales de MercadoLibre (ej: Hogar, Computación, Deportes)
2. Al hacer clic en una categoría → muestra las subcategorías
3. Al hacer clic en una subcategoría → muestra el ranking de oportunidades

**Puntuación (0-100):**
Actualmente basada en cantidad de publicaciones (saturación del mercado):
- 75-100 (Excelente): menos de 300 publicaciones → mercado abierto
- 55-74 (Bueno): 300 a 2.000 publicaciones
- 35-54 (Regular): 2.000 a 8.000 publicaciones
- 0-34 (Saturado): más de 8.000 publicaciones

**Limitación conocida:** MercadoLibre bloquea el endpoint de búsqueda (`/sites/MLA/search`) desde todas las IPs de Vercel (serverless y edge). Se intentaron múltiples alternativas. Por esto, el score actual usa solo `total_items_in_this_category`. En el futuro se puede agregar: cantidad de vendedores únicos, % de publicaciones premium, % de tiendas oficiales.

---

## Arquitectura técnica

| Componente | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Deploy | Vercel (free tier) |
| Repositorio | GitHub: Y-MENA/EDEN, rama `main` |
| API de datos | MercadoLibre API (Argentina, site MLA) |
| Autenticación ML | OAuth 2.0 client_credentials |

**Variables de entorno en Vercel (Production):**
- `ML_CLIENT_ID` — App ID de la app "EDEN1" en developers.mercadolibre.com.ar
- `ML_CLIENT_SECRET` — Secret key de la misma app

**Rutas del servidor (Next.js API Routes):**
- `GET /api/categories` — lista las categorías principales
- `GET /api/categories/[id]` — subcategorías de una categoría
- `GET /api/rank/[id]` — ranking de oportunidades de una categoría
- `GET /api/token` — genera token OAuth para uso del cliente
- `GET /api/debug` — endpoint de diagnóstico (puede eliminarse en producción)

**Archivos clave:**
- `src/app/page.tsx` — pantalla de inicio con grilla de categorías
- `src/app/categoria/[id]/page.tsx` — pantalla de subcategorías
- `src/app/ranking/[id]/page.tsx` — pantalla de ranking
- `src/lib/mercadolibre.ts` — cliente de la API de ML (auth, categorías, stats)
- `src/lib/scorer.ts` — lógica de puntuación de mercado
- `src/types/index.ts` — tipos TypeScript

---

## Próxima funcionalidad planeada: Analizador de productos

### Objetivo
El usuario pega el link de su publicación en MercadoLibre y EDEN le devuelve:
1. **Análisis de reseñas propias**: qué dice la gente de su producto (quejas, elogios)
2. **Mejores soluciones en ML**: productos similares con mejor reputación, por qué son mejores
3. **Mejores soluciones en Amazon**: qué se vende mejor afuera y qué mejoras ofrecen
4. **Resumen con IA**: Claude analiza todo y da recomendaciones concretas para mejorar el producto

### Fuentes de datos
- **MercadoLibre**: API de reseñas (`/reviews/item/{item_id}`) — accesible con OAuth
- **Amazon**: requiere scraping con navegador automatizado (Playwright) o un servicio de terceros
- **AliExpress / Alibaba**: similar a Amazon, scraping

### Stack propuesto
- Anthropic Claude API para análisis y síntesis de reseñas
- Playwright para scraping de Amazon (requiere un servidor que lo soporte, no serverless)
- MercadoLibre API para reseñas propias y de competidores

### Consideración importante
Vercel serverless no soporta Playwright (navegador headless). Para scraping de Amazon se necesita:
- Railway, Render, o similar (soportan procesos de larga duración)
- O un servicio de scraping de terceros (ScrapingBee, Browserless, etc.)

---

## Historial de problemas resueltos

| Problema | Causa | Solución |
|---|---|---|
| Error 403 en categorías | ML requiere auth incluso para endpoints "públicos" | OAuth client_credentials en todas las llamadas |
| Error 400 en OAuth | Credenciales incorrectas en Vercel | Re-ingresar ML_CLIENT_ID y ML_CLIENT_SECRET correctos |
| Error 403 en búsqueda | ML bloquea IPs de Vercel (serverless + edge) | Scoring simplificado basado en total_items |
| CORS en búsqueda desde browser | ML no permite Authorization header cross-origin | Descartado: mismo resultado por IP blocking |

---

## Credenciales y accesos

- **Vercel:** cuenta en vercel.com (proyecto: EDEN)
- **GitHub:** repositorio Y-MENA/EDEN, ramas master y main (Vercel escucha `main`)
- **MercadoLibre Developers:** developers.mercadolibre.com.ar, app "EDEN1"
  - Redirect URI configurada: https://eden-kohl-six.vercel.app
  - Grant type: client_credentials habilitado

---

## Para retomar este proyecto con una IA

Compartí este archivo y decile:
> "Estoy trabajando en EDEN, una herramienta web para analizar oportunidades en MercadoLibre Argentina. Lee el archivo PROYECTO.md del repositorio Y-MENA/EDEN en GitHub para entender el estado actual y quiero continuar con [lo que quieras hacer]."
