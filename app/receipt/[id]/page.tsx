import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true }
  });

  if (!order) notFound();

  return (
    <div className="receipt-shell">
      <div className="receipt-card">
        <div className="receipt-head">
          <img
            src="/Riinas_Collections_Logo_Combined.svg"
            alt="Riina's Collections Logo"
            className="receipt-logo-img"
            width={72}
            height={82}
          />
          <div className="receipt-brand-title">Riina&apos;s Collections</div>
          <div className="order-number">{order.orderNumber}</div>
          <div style={{ fontSize: "0.82rem", color: "#6b6b63", marginTop: 4 }}>
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>

        {order.items.map((item) => (
          <div className="receipt-row" key={item.id}>
            <span>
              {item.name} × {item.qty}
            </span>
            <span>GHS {(Number(item.price) * item.qty).toFixed(2)}</span>
          </div>
        ))}

        <div className="receipt-total">
          <span>Total</span>
          <span>GHS {Number(order.total).toFixed(2)}</span>
        </div>

        <div className="receipt-meta">
          <div>Name: {order.customerName}</div>
          <div>Phone: {order.phone}</div>
          {order.note && <div>Note: {order.note}</div>}
          <div>
            Status: <span className={`badge ${order.status}`}>{order.status}</span>
          </div>
        </div>

        <PrintButton />
      </div>
    </div>
  );
}
