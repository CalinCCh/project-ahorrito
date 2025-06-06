# 🔧 RECUPERAR NODE_MODULES - Guía Rápida

## 🚨 **No te preocupes, es normal y fácil de arreglar**

Borraste `node_modules` pero todos los archivos de código están intactos. Solo necesitas reinstalar las dependencias.

## 🚀 **SOLUCIÓN PASO A PASO:**

### 1. **Reinstalar dependencias del proyecto principal**
```bash
# Ve al directorio principal
cd D:\react\project-ahorrito

# Instalar dependencias del proyecto web
npm install
```

### 2. **Reinstalar dependencias de la app móvil**
```bash
# Ve al directorio móvil
cd mobile-app

# Instalar dependencias de la app móvil
npm install
```

### 3. **Verificar que todo funciona**
```bash
# Probar proyecto web (desde project-ahorrito/)
npm run dev

# Probar app móvil (desde mobile-app/)
npx expo start --tunnel
```

## ⏱ **Tiempo estimado: 5-10 minutos**

La reinstalación es automática porque `package.json` y `package-lock.json` tienen toda la información necesaria.

## 📋 **Comandos completos:**

```bash
# 1. Proyecto principal
cd D:\react\project-ahorrito
npm install

# 2. App móvil  
cd mobile-app
npm install

# 3. Ejecutar app móvil
npx expo start --tunnel
```

## ✅ **Una vez reinstalado:**

**Proyecto web:**
- `npm run dev` → http://localhost:3000

**App móvil:**
- `npx expo start --tunnel` → Escanear QR con iPhone

## 🎯 **Todo volverá a funcionar exactamente igual**

- ✅ Código intacto
- ✅ Configuración preservada  
- ✅ App móvil arreglada
- ✅ Proyecto web operativo

**Solo ejecuta los comandos de arriba y en unos minutos todo estará funcionando perfectamente.**