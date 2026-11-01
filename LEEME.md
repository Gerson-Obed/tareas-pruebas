# Tareas Pro · Pruebas — Semana 15

**Calidad y pruebas: Vitest, Playwright, TDD, cobertura y análisis estático**
Programación IV · Ing. Rodrigo Rodríguez · USPG

**Sesión asíncrona del sábado 24 de octubre de 2026.** No hay clase en vivo.
Este repositorio *es* la clase. Léelo de arriba abajo y hazlo en orden.

---

## De qué va

Este repo es una rebanada del producto del curso: la pantalla de pago, con
planes, cupones, IVA y una base de datos. Funciona. Se ve bien.

Y tiene **seis errores sembrados**.

Ninguno de los seis se arregla leyendo el código con cuidado — ya lo
intentaste otras veces y ya sabes cómo termina. Se arreglan **dejando que una
prueba te diga exactamente cuál es el problema**. Esa es la clase de hoy.

| | Dónde | Qué tipo de prueba lo caza |
|---|---|---|
| 1 | `lib/precios.ts` · `diasEntre` | unidad |
| 2 | `lib/precios.ts` · `aplicarCupon` | unidad |
| 3 | `lib/precios.ts` · `calcularTotal` | unidad |
| 4 | `lib/repo.ts` · `suscripcionesActivas` | integración, con base real |
| 5 | `lib/repo.ts` · `canjearCupon` | integración, con diez peticiones a la vez |
| 6 | `app/checkout/page.tsx` | extremo a extremo, con navegador |

Y además hay **dos archivos vacíos que escribes tú**: las pruebas de
`lib/cupones.ts` y un `spec` de Playwright. Esos no te los corrige una prueba:
te los corrige un cazador de mutantes.

---

## Arranque

### 1. Instala

```bash
pnpm install
pnpm exec playwright install chromium
```

Lo segundo descarga el navegador que usa Playwright. Son unos 150 MB y es la
única descarga grande del día: hazla ya, no cuando llegues al bloque 4.

### 2. Levanta la base

```bash
docker compose up -d
cp .env.local.ejemplo .env.local
```

PostgreSQL 17 en el puerto **5434**, para no chocar con el de tu proyecto
(5432) ni con el de la Semana 14 (5433). El esquema se crea solo.

### 3. Mira el rojo

```bash
pnpm pruebas
```

Ocho pruebas en rojo. **No las arregles todavía.** Léelas. Son el mapa del
día. Una prueba que falla bien escrita te dice *qué esperaba* y *qué recibió*,
y con eso basta para encontrar el error sin abrir un depurador.

---

## Los cinco bloques

Son unas **dos horas** si no te distraes. Haz uno, respira, sigue.

### Bloque 1 · Unidad (35 min) — `pnpm pruebas:unidad`

Arregla los errores 1, 2 y 3 de `lib/precios.ts`. Las pruebas ya están
escritas en `pruebas/unidad/precios.test.ts` y **no se tocan**.

Fíjate especialmente en estas dos, que están pegadas a propósito:

```
con cupón de porcentaje, el total cuadra          ← pasa aunque el código esté mal
con cupón de porcentaje, el desglose completo…    ← esta sí lo caza
```

La primera mira solo el total. La segunda mira el desglose entero. Un
porcentaje conmuta con otro porcentaje, así que mirar solo el total deja pasar
un error de orden en el IVA. **Ese es el tema del bloque**: una prueba verde no
prueba que el código esté bien; prueba que esa prueba no vio nada.

### Bloque 2 · TDD y mutantes (30 min) — `pnpm mutantes`

`lib/cupones.ts` está **bien escrito**. Lo que falta son sus pruebas, y las
escribes tú en `pruebas/unidad/cupones.test.ts` (hay seis `it.todo` esperándote).

Cuando creas que terminaste:

```bash
pnpm mutantes
```

