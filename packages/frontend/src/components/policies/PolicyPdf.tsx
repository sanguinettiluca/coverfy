import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFDownloadLink,
} from "@react-pdf/renderer";
import { Download } from "lucide-react";

type InsuranceType =
    | "VEHICLE"
    | "TRIP"
    | "RENTAL"
    | "HOME"
    | "BUSINESS"
    | "LIABILITY"
    | "BOND"
    | "LIFE"
    | "OTHER";

type PolicyStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";
type PaymentMethod = "Cash" | "Credit" | "Transfer" | "Debit";

type Coverage = {
    id: string;
    name: string;
    companyId: string;
    insuranceType: InsuranceType;
};

type Company = {
    id: string;
    name: string;
    commissionRate: number;
    brokerId: string;
    createdAt: string;
    coverages: Coverage[];
};

type Policy = {
    id: string;
    policyNumber: string;
    referenceNumber?: string | null;
    insuranceType: InsuranceType;
    status?: PolicyStatus | null;
    startDate?: string | null;
    expirationDate?: string | null;
    totalAmount?: number | null;
    installments?: number | null;
    paymentMethod?: PaymentMethod | null;
    companyId: string;
    coverageId?: string | null;
    broker?: { id: string; name: string; role: string } | null;
    client?: { id: string; firstName: string; lastName: string } | null;
    liabilityDetails?: { activity: string; coverageLimit: number } | null;
    bondDetails?: { bondType: string; guaranteedAmount?: number | null; beneficiary: string } | null;
    lifeDetails?: { insuredAmount?: number | null; beneficiary: string } | null;
    otherDetails?: { description: string } | null;
    rentalDetails?: { address: string; propertyType: string; rentAmount: number } | null;
    businessDetails?: { businessName: string; industry: string; address: string } | null;
    homeDetails?: { address: string; constructionType: string; squareMeters?: number | null; propertyValue: number } | null;
    vehicleDetails?: { brand: string; model: string; year: number; licensePlate: string; registrationNumber: string; chassisNumber: string; engineNumber: string } | null;
    tripDetails?: { destination: string; departureDate: string; returnDate: string; passengers: number } | null;
};

type PolicyPDFProps = {
    poliza: Policy;
    compania: Company | null;
};


const formatMonto = (monto?: number | null) =>
    monto != null ? `$${monto.toFixed(2)}` : "-";

const formatFecha = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-UY") : "-";

const formatTexto = (valor?: string | null) =>
    valor && valor.trim() !== "" ? valor : "-";



const styles = StyleSheet.create({
    page: {
        padding: 32,
        fontSize: 10,
        fontFamily: "Helvetica",
        color: "#1a1a1a",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        borderBottom: "2 solid #1a1a1a",
        paddingBottom: 12,
    },
    numeroPoliza: {
        fontSize: 18,
        fontFamily: "Helvetica-Bold",
    },
    tipoSeguro: {
        fontSize: 10,
        color: "#555555",
        marginTop: 2,
    },
    badge: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 4,
        color: "#ffffff",
    },
    badgeActiva: { backgroundColor: "#16a34a" },
    badgeVencida: { backgroundColor: "#dc2626" },
    badgeSuspendida: { backgroundColor: "#d97706" },
    badgePendiente: { backgroundColor: "#6b7280" },
    badgeDefault: { backgroundColor: "#6b7280" },
    sectionTitle: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        marginTop: 14,
        marginBottom: 6,
        color: "#1a1a1a",
        borderBottom: "1 solid #d1d5db",
        paddingBottom: 3,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    field: {
        width: "50%",
        marginBottom: 8,
        paddingRight: 10,
    },
    fieldFull: {
        width: "100%",
        marginBottom: 8,
        paddingRight: 10,
    },
    label: {
        fontSize: 8,
        color: "#6b7280",
        marginBottom: 2,
        textTransform: "uppercase",
    },
    value: {
        fontSize: 10,
        color: "#1a1a1a",
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 32,
        right: 32,
        fontSize: 8,
        color: "#9ca3af",
        textAlign: "center",
        borderTop: "1 solid #e5e7eb",
        paddingTop: 8,
    },
});

