"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  CreditCard,
  Tag,
  ChevronLeft,
  ChevronRight,
  Trash,
  ShoppingCart,
  Home,
  Car,
  Smartphone,
  Heart,
  UtensilsCrossed
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ColumnDef, Row, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useConfirm } from "@/hooks/use-confirm";

// Import the icon mapper with colors
import { renderIconWithBackground } from "@/lib/icon-mapper";

// Interface compatible with DataTable for transactions
export interface MobileDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey: string;
  onDelete: (rows: Row<TData>[]) => void;
  disabled?: boolean;
  initialFilterValue?: string;
  onSync?: () => Promise<void>;
  isSyncing?: boolean;
  lastSynced?: Date | null;
  syncStatus?: string | null;
  syncProgress?: {
    current: number;
    total: number;
  } | null;
  hasLinkedBankAccount?: boolean;
  isAllAccountsView?: boolean;
  isUnifiedContainer?: boolean;
}

// Legacy interface for backward compatibility
interface LegacyMobileDataTableProps {
  data: any[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onItemSelect?: (item: any) => void;
  onItemEdit?: (item: any) => void;
  onItemDelete?: (item: any) => void;
  onItemView?: (item: any) => void;
  renderMobileCard: (item: any, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

type MobileDataTableAllProps<TData, TValue> = MobileDataTableProps<TData, TValue> | LegacyMobileDataTableProps;

function isLegacyProps(props: any): props is LegacyMobileDataTableProps {
  return 'renderMobileCard' in props;
}

export function MobileDataTable<TData, TValue>(props: MobileDataTableAllProps<TData, TValue>) {
  if (isLegacyProps(props)) {
    return <LegacyMobileDataTable {...props} />;
  }
  
  return <TransactionsMobileDataTable {...props} />;
}

// Helper function to get category icon and name
function getCategoryInfo(transaction: any) {
  console.log("Transaction data:", transaction); // Debug
  
  // Try different ways to get category info
  let categoryName = null;
  let iconName = null;
  
  // Check for userCategory first
  if (transaction.userCategory) {
    categoryName = transaction.userCategory.name || transaction.userCategory;
    iconName = transaction.userCategory.iconName;
    console.log("Found userCategory:", { categoryName, iconName });
  }
  // Then check for predefinedCategory
  else if (transaction.predefinedCategory) {
    categoryName = transaction.predefinedCategory.name || transaction.predefinedCategory;
    iconName = transaction.predefinedCategory.iconName;
    console.log("Found predefinedCategory:", { categoryName, iconName });
  }
  // Fallback to direct category field
  else if (transaction.category) {
    categoryName = transaction.category;
    console.log("Found direct category:", categoryName);
  }
  
  // If no icon name found, try to map from category name
  if (!iconName && categoryName) {
    // Simple mapping for common categories
    const categoryIconMap: Record<string, string> = {
      'food': 'UtensilsCrossed',
      'shopping': 'ShoppingCart',
      'transport': 'Car',
      'home': 'Home',
      'technology': 'Smartphone',
      'health': 'Heart',
      'entertainment': 'Film',
      'groceries': 'ShoppingCart',
      'restaurant': 'UtensilsCrossed',
      'gas': 'Car',
      'utilities': 'Home',
      'phone': 'Smartphone',
      'internet': 'Smartphone',
      'medical': 'Heart',
      'pharmacy': 'Heart',
      'clothing': 'Shirt',
      'education': 'GraduationCap',
      'travel': 'Plane',
      'fitness': 'Dumbbell',
      'pets': 'PawPrint',
      'bills': 'FileText',
      'insurance': 'Shield',
      'salary': 'Briefcase',
      'investment': 'TrendingUp',
    };
    
    const lowerCategoryName = categoryName.toLowerCase();
    iconName = categoryIconMap[lowerCategoryName] || 'Hash';
    console.log("Mapped category to icon:", { categoryName, iconName });
  }
  
  return {
    categoryName: categoryName || null,
    iconName: iconName || 'Hash'
  };
}

// New component for transactions
function TransactionsMobileDataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  onDelete,
  disabled,
  initialFilterValue = "",
  onSync,
  isSyncing = false,
  lastSynced = null,
  syncStatus = null,
  syncProgress = null,
  hasLinkedBankAccount = false,
  isAllAccountsView = false,
  isUnifiedContainer = false,
}: MobileDataTableProps<TData, TValue>) {
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to perform a bulk delete."
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialFilterValue
      ? [
          {
            id: filterKey,
            value: initialFilterValue,
          },
        ]
      : []
  );
  const [rowSelection, setRowSelection] = React.useState({});

