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
import { LucideIcon } from "lucide-react";

type IconMap = Record<string, LucideIcon>;

const iconMap: IconMap = {
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

// Color mapping for categories using the dashboard color system
const colorMap: Record<string, string> = {
  // Finance and work - Vibrant blue
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

  // Family and personal - Vibrant pink/purple
  Baby: "text-pink-600 bg-gradient-to-br from-pink-50 to-pink-100 shadow-pink-100/50",
  Heart:
    "text-rose-600 bg-gradient-to-br from-rose-50 to-rose-100 shadow-rose-100/50",
  HeartHandshake:
    "text-pink-700 bg-gradient-to-br from-pink-100 to-pink-200 shadow-pink-200/60",
  HeartPulse:
    "text-rose-700 bg-gradient-to-br from-rose-100 to-rose-200 shadow-rose-200/60",

  // Shopping and retail - Vibrant green
  ShoppingCart:
    "text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-emerald-100/50",
  ShoppingBag:
    "text-green-600 bg-gradient-to-br from-green-50 to-green-100 shadow-green-100/50",
  Gift: "text-emerald-700 bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-emerald-200/60",
  Shirt:
    "text-green-700 bg-gradient-to-br from-green-100 to-green-200 shadow-green-200/60",

  // Technology - Vibrant indigo
  Smartphone:
    "text-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-indigo-100/50",
  Laptop:
    "text-indigo-700 bg-gradient-to-br from-indigo-100 to-indigo-200 shadow-indigo-200/60",

  // Education - Vibrant purple
  GraduationCap:
    "text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 shadow-purple-100/50",

  // Emergencies - Vibrant red
  AlertTriangle:
    "text-red-600 bg-gradient-to-br from-red-50 to-red-100 shadow-red-100/50",

  // Entertainment - Vibrant orange
  Film: "text-orange-600 bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange-100/50",
  Ticket:
    "text-amber-600 bg-gradient-to-br from-amber-50 to-amber-100 shadow-amber-100/50",
  Palette:
    "text-orange-700 bg-gradient-to-br from-orange-100 to-orange-200 shadow-orange-200/60",

  // Food - Vibrant yellow
  UtensilsCrossed:
    "text-yellow-600 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-yellow-100/50",

  // Home - Vibrant teal
  Home: "text-teal-600 bg-gradient-to-br from-teal-50 to-teal-100 shadow-teal-100/50",
  Building2:
    "text-teal-700 bg-gradient-to-br from-teal-100 to-teal-200 shadow-teal-200/60",
  Armchair:
    "text-teal-600 bg-gradient-to-br from-teal-50 to-teal-100 shadow-teal-100/50",

  // Corporate finance - Elegant slate
  CreditCard:
    "text-slate-700 bg-gradient-to-br from-slate-100 to-slate-200 shadow-slate-200/60",
  Users:
    "text-slate-600 bg-gradient-to-br from-slate-50 to-slate-100 shadow-slate-100/50",

  // Services - Vibrant cyan
  Shield:
    "text-cyan-600 bg-gradient-to-br from-cyan-50 to-cyan-100 shadow-cyan-100/50",
  Scale:
    "text-cyan-700 bg-gradient-to-br from-cyan-100 to-cyan-200 shadow-cyan-200/60",
  Wrench:
    "text-cyan-600 bg-gradient-to-br from-cyan-50 to-cyan-100 shadow-cyan-100/50",

  // Documents - Elegant gray
  FolderOpen:
    "text-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 shadow-gray-100/50",
  FileText:
    "text-gray-700 bg-gradient-to-br from-gray-100 to-gray-200 shadow-gray-200/60",
  MoreHorizontal:
    "text-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 shadow-gray-100/50",

  // Pets - Vibrant emerald
  PawPrint:
    "text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-emerald-100/50",

  // Sports and health - Vibrant lime
  Dumbbell:
    "text-lime-600 bg-gradient-to-br from-lime-50 to-lime-100 shadow-lime-100/50",

  // Others - Vibrant violet
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

export function getIconComponent(iconName: string): LucideIcon {
  if (!iconName) return Hash;
  return iconMap[iconName] || Hash;
}

export function getIconColor(iconName: string): string {
  if (!iconName) return colorMap.Hash;
  return colorMap[iconName] || colorMap.Hash;
}

interface IconProps {
  className?: string;
  size?: number;
  [key: string]: any;
}

export function renderIcon(
  iconName: string,
  props: IconProps = {}
): React.ReactElement {
  const IconComponent = getIconComponent(iconName);
  const defaultColors = getIconColor(iconName);

  // Combine default colors with custom props
  const className = props.className
    ? `${props.className}`
    : `size-4 ${defaultColors.split(" ")[0]}`;

  return React.createElement(IconComponent, {
    ...props,
    className,
  });
}

export function renderIconWithBackground(
  iconName: string,
  props: IconProps = {}
): React.ReactElement {
  const IconComponent = getIconComponent(iconName);
  const colors = getIconColor(iconName);

  // Separate text color from background gradient and shadow
  const parts = colors.split(" ");
  const textColor = parts[0]; // text-color
  const bgGradient = parts.slice(1).join(" "); // bg-gradient-to-br from-x to-y shadow-z

  console.log("renderIconWithBackground:", {
    iconName,
    colors,
    textColor,
    bgGradient,
  }); // Debug

  // Create modern circular container with vibrant gradient and improved shadow
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
