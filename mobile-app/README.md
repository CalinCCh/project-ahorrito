# 📱 Ahorrito Mobile - Aplicación iOS Nativa

Aplicación móvil nativa de Ahorrito desarrollada con **React Native + Expo** para ejecutar en tu iPhone.

## 🚀 Configuración y Instalación

### Prerrequisitos

1. **Node.js** (versión 18 o superior)
2. **npm** o **yarn**
3. **Expo CLI**
4. **iPhone** con la app **Expo Go** instalada

### Instalación

```bash
# 1. Navegar al directorio de la app móvil
cd mobile-app

# 2. Instalar dependencias
npm install

# 3. Instalar Expo CLI globalmente (si no lo tienes)
npm install -g @expo/cli

# 4. Iniciar el servidor de desarrollo
npm start
```

### 📱 Ejecutar en tu iPhone

#### Opción 1: Expo Go (Recomendado para desarrollo)

1. **Descargar Expo Go** desde la App Store en tu iPhone
2. **Ejecutar el comando** `npm start` en tu terminal
3. **Escanear el código QR** que aparece en la terminal con la cámara de tu iPhone
4. **Abrir en Expo Go** cuando aparezca la notificación

#### Opción 2: Build nativo (Para distribución)

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Configurar cuenta de Expo
eas login

# 3. Build para iOS
npm run build:ios

# 4. Seguir las instrucciones para instalar en tu iPhone
```

## 🛠 Estructura del Proyecto

```
mobile-app/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── screens/            # Pantallas de la app
│   │   ├── auth/           # Pantallas de autenticación
│   │   └── main/           # Pantallas principales
│   ├── navigation/         # Configuración de navegación
│   ├── store/             # Estado global con Redux
│   │   └── slices/        # Slices de Redux
│   └── hooks/             # Custom hooks
├── assets/                # Imágenes, fuentes, etc.
├── App.tsx               # Componente principal
├── app.json              # Configuración de Expo
└── package.json          # Dependencias
```

## 🎯 Características

### ✅ Pantallas Implementadas

#### 🔐 Autenticación
- **Pantalla de Bienvenida** - Introducción elegante con gradientes
- **Login** - Autenticación con email/contraseña + OAuth
- **Registro** - Creación de cuenta con validaciones

#### 📊 Dashboard Principal
- **Resumen financiero** - Balance total y estadísticas
- **Tarjetas de balance** - Ingresos, gastos y tendencias
- **Acciones rápidas** - Transferir, agregar, pagar
- **Transacciones recientes** - Lista de movimientos
- **Objetivos de ahorro** - Progreso de metas

#### 💸 Gestión de Transacciones
- **Lista completa** - Todos los movimientos
- **Búsqueda y filtros** - Por tipo, categoría, fecha
- **Resumen visual** - Tarjetas de ingresos/gastos
- **Detalles expandidos** - Información completa

#### 🏦 Cuentas Bancarias
- **Vista de cuentas** - Tarjetas elegantes con gradientes
- **Balance total** - Resumen de todas las cuentas
- **Estados de conexión** - Indicadores visuales
- **Tipos de cuenta** - Corriente, ahorro, crédito, inversión

#### 👤 Perfil de Usuario
- **Información personal** - Avatar y datos del usuario
- **Estado VIP** - Indicadores especiales
- **Estadísticas** - Resumen de actividad
- **Configuración** - Ajustes y preferencias
- **Menús organizados** - Cuenta, finanzas, soporte, legal

### 🎨 Diseño y UX

#### 🌈 Sistema de Colores
- **Primario**: Azul (#3B82F6)
- **Éxito**: Verde (#10B981)
- **Error**: Rojo (#EF4444)
- **Advertencia**: Ámbar (#F59E0B)
- **Neutros**: Grises escalados

#### 📱 Características Nativas
- **Navegación por pestañas** - Bottom tab navigator
- **Navegación en stack** - Para pantallas de autenticación
- **Gradientes lineales** - Diseño moderno y elegante
- **Iconos vectoriales** - Ionicons para consistencia
- **Animaciones suaves** - Transiciones nativas
- **Safe Area** - Compatibilidad con notches de iPhone

#### 🎯 Experiencia de Usuario
- **Onboarding intuitivo** - Flujo de registro simplificado
- **Estados de carga** - Feedback visual durante operaciones
- **Validaciones en tiempo real** - Formularios inteligentes
- **Notificaciones visuales** - Alerts y confirmaciones
- **Persistencia de estado** - Redux para gestión global

## 🔧 Tecnologías Utilizadas

### 📱 Framework y Herramientas
- **React Native**: Framework de desarrollo móvil
- **Expo**: Plataforma para desarrollo y distribución
- **TypeScript**: Tipado estático para mayor robustez
- **React Navigation**: Navegación nativa entre pantallas

### 🗃 Estado y Datos
- **Redux Toolkit**: Gestión de estado global
- **React Redux**: Integración con React
- **AsyncStorage**: Persistencia local de datos

### 🎨 UI y Diseño
- **Expo Linear Gradient**: Gradientes nativos
- **Expo Vector Icons**: Iconografía completa
- **React Native Safe Area**: Manejo de áreas seguras
- **Custom Styling**: Sistema de estilos propio

## 📱 Comandos Disponibles

```bash
# Desarrollo
npm start              # Iniciar servidor de desarrollo
npm run ios           # Abrir en simulador iOS
npm run android       # Abrir en simulador Android