const getBadgeStyle = (estado?: string | null) => {
    switch (estado?.trim().toUpperCase()) {
        case "ACTIVE":
            return styles.badgeActiva;
        case "EXPIRED":
        case "CANCELLED":
            return styles.badgeVencida;
        case "SUSPENDED":
            return styles.badgeSuspendida;
        default:
            return styles.badgeDefault;
    }
};

// ---------- Campo reutilizable ----------

const Field = ({ label, value, full = false }: { label: string; value: string; full?: boolean }) => (
    <View style={full ? styles.fieldFull : styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

// ---------- Documento PDF ----------

export const PolicyPDFDocument = ({ poliza, compania }: PolicyPDFProps) => {
    const cobertura = compania?.coverages.find((c) => c.id === poliza.coverageId);

    return (
        <Document title={`Poliza ${poliza.policyNumber}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.numeroPoliza}>{poliza.policyNumber}</Text>
                        <Text style={styles.tipoSeguro}>{poliza.insuranceType}</Text>
                    </View>
                    {poliza.status && (
                        <Text style={[styles.badge, getBadgeStyle(poliza.status)]}>
                            {poliza.status}
                        </Text>
                    )}
                </View>

                <View style={styles.grid}>
                    <Field label="Número de Referencia" value={formatTexto(poliza.referenceNumber)} />
                    <Field label="Método de Pago" value={poliza.paymentMethod ?? "-"} />
                    <Field label="Fecha de Inicio" value={formatFecha(poliza.startDate)} />
                    <Field label="Fecha de Vencimiento" value={formatFecha(poliza.expirationDate)} />
                    <Field label="Monto Total" value={formatMonto(poliza.totalAmount)} />
                    <Field label="Cuotas" value={poliza.installments != null ? String(poliza.installments) : "-"} />
                    <Field
                        label="Cliente"
                        value={poliza.client ? `${poliza.client.firstName} ${poliza.client.lastName}` : "-"}
                    />
                    <Field label="Broker" value={poliza.broker?.name ?? "-"} />
                    <Field label="Compañía" value={compania?.name ?? "-"} />
                    <Field
                        label="Comisión"
                        value={compania?.commissionRate != null ? `${compania.commissionRate}%` : "-"}
                    />
                    <Field label="Cobertura" value={cobertura?.name ?? "-"} />
                </View>

                {poliza.liabilityDetails && (
                    <>
                        <Text style={styles.sectionTitle}>Responsabilidad Civil</Text>
                        <View style={styles.grid}>
                            <Field label="Actividad" value={poliza.liabilityDetails.activity} />
                            <Field
                                label="Límite de Cobertura"
                                value={formatMonto(poliza.liabilityDetails.coverageLimit)}
                            />
                        </View>
                    </>
                )}

                {poliza.bondDetails && (
                    <>
                        <Text style={styles.sectionTitle}>Fianza</Text>
                        <View style={styles.grid}>
                            <Field label="Tipo de Fianza" value={poliza.bondDetails.bondType} />
                            <Field
                                label="Monto Garantizado"
                                value={formatMonto(poliza.bondDetails.guaranteedAmount)}
                            />
                            <Field label="Beneficiario" value={poliza.bondDetails.beneficiary} full />
                        </View>
                    </>
                )}

                {poliza.lifeDetails && (
                    <>
                        <Text style={styles.sectionTitle}>Vida</Text>
                        <View style={styles.grid}>
                            <Field label="Suma Asegurada" value={formatMonto(poliza.lifeDetails.insuredAmount)} />
                            <Field label="Beneficiario" value={poliza.lifeDetails.beneficiary} />
                        </View>
                    </>
                )}

                {poliza.otherDetails && (
                    <>
                        <Text style={styles.sectionTitle}>Otros</Text>
                        <View style={styles.grid}>
                            <Field label="Descripción" value={poliza.otherDetails.description} full />
                        </View>
                    </>
                )}

                {poliza.rentalDetails && (
                    <>
                        <Text style={styles.sectionTitle}>Alquiler</Text>
                        <View style={styles.grid}>
                            <Field label="Dirección" value={poliza.rentalDetails.address} full />
                            <Field label="Tipo de Inmueble" value={poliza.rentalDetails.propertyType} />
                            <Field label="Valor de Alquiler" value={formatMonto(poliza.rentalDetails.rentAmount)} />
                        </View>
                    </>
                )}

                {poliza.businessDetails && (
                    <>
                        <Text style={styles.sectionTitle}>Comercio</Text>
                        <View style={styles.grid}>
                            <Field label="Razón Social" value={poliza.businessDetails.businessName} />
                            <Field label="Rubro" value={poliza.businessDetails.industry} />
                            <Field label="Dirección" value={poliza.businessDetails.address} full />
                        </View>
                    </>
                )}

                {poliza.homeDetails && (
                    <>
                        <Text style={styles.sectionTitle}>Hogar</Text>
                        <View style={styles.grid}>
                            <Field label="Dirección" value={poliza.homeDetails.address} full />
                            <Field label="Tipo de Construcción" value={poliza.homeDetails.constructionType} />
                            <Field
                                label="Metros Cuadrados"
                                value={poliza.homeDetails.squareMeters != null ? String(poliza.homeDetails.squareMeters) : "-"}
                            />
                            <Field label="Valor de la Propiedad" value={formatMonto(poliza.homeDetails.propertyValue)} />
                        </View>
                    </>
                )}

                {poliza.vehicleDetails && (
                    <>
                        <Text style={styles.sectionTitle}>Vehículo</Text>
                        <View style={styles.grid}>
                            <Field label="Marca" value={poliza.vehicleDetails.brand} />
                            <Field label="Modelo" value={poliza.vehicleDetails.model} />
                            <Field label="Año" value={String(poliza.vehicleDetails.year)} />
                            <Field label="Matrícula" value={poliza.vehicleDetails.licensePlate} />
                            <Field label="Padrón" value={poliza.vehicleDetails.registrationNumber} />
                            <Field label="Chasis" value={poliza.vehicleDetails.chassisNumber} />
                            <Field label="Motor" value={poliza.vehicleDetails.engineNumber} />
                        </View>
                    </>
                )}

                {poliza.tripDetails && (
                    <>
                        <Text style={styles.sectionTitle}>Viaje</Text>
                        <View style={styles.grid}>
                            <Field label="Destino" value={poliza.tripDetails.destination} />
                            <Field label="Fecha de Salida" value={formatFecha(poliza.tripDetails.departureDate)} />
                            <Field label="Fecha de Regreso" value={formatFecha(poliza.tripDetails.returnDate)} />
                            <Field label="Pasajeros" value={String(poliza.tripDetails.passengers)} />
                        </View>
                    </>
                )}

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
};

type PolicyPDFButtonProps = PolicyPDFProps & {
    className?: string;
};

const PolicyPDFButton = ({ poliza, compania, className }: PolicyPDFButtonProps) => {
    return (
        <PDFDownloadLink
            document={<PolicyPDFDocument poliza={poliza} compania={compania} />}
            fileName={`poliza-${poliza.policyNumber}.pdf`}
            className={className ?? "policy-pdf-button"}
        >
            {({ loading }) => (
                <>
                    <Download size={16} />
                    {loading ? "Generando PDF..." : "Exportar a PDF"}
                </>
            )}
        </PDFDownloadLink>
    );
};

export default PolicyPDFButton;