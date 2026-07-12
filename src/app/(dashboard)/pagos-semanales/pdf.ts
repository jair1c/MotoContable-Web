import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PaymentDetail {
  payment: {
    week_start: string;
    week_end: string;
    amount_due: number;
    amount_paid: number;
    status: string;
    note: string | null;
    passengers: { name: string } | { name: string }[] | null;
  };
  legs: { leg_date: string; leg: string; amount: number }[];
  driverName: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pagado: "Pagado",
  parcial: "Pago parcial",
  pendiente: "Pendiente",
  trasladado: "Trasladado a la semana siguiente",
};

export async function downloadPaymentPdf(detail: PaymentDetail) {
  const { jsPDF } = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default;

  const passenger = Array.isArray(detail.payment.passengers)
    ? detail.payment.passengers[0]
    : detail.payment.passengers;

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("MotoContable", 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text("Detalle de liquidación semanal", 14, 25);

  doc.setDrawColor(220, 220, 220);
  doc.line(14, 29, 196, 29);

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  let y = 38;
  doc.text(`Pasajero: ${passenger?.name ?? "—"}`, 14, y);
  y += 6;
  if (detail.driverName) {
    doc.text(`Conductor: ${detail.driverName}`, 14, y);
    y += 6;
  }
  doc.text(
    `Semana: ${format(new Date(detail.payment.week_start), "dd 'de' MMMM", { locale: es })} al ${format(
      new Date(detail.payment.week_end),
      "dd 'de' MMMM 'de' yyyy",
      { locale: es }
    )}`,
    14,
    y
  );
  y += 8;

  const rows = detail.legs.map((l) => [
    format(new Date(l.leg_date + "T00:00:00"), "EEEE dd/MM", { locale: es }),
    l.leg === "ida" ? "Ida" : "Vuelta",
    `S/ ${Number(l.amount).toFixed(2)}`,
  ]);

  if (rows.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Fecha", "Tramo", "Monto"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [242, 169, 59], textColor: [20, 20, 20] },
      styles: { fontSize: 9, cellPadding: 3 },
    });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Esta liquidación no tiene tramos diarios asociados (posible saldo trasladado).", 14, y);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = rows.length > 0 ? (doc as any).lastAutoTable.finalY + 10 : y + 10;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(`Total de la semana: S/ ${Number(detail.payment.amount_due).toFixed(2)}`, 14, finalY);
  doc.text(`Pagado: S/ ${Number(detail.payment.amount_paid).toFixed(2)}`, 14, finalY + 6);
  doc.text(`Estado: ${STATUS_LABELS[detail.payment.status] ?? detail.payment.status}`, 14, finalY + 12);

  let noteY = finalY + 12;
  if (detail.payment.note) {
    noteY += 8;
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(`Nota: ${detail.payment.note}`, 14, noteY, { maxWidth: 180 });
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")} — MotoContable`,
    14,
    285
  );

  const safeName = (passenger?.name ?? "pasajero").replace(/[^a-zA-Z0-9]+/g, "-");
  doc.save(`liquidacion-${safeName}-${detail.payment.week_start}.pdf`);
}
