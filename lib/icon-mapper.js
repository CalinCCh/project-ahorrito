import React from "react";
import {
  Sparkles,
  Briefcase,
  Baby,
  Shirt,
  Smartphone,
  Heart,
  GraduationCap,
  Laptop,
  AlertTriangle,
  Film,
  Ticket,
  Users,
  CreditCard,
  UtensilsCrossed,
  Armchair,
  Gift,
  ShoppingCart,
  HeartPulse,
  Palette,
  Home,
  Building2,
  TrendingUp,
  Shield,
  LineChart,
  Scale,
  Wrench,
  FolderOpen,
  MoreHorizontal,
  Scissors,
  PawPrint,
  HeartHandshake,
  PiggyBank,
  ShoppingBag,
  Dumbbell,
  Bell,
  FileText,
  Bus,
  Plane,
  Zap,
  Car,
  Hash,
} from "lucide-react";

const iconMap = {
  Sparkles,
  Briefcase,
  Baby,
  Shirt,
  Smartphone,
  Heart,
  GraduationCap,
  Laptop,
  AlertTriangle,
  Film,
  Ticket,
  Users,
  CreditCard,
  UtensilsCrossed,
  Armchair,
  Gift,
  ShoppingCart,
  HeartPulse,
  Palette,
  Home,
  Building2,
  TrendingUp,
  Shield,
  LineChart,
  Scale,
  Wrench,
  FolderOpen,
  MoreHorizontal,
  Scissors,
  PawPrint,
  HeartHandshake,
  PiggyBank,
  ShoppingBag,
  Dumbbell,
  Bell,
  FileText,
  Bus,
  Plane,
  Zap,
  Car,
  Hash,
};

// Mapeo de colores por categoría usando el sistema de colores del dashboard
const colorMap = {
  // Finanzas y trabajo - Azul vibrante
  Sparkles:
    "text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-blue-100/50",
  Briefcase:
    "text-blue-700 bg-gradient-to-br from-blue-100 to-blue-200 shadow-blue-200/60",
  TrendingUp:
    "text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-blue-100/50",
  LineChart:
    "text-blue-700 bg-gradient-to-br from-blue-100 to-blue-200 shadow-blue-200/60",
  PiggyBank:
    "text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-blue-100/50",

  // Familia y personal - Rosa/Morado vibrante
  Baby: "text-pink-600 bg-gradient-to-br from-pink-50 to-pink-100 shadow-pink-100/50",
  Heart:
    "text-rose-600 bg-gradient-to-br from-rose-50 to-rose-100 shadow-rose-100/50",
  HeartHandshake:
    "text-pink-700 bg-gradient-to-br from-pink-100 to-pink-200 shadow-pink-200/60",
  HeartPulse:
    "text-rose-700 bg-gradient-to-br from-rose-100 to-rose-200 shadow-rose-200/60",

  // Compras y retail - Verde vibrante
  ShoppingCart:
    "text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-emerald-100/50",
  ShoppingBag:
    "text-green-600 bg-gradient-to-br from-green-50 to-green-100 shadow-green-100/50",
  Gift: "text-emerald-700 bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-emerald-200/60",
  Shirt:
    "text-green-700 bg-gradient-to-br from-green-100 to-green-200 shadow-green-200/60",

  // Tecnología - Indigo vibrante
  Smartphone:
    "text-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-indigo-100/50",
  Laptop:
    "text-indigo-700 bg-gradient-to-br from-indigo-100 to-indigo-200 shadow-indigo-200/60",

  // Educación - Púrpura vibrante
  GraduationCap:
    "text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 shadow-purple-100/50",

  // Emergencias - Rojo vibrante
  AlertTriangle:
    "text-red-600 bg-gradient-to-br from-red-50 to-red-100 shadow-red-100/50",

  // Entretenimiento - Naranja vibrante
  Film: "text-orange-600 bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange-100/50",
  Ticket:
    "text-amber-600 bg-gradient-to-br from-amber-50 to-amber-100 shadow-amber-100/50",
  Palette:
    "text-orange-700 bg-gradient-to-br from-orange-100 to-orange-200 shadow-orange-200/60",

  // Alimentación - Amarillo vibrante
  UtensilsCrossed:
    "text-yellow-600 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-yellow-100/50",

  // Hogar - Teal vibrante
  Home: "text-teal-600 bg-gradient-to-br from-teal-50 to-teal-100 shadow-teal-100/50",
  Building2:
    "text-teal-700 bg-gradient-to-br from-teal-100 to-teal-200 shadow-teal-200/60",
  Armchair:
    "text-teal-600 bg-gradient-to-br from-teal-50 to-teal-100 shadow-teal-100/50",

  // Finanzas corporativas - Slate elegante
  CreditCard:
    "text-slate-700 bg-gradient-to-br from-slate-100 to-slate-200 shadow-slate-200/60",
  Users:
    "text-slate-600 bg-gradient-to-br from-slate-50 to-slate-100 shadow-slate-100/50",

  // Servicios - Cyan vibrante
  Shield:
    "text-cyan-600 bg-gradient-to-br from-cyan-50 to-cyan-100 shadow-cyan-100/50",
  Scale:
    "text-cyan-700 bg-gradient-to-br from-cyan-100 to-cyan-200 shadow-cyan-200/60",
  Wrench:
    "text-cyan-600 bg-gradient-to-br from-cyan-50 to-cyan-100 shadow-cyan-100/50",

  // Documentos - Gray elegante
  FolderOpen:
    "text-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 shadow-gray-100/50",
  FileText:
    "text-gray-700 bg-gradient-to-br from-gray-100 to-gray-200 shadow-gray-200/60",
  MoreHorizontal:
    "text-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 shadow-gray-100/50",

  // Mascotas - Emerald vibrante
  PawPrint:
    "text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-emerald-100/50",

  // Deportes y salud - Lime vibrante
  Dumbbell:
    "text-lime-600 bg-gradient-to-br from-lime-50 to-lime-100 shadow-lime-100/50",

  // Otros - Violet vibrante
  Scissors:
    "text-violet-600 bg-gradient-to-br from-violet-50 to-violet-100 shadow-violet-100/50",
  Bell: "text-violet-700 bg-gradient-to-br from-violet-100 to-violet-200 shadow-violet-200/60",
  Bus: "text-violet-600 bg-gradient-to-br from-violet-50 to-violet-100 shadow-violet-100/50",
  Plane:
    "text-sky-600 bg-gradient-to-br from-sky-50 to-sky-100 shadow-sky-100/50",
  Zap: "text-yellow-600 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-yellow-100/50",
  Car: "text-violet-700 bg-gradient-to-br from-violet-100 to-violet-200 shadow-violet-200/60",

  // Default
  Hash: "text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 shadow-gray-100/30",
};

