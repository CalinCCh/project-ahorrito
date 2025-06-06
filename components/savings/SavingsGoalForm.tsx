import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Maximum 100 characters"),
  description: z.string().optional(),
  targetAmount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  emoji: z.string().optional(),
  color: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  targetDate: z.date().optional(),
  monthlyContribution: z
    .number()
    .min(0, "Must be a positive number")
    .optional(),
  autoSave: z.enum(["manual", "daily", "weekly", "monthly"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SavingsGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  initialData?: Partial<FormValues>;
  isLoading?: boolean;
}

const categories = [
  { value: "vacation", label: "🏖️ Vacation", emoji: "🏖️" },
  { value: "emergency", label: "🚨 Emergency Fund", emoji: "🚨" },
  { value: "house", label: "🏠 House", emoji: "🏠" },
  { value: "car", label: "🚗 Car", emoji: "🚗" },
  { value: "education", label: "📚 Education", emoji: "📚" },
  { value: "technology", label: "💻 Technology", emoji: "💻" },
  { value: "health", label: "⚕️ Health", emoji: "⚕️" },
  { value: "wedding", label: "💒 Wedding", emoji: "💒" },
  { value: "business", label: "💼 Business", emoji: "💼" },
  { value: "travel", label: "✈️ Travel", emoji: "✈️" },
  { value: "appliances", label: "🔌 Appliances", emoji: "🔌" },
  { value: "sports", label: "⚽ Sports", emoji: "⚽" },
  { value: "other", label: "🎯 Other", emoji: "🎯" },
];

const colors = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
];

export function SavingsGoalForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: SavingsGoalFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      targetAmount: initialData?.targetAmount || 0,
      category: initialData?.category || "",
      emoji: initialData?.emoji || "🎯",
      color: initialData?.color || "blue",
      priority: initialData?.priority || "medium",
      targetDate: initialData?.targetDate,
      monthlyContribution: initialData?.monthlyContribution || 0,
      autoSave: initialData?.autoSave || "manual",
    },
  });
  const handleSubmit = (values: FormValues) => {
    // If a predefined category was selected, use its emoji
    const selectedCat = categories.find((cat) => cat.value === values.category);
    if (selectedCat) {
      values.emoji = selectedCat.emoji;
    }

    onSubmit(values);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    form.setValue("category", value);

    // Auto-select category emoji
    const category = categories.find((cat) => cat.value === value);
    if (category) {
      form.setValue("emoji", category.emoji);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {" "}
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Savings Goal" : "New Savings Goal"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Modify the details of your savings goal"
              : "Create a new savings goal to achieve your financial objectives"}
          </DialogDescription>
        </DialogHeader>{" "}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Vacation in Hawaii" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>Amount in US dollars</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>{" "}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your savings goal..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Category and style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={handleCategoryChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${color.class}`}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">🔴 High</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="low">🟢 Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>{" "}
            {/* Savings configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthlyContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly contribution (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="200"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Amount you plan to save monthly
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target date (optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When you want to achieve this goal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : initialData
                  ? "Update Goal"
                  : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
