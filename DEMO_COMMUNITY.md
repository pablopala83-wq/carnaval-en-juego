# Comunidad de ejemplo · Carnaval 2027

**Estado: preparado para revisión. No activado en producción.**

La propuesta contiene 200 fichas ficticias identificadas como **Datos de ejemplo · Simulados**. Cada ficha tiene un puntaje inventado y un apoyo simulado a un conjunto. No crea usuarios ni inserta votos, seguidores o preferencias en Supabase. Las vistas de demostración se muestran en contenedores separados del ranking real y de Fallo Confiable.

## Distribución propuesta

La cantidad de ejemplos se inspira en el palmarés publicado por DAECPU y en los primeros tres puestos oficiales de 2026 publicados por la Intendencia de Montevideo. Es una decisión editorial para la demostración; **no es una medición del tamaño real de las hinchadas**.

Se asignan 110 ejemplos a Murgas, 30 a Parodistas, 20 a Humoristas, 20 a Revistas y 20 a Lubolos. Estos repartos entre categorías son supuestos editoriales, no datos de audiencia. Todos los 39 conjuntos reciben al menos un voto y un apoyo de ejemplo al inicio.

Dentro de cada categoría, el peso parte de `1 + raíz(títulos de referencia) + bono por podio 2026`. El bono es 1,5 / 1 / 0,5 para primero / segundo / tercero. La distribución de apoyos usa el mismo peso elevado a 1,3. El resto se asigna por mayor residuo, tras reservar una ficha por conjunto. Un título no encontrado en el resumen consultado se trata como referencia neutral, no como afirmación de que ese conjunto nunca ganó.

El palmarés afecta las **cantidades**; los puntajes inventados se generan por separado. La demostración no convierte trayectoria o cantidad de apoyos en una nota mayor.

| Conjunto | Votos de ejemplo | Apoyos simulados |
|---|---:|---:|
| Patos Cabreros | 12 | 13 |
| Asaltantes con Patente | 12 | 13 |
| Doña Bastarda | 9 | 10 |
| La Gran Muñeca | 10 | 10 |
| Los Diablos Verdes | 9 | 10 |
| Momosapiens | 9 | 10 |
| Zíngaros | 9 | 9 |
| Yambo Kenia | 8 | 9 |
| Agarrate Catalina | 8 | 8 |
| Sociedad Anónima | 7 | 7 |

Los 200 registros y los 39 conjuntos están en `community-examples.json`.

## Retiro 2 a 1

Se retira una ficha de la demostración por cada dos Fallos reales nuevos del Concurso Oficial 2027. Se cuentan únicamente Fallos de actuaciones completadas desde el inicio de la campaña. Un mismo usuario puede hacer Fallos de distintas actuaciones: se cuentan Fallos, no cuentas registradas, seguidores ni cambios de Liguillistas.

`Ejemplos activos = máximo(0, 200 − piso(Fallos reales nuevos / 2))`.

| Fallos reales nuevos | Ejemplos activos |
|---:|---:|
| 0 | 200 |
| 1 | 200 |
| 2 | 199 |
| 20 | 190 |
| 200 | 100 |
| 399 | 1 |
| 400 | 0 |

La misma ficha se retira de ambas vistas de demostración; las categorías no cambian la regla. A partir de 400, desaparece toda la demostración. Los ejemplos se retiran de las vistas activas; el archivo fuente queda versionado para reproducir y auditar la simulación. Un error de conexión conserva el último contador confirmado y lo avisa; no vuelve a inventar 200 ejemplos.

## Único cambio de Supabase propuesto

`demo-community-progress.sql` agrega `get_demo_community_progress()`, una función sin parámetros que solo devuelve el contador global y el retiro calculado. Requiere una cuenta autenticada. No devuelve identidades, preferencias, notas o resultados por conjunto; no cambia funciones existentes ni escribe votos. No se aplicó porque se mantiene la instrucción de no modificar Supabase sin autorización.

El inicio propuesto es `2026-11-20T13:30:28Z`. Se verificó que el evento no tenía actuaciones ni Fallos al preparar la campaña. Revisar esa fecha al activar si el contexto cambia. El contador cuenta los Fallos válidos actualmente conservados: una eliminación administrativa de Fallos o un cambio posterior del estado de una actuación puede recalcular los ejemplos; no hay una tabla adicional de historial de retiros.

La activación requiere aplicar esa función, verificar sus permisos y publicar esta rama. El frontend actualiza el contador al cargar la cuenta, tras guardar un Fallo y cada minuto mientras se consulta la comunidad. Los resultados reales solo se desbloquean mediante el flujo habitual; los ejemplos no desbloquean nada.

## Fuentes

- [DAECPU · Murgas](https://daecpu.org.uy/ganadores/murgas.html)
- [DAECPU · Parodistas](https://daecpu.org.uy/ganadores/parodistas.html)
- [DAECPU · Humoristas](https://daecpu.org.uy/ganadores/humoristas.html)
- [DAECPU · Revistas](https://daecpu.org.uy/ganadores/revistas.html)
- [DAECPU · Sociedad de Negros y Lubolos](https://daecpu.org.uy/ganadores/sociedad-de-negro-y-lubolos.html)
- [Intendencia de Montevideo · Fallos del Concurso Oficial 2026](https://www.montevideo.gub.uy/noticias/fallos-del-concurso-oficial-del-carnaval-2026)
