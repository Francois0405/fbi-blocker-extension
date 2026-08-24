# Cambios realizados

## Nuevas categorías de bloqueo

La extensión ahora ofrece cinco filtros independientes, todos activados por defecto:

| Clave | Categoría | Lista generada |
| --- | --- | --- |
| `base` | Protección base (publicidad maliciosa y amenazas) | `rules/list_base.json` |
| `porn` | Contenido adulto | `rules/list_porn.json` |
| `gambling` | Apuestas y casinos | `rules/list_gambling.json` |
| `fakenews` | Desinformación | `rules/list_fakenews.json` |
| `social` | Redes sociales | `rules/list_social.json` |

Las cinco listas proceden exclusivamente de [StevenBlack/hosts](https://github.com/StevenBlack/hosts). El generador descarga la lista base y las cuatro variantes por categoría.

Las variantes de StevenBlack incluyen también los dominios de la lista base. Para que los interruptores sean realmente independientes, el generador elimina de cada categoría los dominios que ya pertenecen a la fuente base antes de comprimir y guardar la lista. Así, desactivar Protección base no deja sus dominios bloqueados a través de otro filtro activo.

## Generación de listas

`generate_rules.py` se actualizó para:

- Usar las rutas actuales de StevenBlack/hosts para la lista base y las categorías `porn`, `gambling`, `fakenews` y `social`.
- Analizar entradas de hosts con `0.0.0.0` o `127.0.0.1`, ignorar comentarios y hosts especiales.
- Normalizar dominios (`www.`, mayúsculas y punto final), eliminar subdominios redundantes y ordenar el JSON para obtener resultados reproducibles.
- Descargar y procesar todas las fuentes antes de escribir archivos. Si una descarga falla, no se sobrescribe ninguna lista existente con datos vacíos.

Para actualizar las listas:

```bash
python3 generate_rules.py
```

Las listas generadas durante este cambio contienen 53.563 dominios base, 47.561 de contenido adulto, 4.227 de apuestas, 2.203 de desinformación y 613 de redes sociales.

## Motor de bloqueo y configuración

`categories.js` es el registro compartido de categorías. Define para cada filtro su clave, texto en español, descripción, icono, archivo JSON y estado predeterminado.

El trabajador de fondo ahora carga las listas a partir de ese registro. La configuración continúa guardándose en `chrome.storage.local` bajo la clave `filters`, que ahora tiene las claves `base`, `porn`, `gambling`, `fakenews` y `social`.

Al actualizar desde una instalación anterior, se conservan los estados guardados para las tres categorías antiguas y se añaden Protección base y Redes sociales activadas. Cada cambio en el popup recarga el conjunto de dominios en memoria. Se evita que una recarga más lenta reemplace un estado más reciente.

El comportamiento de navegación se mantiene: al visitar un dominio o subdominio incluido en una lista activa, la pestaña se redirige a la página local de aviso del FBI.

## Popup modernizado

El popup se registra ahora como la acción de la extensión en el manifiesto y utiliza la misma configuración `filters` que el motor de bloqueo; se eliminó la integración previa con `declarativeNetRequest`, que no estaba declarada ni correspondía al mecanismo real de bloqueo.

La nueva interfaz es un panel compacto en español con:

- Estado de protección y contador de filtros activados.
- Interruptor global para activar o pausar todos los filtros.
- Tarjetas para cada categoría, con descripción, icono y su propio interruptor.
- Resaltado visual de Protección base.
- Estados de foco para teclado, texto accesible para lectores de pantalla, región de mensajes de error y respeto por `prefers-reduced-motion`.
- Actualización visual inmediata al cambiar un ajuste y restauración del estado anterior si no se puede guardar.

## Manifiesto y compatibilidad

El manifiesto declara ambos modelos de fondo de Manifest V3: Firefox utiliza los scripts de fondo ordenados `categories.js` y `background.js`, mientras que Chrome utiliza `background.js` como trabajador de servicio. El registro compartido se carga con `importScripts` únicamente cuando se ejecuta como trabajador de servicio.

Las dos listas nuevas se incluyen junto a las existentes en los recursos empaquetados de la extensión.

## Validación realizada

Se añadieron pruebas unitarias en `tests/test_generate_rules.py`. Cubren el análisis de hosts, normalización y compresión, separación de categorías frente a la lista base, URLs de las fuentes y la protección contra escrituras parciales tras un error de descarga.

También se verificaron los seis tests, la sintaxis de los archivos JavaScript, la validez del manifiesto JSON, la presencia de listas JSON no vacías y el formato del diff de Git.
