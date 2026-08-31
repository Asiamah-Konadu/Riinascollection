"use client";

export default function PrintButton() {
  return (
    <button className="btn no-print" style={{ marginTop: 24, width: "100%", justifyContent: "center" }} onClick={() => window.print()}>
      Print / save receipt
    </button>
  );
}
