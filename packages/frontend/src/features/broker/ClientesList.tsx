import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listarClientes, crearCliente } from "@/services/clientes.service";
import type { Cliente } from "@/types";

interface ClientesListProps {
    onVerCliente: (clienteId: string) => void;
};

export function ClientesList({ onVerCliente }: ClientesListProps) {
    const queryClient = useQueryClient();
    const [mostrarForm, setMostrarForm] = useState(false);
    const {data: clientes = [], isLoading} = useQuery({
        queryKey: ["clientes"],
        queryFn: listarClientes
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Clientes</h2>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground" onClick={() => setMostrarForm(!mostrarForm)}>
                <Plus className="h-4 w-4" /> Nuevo cliente
                </Button>
            </div>

            {mostrarForm && (
                <NuevoClienteForm
                    onCreado={() => {
                        setMostrarForm(false);
                        queryClient.invalidateQueries({ queryKey: ["clientes"] });
                    }}
                />
            )}

            {clientes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No hay clientes registrados.</p>
            ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                    {clientes.map((c: Cliente) => (
                        <button
                            key={c.id}
                            onClick={() => onVerCliente(c.id)}
                            className="w-full flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 text-left transition-colors"
                        >
                            <div>
                                <p className="text-sm font-medium">{c.nombres} {c.apellidos}</p>
                                <p className="text-xs text-muted-foreground">{c.documento} · {c.email}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">Ver →</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function NuevoClienteForm({ onCreado }: { onCreado: () => void }){
    const [form, setForm] = useState({
        nombres: "", apellidos: "", documento: "", email: "", celular: "", direccion: ""
    });

    const mutation = useMutation({
        mutationFn: () => crearCliente(form),
        onSuccess: () => {
            toast.success("Cliente creado!");
            onCreado();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message ?? "Error al crear el cliente.")
    });

    const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

    return (
        <div className="border border-border rounded-lg p-4 bg-card space-y-3">
            <div className="grid grid-cols-2 gap-3">
                {[
                { key: "nombres", label: "Nombres" },
                { key: "apellidos", label: "Apellidos" },
                { key: "documento", label: "Documento" },
                { key: "email", label: "Email" },
                { key: "celular", label: "Celular" },
                { key: "direccion", label: "Dirección" },
                ].map(({ key, label }) => (
                <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input
                        className="h-8 text-sm"
                        value={(form as any)[key]}
                        onChange={(e) => update(key, e.target.value)}
                    />
                </div>
                ))}
            </div>
            
            <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cliente
            </Button>
        </div>
    );

}