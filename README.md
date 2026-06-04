# ASE_Dino_Bot

Bot de Discord autohospedado para comunidades y tribus competitivas de ARK: Survival Evolved / Ascended. Centraliza el registro y consulta de estadísticas de líneas de crianza puras (HP, Stamina, Melee, Peso) mediante Slash Commands con autocompletado, fichas gráficas con imagen oficial de cada criatura y aislamiento total de datos por servidor.

---

## Características

- **Aislamiento por servidor (Guild Isolation):** Los datos de cada tribu son completamente independientes. Un servidor nunca puede ver ni modificar los registros de otro.
- **Autocompletado inteligente:** Catálogo de más de 125 criaturas oficiales de ARK con búsqueda predictiva en tiempo real.
- **Fichas gráficas:** Cada respuesta incluye un Embed con la imagen oficial de la criatura obtenida de la ARK Wiki.
- **Persistencia con SQLite:** Base de datos local ligera gestionada con `better-sqlite3`. Sin dependencias externas de base de datos.
- **Despliegue con Docker:** Contenedor listo para producción, sin necesidad de instalar Node.js en el host.

---

## Comandos

| Comando | Descripción |
|---|---|
| `/dino-add [criatura] (hp) (stamina) (melee) (peso)` | Registra o actualiza una línea de crianza. Los stats son opcionales y se fusionan con los existentes. |
| `/dino-stats [criatura]` | Muestra la ficha técnica visual de una línea registrada. |
| `/dino-list` | Lista todas las líneas registradas en el servidor actual. |
| `/dino-update [criatura] (hp) (stamina) (melee) (peso)` | Actualiza uno o más stats de una línea existente. |
| `/dino-delete [criatura]` | Elimina permanentemente el registro de una criatura. |

---

## Estructura del Proyecto

```
├── commands/
│   ├── dino-add.js
│   ├── dino-delete.js
│   ├── dino-list.js
│   ├── dino-stats.js
│   └── dino-update.js
├── db.js                # Capa de datos SQLite con aislamiento por guild_id
├── dinos-lista.js       # Catálogo de criaturas y URLs de imágenes oficiales
├── embed.js             # Constructor de Embeds visuales
├── index.js             # Punto de entrada y gestor de interacciones
├── deploy.js            # Script de registro de Slash Commands en la API de Discord
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .env                 # Credenciales (no incluido en el repositorio)
```

---

## Requisitos Previos

- Cuenta en el [Discord Developer Portal](https://discord.com/developers/applications) con una aplicación creada.
- Token del bot y Client ID disponibles.
- Docker y Docker Compose instalados en el servidor host.

---

## Despliegue con Docker (Recomendado)

Este es el método recomendado para cualquier sistema operativo (Linux, Windows Server, macOS).

### 1. Clonar el repositorio

```bash
git clone https://github.com/Flaxtrux/Ark_Line_Bot.git
cd Ark_Line_Bot
```

### 2. Configurar las variables de entorno

```bash
cp .env.example .env
nano .env
```

Rellena el archivo con tus credenciales:

```env
TOKEN=tu_bot_token_aqui
CLIENT_ID=tu_client_id_aqui
```

### 3. Construir e iniciar el contenedor

```bash
sudo docker compose up -d --build
```

### 4. Registrar los Slash Commands en Discord

Este paso solo es necesario la primera vez o cuando cambies la estructura de algún comando:

```bash
sudo docker compose exec -e TOKEN=$(grep TOKEN .env | cut -d '=' -f2 | xargs) ark-bot node deploy.js
```

### 5. Verificar que el bot está corriendo

```bash
sudo docker compose logs -f ark-bot
```

Deberías ver `Bot conectado como ASE_Dino_Bot#XXXX`.

### Comandos de gestión

```bash
# Detener el bot
sudo docker compose down

# Reiniciar tras actualizar archivos
sudo docker compose up -d --build

# Ver logs en tiempo real
sudo docker compose logs -f ark-bot

# Inspeccionar la base de datos
sudo docker compose exec ark-bot node -e \
  "const Database = require('better-sqlite3'); \
   const db = new Database('./dinos.db'); \
   console.table(db.prepare('SELECT * FROM dinos').all());"
```

---

## Despliegue en Debian / Ubuntu sin Docker

Si prefieres correr el bot directamente en el sistema sin contenedores.

### 1. Instalar Node.js 20

```bash
sudo apt update && sudo apt install -y curl git build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Clonar e instalar dependencias

```bash
git clone https://github.com/Flaxtrux/Ark_Line_Bot.git
cd Ark_Line_Bot
npm install
```

### 3. Configurar el entorno

```bash
cp .env.example .env
nano .env
# Rellena TOKEN y CLIENT_ID
```

### 4. Registrar los Slash Commands

```bash
node deploy.js
```

### 5. Iniciar con PM2 (persistencia 24/7)

```bash
sudo npm install -g pm2
pm2 start index.js --name ark-bot
pm2 startup systemd   # Genera el comando para arranque automático al reiniciar
pm2 save
```

### Comandos de gestión con PM2

```bash
pm2 logs ark-bot        # Logs en tiempo real
pm2 restart ark-bot     # Reiniciar tras cambios en el código
pm2 stop ark-bot        # Detener por mantenimiento
pm2 status              # Ver estado de todos los procesos
```

---

## Despliegue en Windows Server

### 1. Instalar Node.js

Descarga el instalador LTS desde [nodejs.org](https://nodejs.org) y ejecútalo. Verifica la instalación:

```powershell
node -v
npm -v
```

### 2. Clonar el repositorio

```powershell
git clone https://github.com/Flaxtrux/Ark_Line_Bot.git
cd Ark_Line_Bot
npm install
```

### 3. Configurar el entorno

Crea un archivo `.env` en la raíz del proyecto con el Bloc de notas o cualquier editor:

```env
TOKEN=tu_bot_token_aqui
CLIENT_ID=tu_client_id_aqui
```

### 4. Registrar los Slash Commands

```powershell
node deploy.js
```

### 5. Iniciar con PM2

```powershell
npm install -g pm2
pm2 start index.js --name ark-bot
pm2 save
pm2 startup
```

Para que PM2 arranque como servicio de Windows al reiniciar el servidor, instala el módulo adicional:

```powershell
npm install -g pm2-windows-startup
pm2-windows-startup install
```

---

## Notas de Producción

- El archivo `dinos.db` se crea automáticamente en la raíz del proyecto al primer arranque.
- En Docker, la base de datos persiste en el volumen `./dinos.db` mapeado en el `docker-compose.yml`. No se pierde al reconstruir el contenedor.
- El bot opera en modo privado. Para añadirlo a un nuevo servidor, el owner debe hacerlo manualmente desde el Developer Portal con el bot en modo no público.
- Los Slash Commands son globales y tardan hasta 1 hora en propagarse a todos los servidores tras un nuevo `deploy.js`.

---

## Licencia

Licenciado bajo la [Apache License 2.0](LICENSE).
