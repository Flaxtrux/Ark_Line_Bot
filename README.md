# ARK Line Manager Discord Bot

Un bot de Discord autohospedado y de alto rendimiento diseñado para comunidades y tribus competitivas de ARK. Permite centralizar, registrar y consultar el inventario de estadísticas de las líneas de crianza puras (HP, Melee, Stamina, Peso) de forma rápida y visual mediante comandos integrados (*Slash Commands*).

## Arquitectura de Privacidad Multitenant

El bot está diseñado bajo un modelo de aislamiento estricto por servidor (*Guild Isolation*).

* **Filtrado por `guild_id`:** Aunque el bot sea utilizado por múltiples tribus en servidores de Discord independientes, los datos se almacenan y filtran indexando la ID única del servidor de origen (`guild_id`).
* **Estanqueidad de Datos:** Es técnicamente imposible que los miembros de una tribu consulten, editen o verifiquen la existencia de las estadísticas registradas por otra tribu enemiga o aliada. Cada servidor opera en un entorno de base de datos virtualmente aislado de forma transparente para el usuario.

---

## Características Principales

* **Buscador Inteligente Predictivo:** Implementación de *Autocompletado (Autocomplete)* en tiempo real para mitigar errores de sintaxis humana. Soporta un catálogo optimizado de más de 100 criaturas del ecosistema de ARK.
* **Fichas Gráficas Automatizadas:** El backend mapea de forma nativa las imágenes oficiales de alta resolución para cada criatura, garantizando una estética homogénea y profesional sin intervención del usuario.
* **Estadísticas Limpias (Enfoque PvP):** Eliminación de metadatos redundantes (niveles de personaje, nombres de servidores externos, duplicidad de especies). El bot registra estrictamente lo necesario para el cálculo de crianza y clonación.
* **Seguridad Avanzada:** Consultas preparadas mediante `better-sqlite3` para mitigar vectores de ataque por inyección SQL, junto con una lista blanca estricta de columnas mutables en el backend.

---

## Comandos Disponibles

Todos los comandos se ejecutan de manera nativa mediante la interfaz de comandos de Discord:

* `/dino-add [linea] [hp] [melee] (stamina) (peso)` — Registra una nueva línea de crianza. El campo `linea` cuenta con autocompletado inteligente.
* `/dino-update [linea] (hp) (melee) (stamina) (peso)` — Actualiza los parámetros modificados tras una mutación o actualización de línea.
* `/dino-stats [linea]` — Despliega la ficha técnica visual e independiente con las barras de progreso dinámicas de la criatura.
* `/dino-list` — Muestra un índice completo de todas las líneas de crianza que posee la tribu en ese servidor.
* `/dino-delete [linea]` — Remueve de forma permanente el registro de la criatura seleccionada de la base de datos local.

---

## Estructura del Proyecto

```filepath
├── commands/            # Módulos individuales de los Slash Commands
│   ├── dino-add.js
│   ├── dino-delete.js
│   ├── dino-list.js
│   ├── dino-stats.js
│   └── dino-update.js
├── db.js                # Configuración de SQLite y capa de abstracción de datos
├── dinos-lista.js       # Repositorio estático de criaturas y mapeo de URLs de imágenes
├── embed.js             # Factoría constructora de interfaces ricas (EmbedBuilder)
├── index.js             # Punto de entrada de la aplicación y manejador de interacciones Discord
├── package.json         # Manifiesto de dependencias del proyecto
└── .env                 # Credenciales sensibles del entorno (Ignorado en Git)
```

---

## Guía de Despliegue en Servidor (Debian)

Sigue estos pasos detallados para preparar el entorno e iniciar el bot en una instancia limpia de **Debian 11 / 12**.

### Paso 1: Actualizar el Sistema y Herramientas Base

Conéctate por SSH a tu servidor Debian y ejecuta:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential
```

### Paso 2: Instalar Node.js (Versión Recomendada LTSC)

Instalamos el runtime de Node.js a través del repositorio oficial de NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

*Verifica la instalación ejecutando `node -v` y `npm -v`.*

### Paso 3: Clonar el Proyecto y Preparar Directorios

```bash
git clone https://github.com/tu-usuario/ark-stats-bot.git
cd ark-stats-bot
```

### Paso 4: Instalar las Dependencias del Backend

Instalamos los paquetes necesarios. `better-sqlite3` se compilará de forma nativa en tu Debian gracias al paquete `build-essential` instalado previamente:

```bash
npm install
```

### Paso 5: Configurar las Variables de Entorno

Crea un archivo de configuración `.env` en la raíz del proyecto para almacenar de forma segura las credenciales obtenidas en el [Discord Developer Portal](https://www.google.com/search?q=https://discord.com/developers/applications):

```bash
nvim .env
```

Pega el siguiente contenido y reemplaza con tus datos:

```env
DISCORD_TOKEN=tu_bot_token_secreto_aqui
CLIENT_ID=tu_client_id_del_bot_aqui
```

*Para guardar y salir en nvim presiona `:wq` y luego `Enter`.*

### Paso 6: Configurar PM2 para Producción (Persistencia 24/7)

Instalamos globalmente el gestor de procesos PM2 para asegurar que el bot se reinicie automáticamente si el servidor Debian experimenta un apagón o el proceso falla:

```bash
sudo npm install -pm2 -g
```

Iniciamos el bot e inyectamos los comandos con soporte de autocompletado en la API de Discord:

```bash
pm2 start index.js --name "ark-bot"
```

Para asegurarte de que el bot arranque solo al encender el VPS o servidor Debian, genera el script de inicio con:

```bash
pm2 startup systemd
```

*(Copia y pega en la terminal la línea de comando que PM2 te devuelva al final de la pantalla).*

Guarda el estado actual:

```bash
pm2 save
```

### Comandos Útiles de Monitorización en Debian

* Ver logs en tiempo real (Interacciones, altas y registros): `pm2 logs ark-bot`
* Reiniciar el bot de forma limpia (Ej: al editar `dinos-lista.js`): `pm2 restart ark-bot`
* Detener el bot por mantenimiento: `pm2 stop ark-bot`

---

## Licencia

Este proyecto está licenciado bajo la **Licencia Apache 2.0** (Apache License 2.0).

Eres libre de utilizar, modificar y distribuir este software para las necesidades competitivas de tu comunidad, alianza de juego o fines comerciales, bajo las siguientes condiciones:

* **Atribución:** Debes incluir una copia de la licencia original y mantener los avisos de derechos de autor (copyright) del desarrollador original en cualquier copia o subderivado del código.
* **Declaración de Cambios:** Si realizas modificaciones sustanciales en los archivos existentes de este bot, estás obligado a añadir una notificación prominente en los archivos modificados indicando que el código original ha sido alterado.
* **Protección de Patentes:** Esta licencia te otorga una concesión expresa de derechos de patente por parte de los colaboradores, protegiendo al usuario final de litigios legales relacionados con la propiedad intelectual del software.

Para más detalles sobre los términos legales, consulta el archivo `LICENSE` en la raíz de este repositorio o visita [http://www.apache.org/licenses/LICENSE-2.0](https://www.google.com/search?q=http%3A%2F%2Fwww.apache.org%2Flicenses%2FLICENSE-2.0).
