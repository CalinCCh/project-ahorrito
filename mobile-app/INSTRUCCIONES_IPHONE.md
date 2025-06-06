# 📱 CÓMO EJECUTAR AHORRITO EN TU IPHONE

## 🚀 Guía Paso a Paso (Muy Fácil)

### PASO 1: Preparar tu iPhone
1. **Descargar Expo Go** desde la App Store
   - Abre App Store en tu iPhone
   - Busca "Expo Go"
   - Descarga e instala la app gratuita

### PASO 2: Preparar tu computadora
```bash
# 1. Abrir terminal/cmd y navegar al proyecto
cd mobile-app

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Instalar Expo CLI globalmente (solo la primera vez)
npm install -g @expo/cli
```

### PASO 3: Iniciar la aplicación
```bash
# En la terminal, dentro de mobile-app/
npm start
```

Verás algo así:
```
Metro waiting on exp://192.168.1.100:8081
› Press s │ switch to development build
› Press a │ open Android
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands

📱 To open on iOS device, scan the QR code above with Expo Go (Android) or the Camera app (iOS).
```

### PASO 4: Conectar tu iPhone
**Opción A: Escanear QR (Más fácil)**
1. Asegúrate que tu iPhone y computadora estén en la **misma red WiFi**
2. Abre la **cámara** de tu iPhone
3. **Escanea el código QR** que aparece en la terminal
4. Toca la notificación "Abrir en Expo Go"
5. ¡La app se cargará en tu iPhone!

**Opción B: Si el QR no funciona**
```bash
# En la terminal, presiona 't' para tunnel mode
t
# Luego escanea el nuevo QR que aparece
```

### PASO 5: ¡Disfruta la app!
- La aplicación se abrirá automáticamente
- Podrás navegar por todas las pantallas
- Los cambios se actualizan en tiempo real

## 🔧 Solución de Problemas

### ❌ "No se puede conectar"
**Solución:**
1. Verifica que estés en la misma WiFi
2. Usa tunnel mode:
   ```bash
   npm start --tunnel
   ```

### ❌ "Error de dependencias"
**Solución:**
```bash
# Limpiar e instalar de nuevo
rm -rf node_modules
npm install
npm start
```

### ❌ "QR no funciona"
**Solución:**
1. Presiona `t` en la terminal para tunnel mode
2. O presiona `c` para mostrar las opciones de conexión
3. O usa la URL directa en Expo Go

### ❌ "App se cierra"
**Solución:**
```bash
# Limpiar caché
npm start --clear
```

## 📱 Verificar Conexión

### Tu iPhone y PC deben estar:
- ✅ En la misma red WiFi
- ✅ Sin VPN activa
- ✅ Sin firewall bloqueando puertos

### Para verificar la red:
**En iPhone:** Configuración → WiFi → Ver nombre de red
**En PC Windows:** `ipconfig` en cmd
**En PC Mac/Linux:** `ifconfig` en terminal

## 🎯 Comandos Útiles

```bash
# Iniciar app
npm start

# Limpiar caché
npm start --clear

# Modo tunnel (si hay problemas de red)
npm start --tunnel

# Ver en simulador iOS (si tienes Xcode)
npm run ios

# Reload app (presionar 'r' en terminal)
r

# Abrir dev menu (presionar 'd' en terminal)
d
```

## 📲 Una vez funcionando:

### En tu iPhone verás:
1. **Pantalla de Bienvenida** - Diseño elegante azul
2. **Login/Registro** - Crear cuenta o iniciar sesión
3. **Dashboard** - Resumen financiero completo
4. **Pestañas inferiores:**
   - 🏠 Inicio (Dashboard)
   - 📝 Movimientos (Transacciones)
   - 💳 Cuentas (Bancarias)
   - 👤 Perfil (Usuario)

### Funciones que puedes probar:
- ✅ Registrarte con email ficticio
- ✅ Navegar entre pantallas
- ✅ Ver transacciones simuladas
- ✅ Gestionar cuentas bancarias
- ✅ Configurar tu perfil

## 🆘 ¿Necesitas Ayuda?

### Si nada funciona:
1. **Asegúrate de tener Node.js instalado** (versión 18+)
2. **Verifica que tengas npm funcionando** (`npm --version`)
3. **Reinicia tanto el iPhone como la computadora**
4. **Prueba con hotspot del móvil** en lugar de WiFi casa

### Logs de error:
- En la terminal verás cualquier error
- En Expo Go: sacude el iPhone → "Show Dev Menu" → "Debug"

## 🎉 ¡Listo!

Una vez que funcione, tendrás la aplicación Ahorrito corriendo nativamente en tu iPhone con:
- ✅ Navegación nativa iOS
- ✅ Diseño adaptado a tu pantalla
- ✅ Todas las funciones financieras
- ✅ Actualizaciones en tiempo real mientras desarrollas

**¡La app se comportará como una app nativa real de la App Store!** 📱✨