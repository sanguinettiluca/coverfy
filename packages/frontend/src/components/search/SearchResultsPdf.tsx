import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import type { Client, Policy, SearchMode } from "./search.type";
import { TIPO_LABEL, ESTADO_LABEL } from "./search.type";

const styles = StyleSheet.create({
    page: { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
    title: { fontSize: 15, fontFamily: "Helvetica-Bold", marginBottom: 4 },
    sub: { fontSize: 9, color: "#6b7280", marginBottom: 14 },
    row: { flexDirection: "row", borderBottom: "0.5 solid #e5e7eb", paddingVertical: 6 },
    headerRow: { flexDirection: "row", borderBottom: "1 solid #1a1a1a", paddingBottom: 6, marginBottom: 2 },
    headerCell: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#6b7280" },
    cell: { fontSize: 9 },
    footer: {
        position: "absolute", bottom: 16, left: 28, right: 28,
        fontSize: 7, color: "#9ca3af", textAlign: "center",
    },
});

const formatFecha = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-UY") : "-";

const formatMoney = (value?: number | null) =>
    value != null ? `$ ${value.toFixed(2)}` : "-";

const ClientsPdfDoc = ({ clientes }: { clientes: Client[] }) => (
    <Document title="Listado de Clientes">
        <Page size="A4" style={styles.page} orientation="landscape">
            <Text style={styles.title}>Listado de Clientes</Text>
            <Text style={styles.sub}>{clientes.length} resultado(s)</Text>

            <View style={styles.headerRow}>
                <Text style={[styles.headerCell, { width: "25%" }]}>Nombre</Text>
                <Text style={[styles.headerCell, { width: "15%" }]}>Cédula</Text>
                <Text style={[styles.headerCell, { width: "20%" }]}>Teléfono</Text>
                <Text style={[styles.headerCell, { width: "25%" }]}>Email</Text>
                <Text style={[styles.headerCell, { width: "15%" }]}>Alta</Text>
            </View>

            {clientes.map((c) => (
                <View style={styles.row} key={c.id} wrap={false}>
                    <Text style={[styles.cell, { width: "25%" }]}>{c.firstName} {c.lastName}</Text>
                    <Text style={[styles.cell, { width: "15%" }]}>{c.documentNumber}</Text>
                    <Text style={[styles.cell, { width: "20%" }]}>{c.phone}</Text>
                    <Text style={[styles.cell, { width: "25%" }]}>{c.email}</Text>
                    <Text style={[styles.cell, { width: "15%" }]}>{formatFecha(c.createdAt)}</Text>
                </View>
            ))}

            <Text
                style={styles.footer}
                render={({ pageNumber, totalPages }) =>
                    `Generado el ${new Date().toLocaleDateString("es-UY")} · Página ${pageNumber} de ${totalPages}`
                }
                fixed
            />
        </Page>
    </Document>
);

const PoliciesPdfDoc = ({ polizas }: { polizas: Policy[] }) => (
    <Document title="Listado de Pólizas">
        <Page size="A4" style={styles.page} orientation="landscape">
            <Text style={styles.title}>Listado de Pólizas</Text>
            <Text style={styles.sub}>{polizas.length} resultado(s)</Text>

            <View style={styles.headerRow}>
                <Text style={[styles.headerCell, { width: "13%" }]}>N° Póliza</Text>
                <Text style={[styles.headerCell, { width: "13%" }]}>Referencia</Text>
                <Text style={[styles.headerCell, { width: "13%" }]}>Tipo</Text>
                <Text style={[styles.headerCell, { width: "12%" }]}>Estado</Text>
                <Text style={[styles.headerCell, { width: "22%" }]}>Cliente</Text>
                <Text style={[styles.headerCell, { width: "14%" }]}>Vencimiento</Text>
                <Text style={[styles.headerCell, { width: "13%" }]}>Monto</Text>
            </View>

            {polizas.map((p) => (
                <View style={styles.row} key={p.id} wrap={false}>
                    <Text style={[styles.cell, { width: "13%" }]}>{p.policyNumber}</Text>
                    <Text style={[styles.cell, { width: "13%" }]}>{p.referenceNumber || "-"}</Text>
                    <Text style={[styles.cell, { width: "13%" }]}>{TIPO_LABEL[p.insuranceType] ?? p.insuranceType}</Text>
                    <Text style={[styles.cell, { width: "12%" }]}>{p.status ? (ESTADO_LABEL[p.status] ?? p.status) : "-"}</Text>
                    <Text style={[styles.cell, { width: "22%" }]}>
                        {p.client ? `${p.client.firstName} ${p.client.lastName}` : "-"}
                    </Text>
                    <Text style={[styles.cell, { width: "14%" }]}>{formatFecha(p.expirationDate)}</Text>
                    <Text style={[styles.cell, { width: "13%" }]}>{formatMoney(p.totalAmount)}</Text>
                </View>
            ))}

            <Text
                style={styles.footer}
                render={({ pageNumber, totalPages }) =>
                    `Generado el ${new Date().toLocaleDateString("es-UY")} · Página ${pageNumber} de ${totalPages}`
                }
                fixed
            />
        </Page>
    </Document>
);

type Props = {
    mode: SearchMode;
    clientes: Client[];
    polizas: Policy[];
};

const SearchResultsPdfButton = ({ mode, clientes, polizas }: Props) => {
    const document = mode === "clients"
        ? <ClientsPdfDoc clientes={clientes} />
        : <PoliciesPdfDoc polizas={polizas} />;

    const fileName = mode === "clients"
        ? `clientes-${new Date().toISOString().slice(0, 10)}.pdf`
        : `polizas-${new Date().toISOString().slice(0, 10)}.pdf`;

    const disabled = mode === "clients" ? clientes.length === 0 : polizas.length === 0;

    if (disabled) {
        return (
            <button type="button" className="twofa-status-btn" disabled>
                <Download size={15} />
                Exportar a PDF
            </button>
        );
    }

    return (
        <PDFDownloadLink document={document} fileName={fileName} className="twofa-status-btn">
            {({ loading }) => (
                <>
                    <Download size={15} />
                    {loading ? "Generando..." : "Exportar a PDF"}
                </>
            )}
        </PDFDownloadLink>
    );
};

export default SearchResultsPdfButton;