# Builds
npm run build:ios     # Build para iOS
npm run build:android # Build para Android

# Distribución
npm run submit:ios    # Enviar a App Store
npm run submit:android # Enviar a Google Play
```

## 🔒 Seguridad y Autenticación

### 🛡 Características de Seguridad
- **Autenticación JWT** - Tokens seguros para sesiones
- **Validación de formularios** - Prevención de inputs maliciosos
- **Almacenamiento seguro** - Expo SecureStore para datos sensibles
- **Gestión de sesiones** - Auto-logout y renovación de tokens

### 🔐 Flujo de Autenticación
1. **Login/Registro** - Credenciales o OAuth
2. **Validación** - Verificación en backend
3. **Token storage** - Almacenamiento seguro local
4. **Estado global** - Redux mantiene sesión activa
5. **Auto-refresh** - Renovación automática de tokens

## 📊 Estado Global (Redux)

### 🗃 Slices Implementados
- **authSlice** - Autenticación y usuario
- **transactionsSlice** - Gestión de transacciones
- **accountsSlice** - Cuentas bancarias

### 🔄 Acciones Principales
```typescript
// Autenticación
dispatch(loginStart())
dispatch(loginSuccess({ user, token }))
dispatch(logout())

// Transacciones
dispatch(fetchTransactionsStart())
dispatch(addTransaction(transaction))
dispatch(setFilter({ type: 'income' }))

// Cuentas
dispatch(fetchAccountsSuccess(accounts))
dispatch(updateAccountBalance({ id, balance }))
```

## 🚀 Para Ejecutar en tu iPhone

### 📋 Pasos Detallados

1. **Preparar el entorno**:
   ```bash
   cd mobile-app
   npm install
   ```

2. **Iniciar servidor**:
   ```bash
   npm start
   ```

3. **En tu iPhone**:
   - Descargar **Expo Go** desde App Store
   - Escanear QR code con la cámara
   - Abrir en Expo Go

4. **¡Listo!** La app se cargará en tu iPhone

### 🔧 Solución de Problemas

**Si el QR no funciona**:
- Asegúrate de estar en la misma red WiFi
- Usa la opción "tunnel" en Expo CLI
- Verifica que el firewall no bloquee la conexión

**Si hay errores de dependencias**:
```bash
rm -rf node_modules
npm install
```

**Para limpiar caché**:
```bash
expo start --clear
```

## 🎯 Próximas Características

### 🚧 En Desarrollo
- [ ] **Notificaciones push** - Alertas de transacciones
- [ ] **Biometría** - Face ID / Touch ID
- [ ] **Modo offline** - Funcionalidad sin conexión
- [ ] **Sincronización bancaria** - Conexión real con APIs
- [ ] **Categorización IA** - Clasificación automática
- [ ] **Presupuestos** - Límites y alertas de gasto

### 💡 Ideas Futuras
- [ ] **Apple Pay** - Integración de pagos
- [ ] **Widgets iOS** - Información en pantalla de inicio
- [ ] **Siri Shortcuts** - Comandos de voz
- [ ] **Apple Watch** - Companion app
- [ ] **Share Extension** - Compartir gastos desde otras apps

## 📱 Compatibilidad

### 📋 Requisitos iOS
- **iOS 13.0+** - Versión mínima soportada
- **iPhone 7+** - Dispositivos compatibles
- **64GB+** - Espacio de almacenamiento recomendado

### 🎯 Dispositivos Testados
- ✅ iPhone 14 Pro Max
- ✅ iPhone 13
- ✅ iPhone 12 mini
- ✅ iPhone SE (3rd gen)
- ✅ iPad Pro (como iPhone app)

## 🆘 Soporte

### 🔍 Recursos de Ayuda
- **Documentación Expo**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/
- **Redux Toolkit**: https://redux-toolkit.js.org/

### 📞 Contacto
Si tienes problemas ejecutando la app en tu iPhone:
1. Revisa los logs en Expo CLI
2. Verifica la conectividad de red
3. Consulta la documentación oficial
4. Contacta al equipo de desarrollo

---

¡Disfruta de tu aplicación Ahorrito nativa en iPhone! 🎉📱💰