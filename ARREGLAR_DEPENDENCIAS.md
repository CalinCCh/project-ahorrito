# 🔧 ARREGLAR ERROR DE CLERK - Solución Rápida

## 🚨 **Error de conflicto de dependencias Clerk**

Es un problema común con las versiones de @clerk/elements vs @clerk/shared.

## 🚀 **SOLUCIÓN PASO A PASO:**

### 1. **Usar --legacy-peer-deps (Más fácil)**
```bash
# En project-ahorrito/
npm install --legacy-peer-deps
```

### 2. **Si eso no funciona, usar --force**
```bash
npm install --force
```

### 3. **Alternativa: Limpiar caché y reinstalar**
```bash
# Limpiar caché npm
npm cache clean --force

# Reinstalar con legacy
npm install --legacy-peer-deps
```

## 🎯 **DESPUÉS de instalar el proyecto web:**

### **Instalar app móvil:**
```bash
cd mobile-app
npm install
npx expo start --tunnel
```

## 🔧 **Si quieres arreglar las versiones específicas:**

```bash
# Instalar versiones compatibles
npm install @clerk/shared@^3.7.5 --save-exact
npm install @clerk/elements@latest
npm install --legacy-peer-deps
```

## ✅ **Comandos completos para ejecutar:**

```bash
# 1. Arreglar proyecto web
cd D:\react\project-ahorrito
npm install --legacy-peer-deps

# 2. Probar que funciona
npm run dev

# 3. Instalar app móvil
cd mobile-app
npm install

# 4. Ejecutar app móvil
npx expo start --tunnel
```

## 🎉 **Una vez funcionando:**

- ✅ **Proyecto web**: http://localhost:3000
- ✅ **App móvil**: Escanear QR con iPhone

## 🚨 **Si aún hay problemas:**

```bash
# Opción nuclear (limpia todo)
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**El `--legacy-peer-deps` resuelve los conflictos de versiones automáticamente.**