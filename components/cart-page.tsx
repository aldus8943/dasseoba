"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import HatArt from "./hat-art";
import { formatPrice, type Product } from "@/lib/catalog";

type CartProduct = Product & { imageUrl?: string };
type CartLine = { product: CartProduct; quantity: number };

const CART_KEY = "dasseoba-cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartLine[];
      setCart(Array.isArray(stored) ? stored.filter((line) => line?.product?.id && line.quantity > 0) : []);
    } catch {
      setCart([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  const count = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0), [cart]);
  const shipping = subtotal === 0 || subtotal >= 50000 ? 0 : 3000;

  const changeQuantity = (id: number, delta: number) => {
    setCart((current) => current
      .map((line) => line.product.id === id ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line)
      .filter((line) => line.quantity > 0));
  };

  const remove = (id: number) => setCart((current) => current.filter((line) => line.product.id !== id));

  return <main className="cart-page">
    <header className="cart-page-header">
      <Link className="logo" href="/"><span>다</span>써바<small>HAT CURATION</small></Link>
      <Link className="cart-back" href="/"><ArrowLeft /> 쇼핑 계속하기</Link>
    </header>

    <section className="cart-page-title">
      <p>YOUR SELECTION</p>
      <h1>장바구니 <span>{count}</span></h1>
    </section>

    {!ready ? <div className="cart-page-loading">장바구니를 불러오는 중입니다.</div> : cart.length === 0 ? <section className="cart-page-empty">
      <ShoppingBag />
      <h2>장바구니가 비어 있어요.</h2>
      <p>매일 손이 갈 모자를 천천히 골라보세요.</p>
      <Link href="/#shop">상품 둘러보기</Link>
    </section> : <section className="cart-page-body">
      <div className="cart-page-list">
        <div className="cart-list-head"><span>상품</span><span>수량</span><span>금액</span></div>
        {cart.map(({ product, quantity }) => <article className="cart-page-line" key={product.id}>
          <Link className="cart-page-product" href={`/products/${product.id}`}>
            <div className="cart-page-thumb">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <HatArt color={product.color} accent={product.accent} label={product.name} />}</div>
            <div><small>{product.category} · {product.material}</small><h2>{product.name}</h2><p>{formatPrice(product.price)}</p></div>
          </Link>
          <div className="cart-page-quantity" aria-label={`${product.name} 수량`}>
            <button aria-label="수량 줄이기" onClick={() => changeQuantity(product.id, -1)}><Minus /></button>
            <span>{quantity}</span>
            <button aria-label="수량 늘리기" onClick={() => changeQuantity(product.id, 1)}><Plus /></button>
          </div>
          <strong>{formatPrice(product.price * quantity)}</strong>
          <button className="cart-page-remove" aria-label={`${product.name} 삭제`} onClick={() => remove(product.id)}><Trash2 /></button>
        </article>)}
      </div>

      <aside className="cart-page-summary">
        <p>ORDER SUMMARY</p><h2>결제 금액</h2>
        <div><span>상품금액</span><b>{formatPrice(subtotal)}</b></div>
        <div><span>배송비</span><b>{shipping === 0 ? "무료" : formatPrice(shipping)}</b></div>
        <hr />
        <div className="cart-page-total"><span>총 결제 예정금액</span><strong>{formatPrice(subtotal + shipping)}</strong></div>
        <Link className="checkout-link" href="/checkout">주문하기</Link>
        <ul><li><Truck /> 5만원 이상 구매 시 무료배송</li><li><ShieldCheck /> 안전한 결제 시스템</li></ul>
      </aside>
    </section>}
  </main>;
}
