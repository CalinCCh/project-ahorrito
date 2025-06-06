import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { AmountInput } from "@/components/forms/AmountInput";

const formSchema = z.object({
  type: z.enum(["manual", "auto", "transfer"]),
  amount: z.string().min(1, "El monto es requerido"),
  source: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ContributionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: {
    goalId: string;
    amount: number;
    type?: string;
    source?: string;
    notes?: string;
  }) => void;
  goalId: string;
  isLoading?: boolean;
}

export function ContributionForm({
  isOpen,
  onClose,
  onSubmit,
  goalId,
  isLoading = false,
}: ContributionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "manual",
      amount: "",
      source: "",
      notes: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    const amount = parseFloat(values.amount.replace(/[^0-9.-]/g, ""));

    onSubmit({
      goalId,
      amount,
      type: values.type,
      source: values.source || undefined,
      notes: values.notes || undefined,
    });

    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>💰 Agregar Contribución</DialogTitle>
          <DialogDescription>
            Registra una nueva contribución a tu meta de ahorro
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Monto */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto de la contribución</FormLabel>
                  <FormControl>
                    <AmountInput
                      placeholder="0.00"
                      value={field.value}
                      onChange={(value) => field.onChange(value || "")}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Monto que deseas contribuir a esta meta
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de contribución */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de contribución</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">📝 Manual</SelectItem>
                      <SelectItem value="auto">⚡ Automática</SelectItem>
                      <SelectItem value="transfer">💸 Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Especifica cómo se realizó esta contribución
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fuente del dinero */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuente (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Sueldo, bonificación, venta..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    De dónde proviene este dinero
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Añade cualquier comentario sobre esta contribución..."
                      className="min-h-[80px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Información adicional sobre esta contribución
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Agregar Contribución"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
