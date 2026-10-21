# Control de Lavados

Cronómetro de la etapa de lavado. La página se publica en GitHub Pages y los datos se guardan en Google Sheets.

| Archivo | Para qué es |
|---|---|
| `index.html` | Pantalla del **lavador** (solo su cola y el cronómetro). Este es el enlace que se le da. |
| `control.html` | **Registro, Lavador (monitor) y Tiempos.** Pide PIN. Solo para ti. |
| `config.js` | Aquí se pega la URL del script de Google. |
| `comun.js`, `styles.css` | Código y estilos compartidos (no hay que tocarlos). |
| `Code.gs` | Código del servidor. Se pega en Google Apps Script (no se sube a GitHub). |

## 1. Google Sheets + Apps Script (datos)

1. Crea una hoja nueva en Google Sheets, por ejemplo "Control Lavados".
2. Menú **Extensiones → Apps Script**. Borra lo que aparece y pega todo el contenido de `Code.gs`.
3. En la función `configurar()` cambia el **PIN** (`PIN_ADMIN`) y la **clave de Excel** (`CLAVE_EXCEL`).
4. Arriba, elige la función `configurar` y pulsa **Ejecutar**. Acepta los permisos que pide Google (cuenta propia → "Avanzado" → "Ir a…").
   Se creará la pestaña **Lavados** en la hoja.
5. Pulsa **Implementar → Nueva implementación**:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
6. Copia la **URL de la aplicación web** (termina en `/exec`).

> Si después cambias `Code.gs`, usa **Implementar → Gestionar implementaciones → Editar (lápiz) → Versión: Nueva versión**. Así la URL no cambia.

## 2. GitHub Pages (la página)

1. Abre `config.js` y pega la URL del paso anterior entre las comillas.
2. En GitHub crea un repositorio nuevo (por ejemplo `control-lavados`), **público**.
3. **Add file → Upload files** y sube: `index.html`, `control.html`, `config.js`, `comun.js`, `styles.css`.
4. **Settings → Pages → Branch: main → / (root) → Save**. En 1–2 minutos queda en:
   - Lavador: `https://TU-USUARIO.github.io/control-lavados/`
   - Tú: `https://TU-USUARIO.github.io/control-lavados/control.html`

## 3. Conectar Excel

1. En Excel: **Datos → Obtener datos → Desde la web**.
2. Pega: `URL_DEL_SCRIPT?accion=csv&clave=TU_CLAVE_EXCEL`
3. Si pregunta por el delimitador, elige **punto y coma**. Pulsa **Cargar**.
4. Para traer datos nuevos: **Datos → Actualizar todo**.

## Seguridad

- El PIN se valida en Google, no en la página. Aunque alguien vea el código en GitHub, no lo encuentra.
- Tras 5 PIN incorrectos se bloquea 10 minutos.
- La pantalla del lavador solo puede iniciar el **primer** vehículo de la lista, no puede tener dos en lavado y no puede editar ni borrar nada.
- Las horas las pone el servidor de Google, no el celular, así que cambiar la hora del dispositivo no altera los tiempos.
- Para cambiar el PIN: en Apps Script → Configuración del proyecto → Propiedades del script → edita `PIN_ADMIN`.