export function getIconComponent(iconName) {
  if (!iconName) return Hash;
  return iconMap[iconName] || Hash;
}

export function getIconColor(iconName) {
  if (!iconName) return colorMap.Hash;
  return colorMap[iconName] || colorMap.Hash;
}

export function renderIcon(iconName, props = {}) {
  const IconComponent = getIconComponent(iconName);
  const defaultColors = getIconColor(iconName);

  // Combinar colores por defecto con props personalizadas
  const className = props.className
    ? `${props.className}`
    : `size-4 ${defaultColors.split(" ")[0]}`;

  return React.createElement(IconComponent, {
    ...props,
    className,
  });
}

export function renderIconWithBackground(iconName, props = {}) {
  const IconComponent = getIconComponent(iconName);
  const colors = getIconColor(iconName);

  // Separar el texto color del background gradient y shadow
  const parts = colors.split(" ");
  const textColor = parts[0]; // text-color
  const bgGradient = parts.slice(1).join(" "); // bg-gradient-to-br from-x to-y shadow-z

  console.log("renderIconWithBackground:", {
    iconName,
    colors,
    textColor,
    bgGradient,
  }); // Debug

  // Crear contenedor circular moderno con gradiente más vibrante y sombra mejorada
  const iconClassName = `size-4 ${textColor}`;
  const containerClassName = `flex items-center justify-center w-9 h-9 rounded-full ${bgGradient} border border-white/30 shadow-md hover:shadow-lg transition-all duration-200 group-hover:rotate-2`; // Reverted to w-9 h-9 and removed group-hover:scale-110

  return React.createElement(
    "div",
    {
      className: containerClassName,
    },
    React.createElement(IconComponent, {
      className: iconClassName,
    })
  );
}