El script va a romper `lib/cupones.ts` de seis maneras distintas, una por vez,
y va a correr **tus** pruebas después de cada rotura. Si tus pruebas siguen en
verde con el código roto, ese mutante *sobrevive* y el script te dice cuál.

Meta: **6 de 6 cazados.**

Pista grande: casi todos los mutantes sobreviven si tus pruebas solo miran
`ok: false`. Hay que mirar también la `razon`.

### Bloque 3 · Integración (30 min) — `pnpm pruebas:integracion`

Arregla los errores 4 y 5 de `lib/repo.ts`. Estos dos no se ven en una prueba
unitaria por un motivo de fondo: **no están en la lógica, están en la
conversación con la base de datos.**

El error 5 es el bueno. La prueba que lo caza se llama *«respeta el límite
cuando llegan diez al mismo tiempo»* y es una carrera de verdad: diez canjes
simultáneos contra un cupón con cupo para tres. Si tu código lee y después
escribe, los diez leen «cupo disponible» antes de que ninguno escriba, y pasan
los diez.

### Bloque 4 · Extremo a extremo (30 min) — `pnpm e2e`

El error 6 vive en `app/checkout/page.tsx` y es el más peligroso de los seis:
**la aplicación cobra bien y muestra mal**. Todas las pruebas de unidad están
en verde. El cálculo es correcto. Y aun así el cliente ve un número que no es
el que se le va a cobrar.

Solo lo caza una prueba que abra un navegador y lea lo que lee el cliente.

`e2e/checkout.spec.ts` viene escrito y en rojo. Arréglalo.
`e2e/cupon-rechazado.spec.ts` lo escribes tú: tres casos, están descritos
adentro.

Mientras trabajas, esto es cómodo:

```bash
pnpm e2e:ver     # abre la interfaz de Playwright y ves el navegador
```

### Bloque 5 · Las compuertas (20 min)

```bash
pnpm cobertura   # el umbral está en vitest.config.ts: 85% de líneas
pnpm lint
pnpm tipos
```

La cobertura **no es la meta**, es el semáforo. Un 100% de cobertura con
pruebas que no miran nada vale menos que un 70% con pruebas que cazan
mutantes. Por eso el umbral está en 85 y no en 100.

---

## Cómo entregas

```bash
pnpm verificar
```

Corre las seis compuertas en el mismo orden que el CI y te escribe un
comprobante como este:

```
T+ L+ U+ I+ C+ M+ E+   a3f91c8e4d02   2026-10-24 19:40 UTC
```

Esa línea va **en la descripción del pull request**, junto con:

1. La captura de `pnpm pruebas` en verde.
2. La captura de `pnpm mutantes` con 6 de 6.
3. Una frase por cada error sembrado: **qué estaba mal y cuál prueba lo delató**.
4. El enlace a tu GitHub Actions en verde.

Entregar en rojo cuenta más que no entregar. Si algo no te salió, pega el
comprobante como esté y escribe en el PR dónde te atoraste.

**Fecha límite: sábado 31 de octubre antes de las 16:00.**

---

## Si algo se rompe

**`ECONNREFUSED` en las pruebas de integración.** La base no está arriba.
`docker compose up -d` y espera unos segundos.

**Playwright dice que no encuentra el navegador.**
`pnpm exec playwright install chromium`.

**El `webServer` de Playwright tarda una eternidad.** Está compilando la
aplicación. La primera vez es lento; después reutiliza el servidor.

**Las pruebas de integración se pisan entre ellas.** No deberían:
`fileParallelism: false` en `vitest.config.ts` las pone en fila, y el
`beforeEach` de `pruebas/integracion/preparar.ts` limpia la base antes de cada
una. Si aun así pasa, mira si dejaste un `console.log` con un `await` suelto.

**No me sale un mutante.** Lee el nombre del mutante que sobrevivió: te está
diciendo literalmente qué regla no estás mirando.