  // Update filter when initialFilterValue changes
  React.useEffect(() => {
    if (initialFilterValue !== undefined) {
      setColumnFilters(
        initialFilterValue
          ? [
              {
                id: filterKey,
                value: initialFilterValue,
              },
            ]
          : []
      );
    }
  }, [initialFilterValue, filterKey]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10, // More items per page for mobile
      },
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ConfirmDialog />
      
      {/* Delete button when items selected - mobile optimized */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex-shrink-0 p-3 bg-blue-50 border-b border-blue-200">
          <Button
            disabled={disabled}
            size="sm"
            variant="destructive"
            className="w-full text-xs"
            onClick={async () => {
              const ok = await confirm();
              if (ok) {
                onDelete(table.getFilteredSelectedRowModel().rows);
                table.resetRowSelection();
              }
            }}
          >
            <Trash className="size-4 mr-2" />
            Delete ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        </div>
      )}

      {/* Mobile optimized transaction cards */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {table.getRowModel().rows?.length ? (
          <div className="space-y-2">
            {table.getRowModel().rows.map((row) => {
              const transaction = row.original as any;
              const isSelected = row.getIsSelected();
              
              // Get category info with improved logic
              const { categoryName, iconName } = getCategoryInfo(transaction);
              
              console.log("Rendering transaction:", { 
                payee: transaction.payee, 
                categoryName, 
                iconName
              });
              
              return (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "bg-white rounded-lg border p-3 transition-all duration-200",
                    isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                  )}
                  onClick={() => row.toggleSelected()}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Icon with color background like desktop */}
                        <div className="flex-shrink-0 scale-75">
                          {renderIconWithBackground(iconName)}
                        </div>
                        
                        <div className="flex flex-col flex-1 min-w-0">
                          <h3 className="font-medium text-slate-800 truncate text-sm">
                            {transaction.payee}
                          </h3>
                          {categoryName && (
                            <span className="text-xs text-slate-500 truncate">
                              {categoryName}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.date)}
                          </span>
                          <span className={cn(
                            "text-sm font-semibold",
                            transaction.amount > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {transaction.amount > 0 ? "+" : ""}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        
                        {isAllAccountsView && transaction.account && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <CreditCard className="w-3 h-3" />
                            {transaction.account}
                          </div>
                        )}

                        {/* Notes if available */}
                        {transaction.notes && (
                          <div className="text-xs text-slate-500 italic truncate">
                            "{transaction.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => row.toggleSelected()}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-800 mb-1">No transactions found</h3>
              <p className="text-xs text-slate-500">Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile pagination */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 bg-gray-50 border-t">
        <div className="text-xs text-gray-600">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} selected
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-2 text-xs"
          >
            <ChevronLeft className="size-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 px-2 text-xs"
          >
            <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Legacy component for backward compatibility
function LegacyMobileDataTable({
  data,
  searchValue = "",
  onSearchChange,
  onItemSelect,
  onItemEdit,
  onItemDelete,
  onItemView,
  renderMobileCard,
  emptyState,
  isLoading = false,
  title,
  description,
  className,
}: LegacyMobileDataTableProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const filteredData = data.filter((item) => {
    if (!searchValue) return true;
    return Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  const DefaultEmptyState = () => (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
        <Search className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-800 mb-2">No data found</h3>
      <p className="text-slate-500 text-sm max-w-sm mx-auto">
        {searchValue
          ? "No items match your search criteria"
          : "There are no items to display"}
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      {(title || description || onSearchChange) && (
        <div className="mb-4 space-y-4">
          {(title || description) && (
            <div>
              {title && (
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm sm:text-base text-slate-600">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Search and Filters */}
          {onSearchChange && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 mobile-input"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data List */}
      {filteredData.length === 0 ? (
        emptyState || <DefaultEmptyState />
      ) : (
        <div className="space-y-3">
          {filteredData.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="relative"
            >
              {renderMobileCard(item, index)}
            </motion.div>
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredData.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Showing {filteredData.length} of {data.length} items
            {searchValue && (
              <span className="ml-1">
                for "{searchValue}"
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// Utility components (keeping for backward compatibility)
export function MobileCardActions({
  onView,
  onEdit,
  onDelete,
  className,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", className)}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MobileCardHeader({
  title,
  subtitle,
  badge,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between mb-3", className)}>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-800 truncate text-sm sm:text-base">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-3">
        {badge}
        {actions}
      </div>
    </div>
  );
}

export function MobileCardRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between py-1", className)}>
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
      </div>
      <div className="text-xs sm:text-sm font-medium text-slate-800">
        {value}
      </div>
    </div>
  );
}