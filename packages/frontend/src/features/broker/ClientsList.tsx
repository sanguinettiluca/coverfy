import { useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listClients, createClient } from "@/services/clients.service";
import type { Client } from "@/types";
import { scanIdCard } from "@/services/ocr.service";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface ClientsListProps {
    onViewClient: (clientId: string) => void;
};

export function ClientsList({ onViewClient }: ClientsListProps) {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const searchDebounced = useDebounce(search);

    const { data, isLoading } = useQuery({
        queryKey: ["clients", searchDebounced],
        queryFn: () => listClients(searchDebounced),
    });

    const clients = data?.clients ?? [];
    const total = data?.total ?? 0;

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">

            <div className="bg-card border border-border rounded-xl p-5 w-fit min-w-[180px]">
                <p className="text-xs text-muted-foreground">Total de clientes</p>
                <p className="text-3xl font-bold text-primary mt-1">{total}</p>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Clientes</h2>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground" onClick={() => setShowForm(!showForm)}>
                <Plus className="h-4 w-4" /> Nuevo cliente
                </Button>
            </div>

            {/* Buscador: */}
            <div className="relative">
                <Search className= "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre, documento o email..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {showForm && (
                <NewClientForm
                    onCreated={() => {
                        setShowForm(false);
                        queryClient.invalidateQueries({ queryKey: ["clients"] });
                    }}
                />
            )}

            {clients.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No hay clientes registrados.</p>
            ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                    {clients.map((c: Client) => (
                        <button
                            key={c.id}
                            onClick={() => onViewClient(c.id)}
                            className="w-full flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 text-left transition-colors"
                        >
                            <div>
                                <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                                <p className="text-xs text-muted-foreground">{c.documentNumber} · {c.email}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">Ver →</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function NewClientForm({onCreated}: {onCreated: () => void}){
    const [form, setForm] = useState({
        firstName: "", lastName: "", documentNumber: "", email: "", phone: "", address: ""
    });
    const [scanning, setScanning] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const mutation = useMutation({
        mutationFn: () => createClient(form),
        onSuccess: () => {
            toast.success("Cliente creado exitosamente!");
            onCreated();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message ?? "Error al crear el cliente")
    });

    const update = (key: string, val: string) => setForm((f) => ({...f, [key]: val}));

    const processIdCard = async (file: File | undefined) => {
        if(!file){
            return;
        }
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if(!allowedTypes.includes(file.type)){
            toast.error("Formato no permitido. Usá JPG, PNG o PDF.");
            return;
        }
        setScanning(true);

        try{
            const data = await scanIdCard(file);

            if(data.firstName){
                update("firstName", data.firstName);
            }
            if(data.lastName){
                update("lastName", data.lastName);
            }
            if(data.documentNumber){
                update("documentNumber", data.documentNumber);
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
                onDrop={(e) => { e.preventDefault(); setDragging(false); processIdCard(e.dataTransfer.files[0]); }}
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
                    onChange={(e) => processIdCard(e.target.files?.[0])}
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
                    { key: "firstName", label: "Nombres" },
                    { key: "lastName", label: "Apellidos" },
                    { key: "documentNumber", label: "Documento" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Celular" },
                    { key: "address", label: "Dirección" }
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
