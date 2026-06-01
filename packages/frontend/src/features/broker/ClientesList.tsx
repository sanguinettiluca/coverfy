import { useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listarClientes, crearCliente } from "@/services/clientes.service";
import type { Cliente } from "@/types";
import { escanearCedula } from "@/services/ocr.service";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

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

function NuevoClienteForm({onCreado}: {onCreado: () => void}){
    const [form, setForm] = useState({
        nombres: "", apellidos: "", documento: "", email: "", celular: "", direccion: ""
    });
    const [scanning, setScanning] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const mutation = useMutation({
        mutationFn: () => crearCliente(form),
        onSuccess: () => {
            toast.success("Cliente creado exitosamente!");
            onCreado();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message ?? "Error al crear el cliente")
    });

    const update = (key: string, val: string) => setForm((f) => ({...f, [key]: val}));

    const procesarCedula = async (file: File | undefined) => {
        if(!file){
            return;
        }
        const permitidos = ["image/jpeg", "image/png", "application/pdf"];
        if(!permitidos.includes(file.type)){
            toast.error("Formato no permitido. Usá JPG, PNG o PDF.");
            return;
        }
        setScanning(true);

        try{
            const datos = await escanearCedula(file);

            if(datos.nombres){
                update("nombres", datos.nombres);
            }
            if(datos.apellidos){
                update("apellidos", datos.apellidos);
            }
            if(datos.documento){
                update("documento", datos.documento);
            }
            toast.success("Datos extraidos exitosamente! Recuerde revisar la informacion.");
        }catch{
            toast.error("No se pudieron extraer los datos. Completá manualmente.");
        }finally{
            setScanning(false);
        }
    };

    return (
        <div className="border border-border rounded-lg p-4 bg-card space-y-4">
            <div
                onClick={() => !scanning && fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); procesarCedula(e.dataTransfer.files[0]); }}
                className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 cursor-pointer transition-colors",
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40",
                scanning && "pointer-events-none opacity-60"
                )}
            >
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={(e) => procesarCedula(e.target.files?.[0])}
                />
                {scanning ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Procesando cédula...</p>
                </>
                ) : (
                <>
                    <UploadCloud className="h-5 w-5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground text-center">
                        Arrastrá la cédula o <span className="text-primary font-medium">seleccioná un archivo</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">JPG, PNG o PDF · Opcional</p>
                </>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {[
                    { key: "nombres", label: "Nombres" },
                    { key: "apellidos", label: "Apellidos" },
                    { key: "documento", label: "Documento" },
                    { key: "email", label: "Email" },
                    { key: "celular", label: "Celular" },
                    { key: "direccion", label: "Dirección" }
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
            disabled={mutation.isPending || scanning}
            >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cliente
            </Button>
        </div>
    );
}