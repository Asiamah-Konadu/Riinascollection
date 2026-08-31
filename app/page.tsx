import { prisma } from "@/lib/prisma";
import ProductGrid from "./components/ProductGrid";
import HeaderNav from "./components/HeaderNav";

export const dynamic = "force-dynamic";

const WHATSAPP_NUMBER = process.env.SHOP_WHATSAPP_NUMBER || "233599295013";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: "desc" }
  });

  const plainProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    description: p.description,
    image: p.image
  }));

  const categories = [...new Set(plainProducts.map((p) => p.category))];

  return (
    <>
      <HeaderNav categories={categories} whatsappNumber={WHATSAPP_NUMBER} />

      <section className="hero" id="top">
        <div className="wrap hero-grid">
          <div>
            <div className="hero-eyebrow">Kumasi · nationwide delivery</div>
            <h1>
              Dressed by <em>Riina</em>, delivered to your door.
            </h1>
            <p>
              Cottage skirts, joggers, dresses, and everyday basics — picked, packed, and sent
              from Kumasi to anywhere in Ghana. Every order starts with a message.
            </p>
            <div className="hero-actions">
              <a
                className="btn"
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  "Hi Riina's Collections, I'd like to place an order"
                )}`}
                target="_blank"
                rel="noopener"
              >
                Message us on WhatsApp
              </a>
              <a className="btn ghost" href="#shop" style={{ borderColor: "rgba(244,239,226,0.4)" }}>
                Browse the rack
              </a>
            </div>
            <div className="hero-meta">
              <div>
                <strong>{categories.length}</strong>core lines
              </div>
              <div>
                <strong>Kumasi</strong>based
              </div>
              <div>
                <strong>Nationwide</strong>delivery
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductGrid products={plainProducts} categories={categories} whatsappNumber={WHATSAPP_NUMBER} />

      <section className="how" id="how">
        <div className="wrap">
          <div>
            <h2>How ordering works</h2>
            <p className="how-lead">
              Pick a piece, fill in your details, and we&apos;ll confirm on WhatsApp. Your order
              gets a receipt number the moment you submit it.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div>
                <h3>Choose a piece</h3>
                <p>Tap &quot;Order&quot; on any item and fill in your name, phone, and size or note.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div>
                <h3>Get your receipt</h3>
                <p>You&apos;ll get an order number instantly, and a WhatsApp draft to confirm with us.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div>
                <h3>Pack &amp; send</h3>
                <p>Once confirmed, your order is packed and sent out — Kumasi pickup or nationwide delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="delivery">
        <div className="wrap">
          <div className="delivery-item">
            <div className="tag">Location</div>
            <p>Based in Kumasi, with pieces available for local pickup or delivery.</p>
          </div>
          <div className="delivery-item">
            <div className="tag">Delivery</div>
            <p>Nationwide delivery across Ghana, arranged once an order is confirmed.</p>
          </div>
          <div className="delivery-item">
            <div className="tag">Restocks</div>
            <p>New pieces are added regularly — follow along on TikTok to catch new drops first.</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div>
              <a href="#top" className="wordmark">
                <span className="mark">RC</span>Riina&apos;s Collections
              </a>
              <p style={{ marginTop: 14, fontSize: "0.88rem", color: "#4a4a45", maxWidth: "32ch" }}>
                Cottage skirts, joggers, dresses, and basics — from Kumasi, sent nationwide.
              </p>
            </div>
            <div className="foot-links">
              <div className="foot-col">
                <h4>Shop</h4>
                {categories.map((c) => (
                  <a key={c} href="#shop">
                    {c}
                  </a>
                ))}
              </div>
              <div className="foot-col">
                <h4>Contact</h4>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener">
                  WhatsApp
                </a>
                <a href="https://www.tiktok.com/@riinascollections3" target="_blank" rel="noopener">
                  TikTok @riinascollections3
                </a>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>Kumasi, Ghana</span>
            <span>Orders taken by message — no online checkout</span>
          </div>
        </div>
      </footer>
    </>
  );
}
