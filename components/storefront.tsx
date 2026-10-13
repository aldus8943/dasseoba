"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Heart, Menu, Minus, Package, Plus, Search, ShoppingBag, Sparkles, UserRound, X, MessageCircle, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import HatArt from "./hat-art";
import { formatPrice, products, type Product } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/client";

type CartLine = { product: Product; quantity: number };
type WishlistItem = { productId: number; title: string; category: string; price: number; imageUrl?: string; quantity: number };
const categories = ["전체", "볼캡", "버킷햇", "비니", "선바이저", "단체제작"];
const heroSlides = [
  { image: "/images/hero/hero-3.png", kicker: "NEW SEASON · 26 FALL", title: <>모자 하나로<br />완성되는 <em>오늘.</em></>, description: "부드럽게 길들인 워시드 코튼. 매일 손이 가는 편안한 핏을 만나보세요.", cta: "신상품 보기", href: "#shop", tone: "dark" },
  { image: "/images/hero/hero-2.png", kicker: "LIGHT & NATURAL", title: <>가벼운 햇살을<br /><em>쓰는 방법.</em></>, description: "자연스러운 실루엣과 산뜻한 소재로 완성한 새로운 버킷햇 컬렉션.", cta: "버킷햇 컬렉션", href: "#shop", tone: "dark" },
  { image: "/images/hero/hero-1.png", kicker: "WARM TEXTURE", title: <>계절의 온도를<br /><em>머리 위에.</em></>, description: "포근한 골지와 깊은 컬러. 지금부터 오래 쓰는 시그니처 비니.", cta: "비니 컬렉션", href: "#shop", tone: "light", buttonClass: "cta-burgundy" },
  { image: "/images/hero/hero-4.png", kicker: "MOVE LIGHT", title: <>가볍게 달리고<br /><em>선명하게.</em></>, description: "빠르게 마르는 쿨링 메시와 넓은 시야를 위한 러닝 선바이저.", cta: "액티브 컬렉션", href: "#shop", tone: "light", buttonClass: "cta-active-blue" },
  { image: "/images/hero/hero-5.png", kicker: "MAKE IT YOURS", title: <>우리만의 이야기<br /><span className="title-nowrap">를 <em>한 땀씩.</em></span></>, description: "팀과 브랜드의 이야기를 담은 커스텀 자수. 10개부터 제작해 드려요.", cta: "단체 제작 상담", href: "#custom", tone: "dark" },
];

const winterImageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`;
const winterProducts: Array<{ product: Product; image: string; note: string }> = [
  { product: { id: 101, name: "위빙 레더 퍼 트루퍼", category: "겨울모자", price: 68900, badge: "NEW", color: "#2d2927", accent: "#ead7b8", material: "에코 퍼 · 비건 레더", description: "입체적인 위빙 텍스처와 크림 퍼를 조합한 프리미엄 트루퍼 햇." }, image: `${winterImageBase}/winter-01.png`, note: "에코 퍼 · 비건 레더" },
  { product: { id: 102, name: "블랙 레더 윈터 트루퍼", category: "겨울모자", price: 74900, badge: "NEW", color: "#161616", accent: "#e7dfd2", material: "페이크 레더 · 롱 퍼", description: "매끈한 블랙 레더와 풍성한 퍼로 완성한 한겨울 시그니처 아이템." }, image: `${winterImageBase}/winter-02.png`, note: "페이크 레더 · 롱 퍼" },
  { product: { id: 103, name: "네이비 패디드 이어플랩", category: "겨울모자", price: 45900, color: "#263348", accent: "#111111", material: "패디드 나일론 · 퍼", description: "가볍게 누빈 네이비 원단과 블랙 퍼가 찬바람을 막아주는 이어플랩." }, image: `${winterImageBase}/winter-03.png`, note: "패디드 나일론 · 퍼" },
  { product: { id: 104, name: "테디 플리스 트래퍼", category: "겨울모자", price: 52900, badge: "LIMITED", color: "#6e564f", accent: "#b4a39a", material: "테디 플리스 · 보아 안감", description: "귀와 목까지 폭신하게 감싸는 브라운 테디 플리스 트래퍼." }, image: `${winterImageBase}/winter-04.png`, note: "테디 플리스 · 보아 안감" },
  { product: { id: 105, name: "차콜 울 이어플랩 캡", category: "겨울모자", price: 49800, color: "#424242", accent: "#5a5350", material: "울 블렌드 · 스냅 이어플랩", description: "단정한 볼캡 실루엣에 접어 올릴 수 있는 이어플랩을 더한 데일리 캡." }, image: `${winterImageBase}/winter-05.png`, note: "울 블렌드 · 스냅 이어플랩" },
  { product: { id: 106, name: "아이보리 퍼 토크", category: "겨울모자", price: 55900, badge: "NEW", color: "#1b1b1b", accent: "#f1eadc", material: "비건 레더 · 시어링", description: "미니멀한 블랙 크라운과 아이보리 시어링 밴드의 감각적인 대비." }, image: `${winterImageBase}/winter-06.png`, note: "비건 레더 · 시어링" },
  { product: { id: 107, name: "헤링본 방한 헌팅캡", category: "겨울모자", price: 46900, color: "#383838", accent: "#181818", material: "울 헤링본 · 방한 이어커버", description: "클래식한 헤링본 울과 실용적인 이어커버를 결합한 윈터 헌팅캡." }, image: `${winterImageBase}/winter-07.png`, note: "울 헤링본 · 방한 이어커버" },
];

export default function Storefront() {
  const router = useRouter();
  const [category, setCategory] = useState("전체");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem("dasseoba-cart") || "[]"); if (Array.isArray(saved)) setCart(saved); } catch {} finally { setCartReady(true); } }, []);
  useEffect(() => { if (cartReady) localStorage.setItem("dasseoba-cart", JSON.stringify(cart)); }, [cart, cartReady]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authUser, setAuthUser] = useState<{ id: string; email?: string; user_metadata?: { name?: string } } | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    if (heroPaused) return;
    const timer = window.setInterval(() => setHeroIndex((current) => (current + 1) % heroSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, [heroPaused]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => { setAuthUser(data.session?.user ?? null); if (data.session?.user) void loadWishlist(data.session.user.id); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) void loadWishlist(session.user.id); else setWishlist([]);
      if (!session) setAccountOpen(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const moveHero = (direction: number) => setHeroIndex((current) => (current + direction + heroSlides.length) % heroSlides.length);

  async function loadWishlist(userId: string) {
    const supabase = createClient();
    if (!supabase) return;
    setWishlistLoading(true);
    const { data, error } = await supabase.from("wishlists").select("product_id,quantity,products(id,title,category,price,images)").eq("user_id", userId).order("created_at", { ascending: false });
    if (!error && data) setWishlist(data.flatMap((row: any) => { const product = Array.isArray(row.products) ? row.products[0] : row.products; return product ? [{ productId: Number(row.product_id), title: product.title, category: product.category || "모자", price: Number(product.price), imageUrl: Array.isArray(product.images) ? product.images[0] : undefined, quantity: Math.max(1, Number(row.quantity) || 1) }] : []; }));
    setWishlistLoading(false);
  }

  async function toggleWishlist(product: Product, imageUrl?: string) {
    if (!authUser) { setLoginOpen(true); setAuthMode("login"); setAuthMessage("찜 기능은 로그인 후 사용할 수 있어요."); return; }
    const supabase = createClient();
    if (!supabase) return;
    const saved = wishlist.find((item) => item.title === product.name);
    setWishlistLoading(true);
    try {
      if (saved) {
        const { error } = await supabase.from("wishlists").delete().eq("user_id", authUser.id).eq("product_id", saved.productId);
        if (error) throw error;
        setWishlist((current) => current.filter((item) => item.productId !== saved.productId));
        setToast(`${product.name}을 찜 목록에서 제거했어요.`);
      } else {
        let { data: dbProduct, error: productError } = await supabase.from("products").select("id,title,category,price,images").eq("title", product.name).maybeSingle();
        if (productError) throw productError;
        if (!dbProduct) {
          const created = await supabase.from("products").insert({ title: product.name, category: product.category, price: product.price, stock_quantity: 0, status: "active", description: product.description, images: imageUrl ? [imageUrl] : [] }).select("id,title,category,price,images").single();
          if (created.error) throw created.error;
          dbProduct = created.data;
        }
        const { error } = await supabase.from("wishlists").insert({ user_id: authUser.id, product_id: dbProduct.id });
        if (error) throw error;
        setWishlist((current) => [{ productId: Number(dbProduct.id), title: dbProduct.title, category: dbProduct.category || product.category, price: Number(dbProduct.price), imageUrl: Array.isArray(dbProduct.images) ? dbProduct.images[0] : imageUrl, quantity: 1 }, ...current]);
        setToast(`${product.name}을 찜했어요.`);
      }
      window.setTimeout(() => setToast(""), 2200);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "찜 정보를 저장하지 못했어요.");
      window.setTimeout(() => setToast(""), 2600);
    } finally { setWishlistLoading(false); }
  }

  async function changeWishlistQuantity(productId: number, quantity: number) {
    if (!authUser || quantity < 1) return;
    const supabase = createClient();
    if (!supabase) return;
    setWishlistLoading(true);
    const { error } = await supabase.from("wishlists").update({ quantity }).eq("user_id", authUser.id).eq("product_id", productId);
    if (error) setToast("수량을 변경하지 못했어요.");
    else setWishlist((current) => current.map((item) => item.productId === productId ? { ...item, quantity } : item));
    setWishlistLoading(false);
    if (error) window.setTimeout(() => setToast(""), 2200);
  }

  function closeAuth() {
    setLoginOpen(false);
    setAuthMessage("");
    setAuthPassword("");
  }

  async function submitAuth() {
    setAuthMessage("");
    if (!authEmail.trim() || authPassword.length < 8 || (authMode === "signup" && !authName.trim())) {
      setAuthMessage(authMode === "signup" ? "이름, 이메일과 8자 이상의 비밀번호를 입력해 주세요." : "이메일과 8자 이상의 비밀번호를 입력해 주세요.");
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setAuthMessage("Supabase 연결 정보를 확인해 주세요.");
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: authEmail.trim(), password: authPassword, options: { data: { name: authName.trim() } } });
        if (error) throw error;
        setAuthMessage(data.session ? "가입과 로그인이 완료됐어요." : "확인 이메일을 보냈어요. 메일의 링크를 눌러 가입을 완료해 주세요.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });
        if (error) throw error;
        closeAuth();
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "인증 처리 중 문제가 발생했습니다.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    setAuthLoading(true);
    const { error } = await supabase.auth.signOut();
    setAuthLoading(false);
    if (error) {
      setToast("로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.");
      window.setTimeout(() => setToast(""), 2500);
      return;
    }
    setAccountOpen(false);
    setToast("안전하게 로그아웃됐어요.");
    window.setTimeout(() => setToast(""), 2200);
  }

  const filtered = useMemo(() => products.filter((p) => (category === "전체" || p.category === category) && p.name.includes(query)), [category, query]);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const wishedTitles = new Set(wishlist.map((item) => item.title));

  function addToCart(product: Product) {
    setCart((current) => {
      const found = current.find((line) => line.product.id === product.id);
      return found ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { product, quantity: 1 }];
    });
    setToast(`${product.name}을 장바구니에 담았어요.`);
    window.setTimeout(() => setToast(""), 2200);
  }

  function changeQuantity(id: number, delta: number) {
    setCart((current) => current.map((line) => line.product.id === id ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0));
  }

  return (
    <main>
      <div className="announcement"><Sparkles size={14} /> 신규 회원 3,000P · 5만원 이상 무료배송 <span>오늘도 나답게, 다써바.</span></div>
      <header className="site-header">
        <button className="icon-button mobile-only" aria-label="메뉴 열기" onClick={() => setMenuOpen(true)}><Menu /></button>
        <Link className="logo" href="/"><span>다</span>써바<small>HAT CURATION</small></Link>
        <nav className="desktop-nav" aria-label="주 메뉴">
          <a href="#shop">SHOP <ChevronDown size={14} /></a><a href="#winter-new">NEW</a><a href="#best">BEST</a><a className="nav-point" href="#one-plus-one">1+1</a><a href="#custom">단체제작</a><a href="#community">COMMUNITY</a><Link className="nav-admin" href="/admin">ADMIN</Link>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="검색" onClick={() => setSearchOpen((v) => !v)}><Search /></button>
          <div className="account-area desktop-icon">
            <button className={`account-trigger ${authUser ? "signed-in" : ""}`} aria-label={authUser ? "계정 메뉴" : "로그인"} aria-expanded={authUser ? accountOpen : undefined} onClick={() => authUser ? setAccountOpen((open) => !open) : setLoginOpen(true)}><UserRound /><span>{authUser ? (authUser.user_metadata?.name || authUser.email?.split("@")[0] || "회원") : "로그인"}</span></button>
            {authUser && accountOpen && <div className="account-menu"><div><span className="account-avatar">{(authUser.user_metadata?.name || authUser.email || "회").slice(0, 1).toUpperCase()}</span><p><b>{authUser.user_metadata?.name || "다써바 회원"}</b><small>{authUser.email}</small></p></div><a href="#">마이페이지</a><a href="#">주문·배송 조회</a><button disabled={authLoading} onClick={() => void signOut()}>{authLoading ? "로그아웃 중..." : "로그아웃"}</button></div>}
          </div>
          <button className={`wishlist-trigger ${wishlistOpen ? "open" : ""}`} aria-label={`찜한 상품 ${wishlist.length}개`} onClick={() => { if (!authUser) { setLoginOpen(true); setAuthMessage("찜 목록은 로그인 후 확인할 수 있어요."); } else { setCartOpen(false); setWishlistOpen(true); } }}><Heart /><span>찜</span>{wishlist.length > 0 && <b>{wishlist.length}</b>}</button>
          <Link className="icon-button cart-button" href="/cart" aria-label={`장바구니 ${count}개`}><ShoppingBag />{count > 0 && <b>{count}</b>}</Link>
        </div>
        {searchOpen && <div className="search-panel"><Search size={18} /><input autoFocus placeholder="어떤 모자를 찾으세요?" value={query} onChange={(e) => setQuery(e.target.value)} /><button onClick={() => { setQuery(""); setSearchOpen(false); }}><X /></button></div>}
      </header>

      <section className="hero-carousel" id="new" aria-roledescription="carousel" aria-label="다써바 시즌 컬렉션" onMouseEnter={() => setHeroPaused(true)} onMouseLeave={() => setHeroPaused(false)} onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touchStart.current === null) return; const distance = e.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) moveHero(distance > 0 ? -1 : 1); touchStart.current = null; }}>
        <div className="hero-slides" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
          {heroSlides.map((slide, index) => <article className={`hero-slide hero-tone-${slide.tone}`} key={slide.image} aria-hidden={heroIndex !== index}>
            <img src={slide.image} alt="" aria-hidden="true" />
            <div className="hero-photo-shade" />
            <div className="hero-slide-copy">
              <p className="eyebrow">{slide.kicker}</p>
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
              <div className="hero-buttons"><a className={`button ${slide.buttonClass ?? (slide.tone === "light" ? "light" : "dark")}`} href={slide.href}>{slide.cta}</a><a className="text-link" href="#custom">브랜드 스토리 <span>↗</span></a></div>
            </div>
          </article>)}
        </div>
        <button className="hero-arrow hero-prev" aria-label="이전 슬라이드" onClick={() => moveHero(-1)}><ChevronLeft /></button>
        <button className="hero-arrow hero-next" aria-label="다음 슬라이드" onClick={() => moveHero(1)}><ChevronRight /></button>
        <div className="hero-pagination">{heroSlides.map((slide, index) => <button key={slide.image} className={heroIndex === index ? "active" : ""} onClick={() => setHeroIndex(index)} aria-label={`${index + 1}번 슬라이드로 이동`} aria-current={heroIndex === index ? "true" : undefined}><b>{String(index + 1).padStart(2, "0")}</b><span><i /></span></button>)}</div>
        <p className="vertical-word">EVERYDAY HAT ARCHIVE</p>
      </section>

      <section className="promise-strip"><div><Truck /><span><b>무료 배송</b>5만원 이상 구매 시</span></div><div><RotateCcw /><span><b>간편 교환</b>배송 완료 후 7일 이내</span></div><div><ShieldCheck /><span><b>안심 결제</b>안전한 결제 시스템</span></div><div><Package /><span><b>단체 제작</b>10개부터 맞춤 자수</span></div></section>

      <section className="winter-edit" id="winter-new">
        <div className="winter-edit-head">
          <div><p className="eyebrow">WINTER 2026 · NEW ARRIVALS</p><h2>겨울의 온도를<br />머리 위에.</h2></div>
          <div><span>THE WINTER HAT EDIT</span><p>차가운 바람에도 스타일은 그대로.<br />퍼, 울, 레더로 엄선한 새로운 방한 모자 7종.</p></div>
        </div>
        <div className="winter-grid">
          {winterProducts.map(({ product, image, note }, index) => <article className={`winter-card winter-card-${index + 1}`} key={product.id}>
            <div className="winter-image">
              <img src={image} alt={product.name} />
              <Link className="card-detail-hit" href={`/products/${product.id}`} aria-label={`${product.name} 상세 보기`} />
              <span className="winter-number">{String(index + 1).padStart(2, "0")}</span>
              {product.badge && <span className="winter-badge">{product.badge}</span>}
              <button className={`winter-wish ${wishedTitles.has(product.name) ? "active" : ""}`} aria-label={`${product.name} ${wishedTitles.has(product.name) ? "찜 취소" : "찜하기"}`} disabled={wishlistLoading} onClick={(event) => { event.stopPropagation(); void toggleWishlist(product, image); }}><Heart /></button>
            </div>
            <div className="winter-info"><Link href={`/products/${product.id}`}><small>{note}</small><h3>{product.name}</h3></Link><div><b>{formatPrice(product.price)}</b><button aria-label={`${product.name} 장바구니 담기`} onClick={() => addToCart({ ...product, imageUrl: image } as Product)}><ShoppingBag /></button></div></div>
          </article>)}
        </div>
        <div className="winter-foot"><p>모든 겨울모자는 한정 수량으로 준비되었습니다.</p><a href="#winter-new">WINTER COLLECTION <span>↗</span></a></div>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>요즘 가장 많이 쓰는 모자</h2></div><p>다써바가 고른 계절의 베스트 셀렉션.<br />취향에 맞는 실루엣을 만나보세요.</p></div>
        <div className="category-tabs" role="tablist">{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="product-grid" id="best">{filtered.map((product) => <article className="product-card" key={product.id}>
          <div className="product-visual">{product.badge && <span className={`badge ${product.badge === "1+1" ? "orange" : ""}`}>{product.badge}</span>}<Link className="card-detail-hit" href={`/products/${product.id}`} aria-label={`${product.name} 상세 보기`} /><button className={`wish ${wishedTitles.has(product.name) ? "active" : ""}`} aria-label={`${product.name} ${wishedTitles.has(product.name) ? "찜 취소" : "찜하기"}`} disabled={wishlistLoading} onClick={() => { void toggleWishlist(product); }}><Heart /></button><HatArt color={product.color} accent={product.accent} label={product.name} /></div>
          <div className="product-info"><Link href={`/products/${product.id}`}><small>{product.category} · {product.material}</small><h3>{product.name}</h3></Link><div><p>{product.originalPrice && <del>{formatPrice(product.originalPrice)}</del>}<b>{formatPrice(product.price)}</b></p><button className="mini-cart" aria-label="장바구니 담기" onClick={() => addToCart(product)}><ShoppingBag /></button></div></div>
        </article>)}</div>
      </section>

      <section className="bundle-banner" id="one-plus-one"><div className="bundle-art"><HatArt color="#e9e2d5" accent="#9b6c4a" /><HatArt color="#20313f" accent="#9fb4c2" /><span>+</span></div><div><p className="eyebrow">PAIR YOUR STYLE</p><h2>하나는 오늘,<br />하나는 내일.</h2><p>원하는 컬러 두 가지를 골라<br />특별한 1+1 가격으로 만나보세요.</p><button className="button light" onClick={() => { setCategory("단체제작"); document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" }); }}>1+1 기획전 보기</button></div></section>

      <section className="custom-section" id="custom"><div className="custom-copy"><p className="eyebrow">MAKE IT YOURS</p><h2>우리만의 모자를<br />만들어 드려요.</h2><p>팀 로고, 브랜드 심볼, 기억하고 싶은 한마디까지.<br />10개부터 자수 샘플과 견적을 빠르게 안내해 드립니다.</p><div className="custom-steps"><span><b>01</b>상담 접수</span><i /><span><b>02</b>샘플 확인</span><i /><span><b>03</b>제작 · 배송</span></div><button className="button dark" onClick={() => setChatOpen(true)}>제작 상담 시작하기</button></div><div className="custom-board"><div className="thread thread-1">DASSEBA<br />RUN CLUB</div><div className="thread thread-2">SEOUL<br />CREW</div><div className="thread thread-3">YOUR<br />LOGO</div><p>EMBROIDERY<br />SAMPLER</p></div></section>

      <section className="journal" id="community"><div className="section-heading"><div><p className="eyebrow">HAT JOURNAL</p><h2>모자를 더 잘 쓰는 법</h2></div><a href="#">커뮤니티 전체보기 →</a></div><div className="journal-grid"><article><div className="journal-image wash"><span>01</span><HatArt color="#c9b8a2" accent="#5e4634" /></div><small>STYLE GUIDE</small><h3>얼굴형에 맞는 볼캡 깊이 고르기</h3></article><article><div className="journal-image care"><span>02</span><HatArt color="#e6e1d9" accent="#748078" /></div><small>CARE NOTE</small><h3>모자 모양을 지키는 손세탁 가이드</h3></article><article><div className="journal-image story"><span>03</span><HatArt color="#1c2935" accent="#bd9457" /></div><small>MAKER STORY</small><h3>작은 자수 하나가 완성되기까지</h3></article></div></section>

      <footer><div className="footer-brand"><Link className="logo inverse" href="/"><span>다</span>써바</Link><p>오늘도 나답게, 다 써봐.</p></div><div><b>SHOP</b><a href="#shop">전체상품</a><a href="#best">베스트</a><a href="#one-plus-one">1+1 기획전</a></div><div><b>HELP</b><a href="#">공지사항</a><a href="#">자주 묻는 질문</a><a href="#">배송조회</a></div><div><b>BUSINESS</b><a href="#custom">단체제작 상담</a><Link href="/admin">관리자 데모</Link></div><div className="footer-contact"><small>MON–FRI 10:00–17:00</small><strong>02.1234.5678</strong><button onClick={() => setChatOpen(true)}>카카오톡 상담</button></div><p className="copyright">© 2026 DASSEOBA. ALL RIGHTS RESERVED.</p></footer>

      <button className="floating-chat" aria-label="상담 챗봇" onClick={() => setChatOpen((v) => !v)}><MessageCircle /></button>
      {chatOpen && <aside className="chat-pop"><div><span className="chat-avatar">다</span><p><b>다써바 상담 도우미</b><small>보통 바로 답변해요</small></p><button onClick={() => setChatOpen(false)}><X /></button></div><div className="chat-body"><p>안녕하세요! 어떤 도움이 필요하세요? 👋</p><button>배송은 얼마나 걸리나요?</button><button>단체 제작이 궁금해요.</button><button>교환·반품 안내</button></div><a href={process.env.NEXT_PUBLIC_KAKAO_CHAT_URL || "https://pf.kakao.com/"} target="_blank">카카오톡으로 상담하기</a></aside>}
      {toast && <div className="toast">✓ {toast}</div>}

      <div className={`overlay ${cartOpen || wishlistOpen || menuOpen || loginOpen || selected ? "show" : ""}`} onClick={() => { setCartOpen(false); setWishlistOpen(false); setMenuOpen(false); closeAuth(); setSelected(null); setAccountOpen(false); }} />
      <aside className={`drawer cart-drawer ${cartOpen ? "open" : ""}`}><div className="drawer-head"><h2>장바구니 <small>{count}</small></h2><button onClick={() => setCartOpen(false)}><X /></button></div><div className="cart-lines">{cart.length === 0 ? <div className="empty-cart"><ShoppingBag /><b>장바구니가 비어 있어요.</b><p>마음에 드는 모자를 골라보세요.</p><button onClick={() => setCartOpen(false)}>쇼핑 계속하기</button></div> : cart.map(({ product, quantity }) => <div className="cart-line" key={product.id}><div className="cart-thumb"><HatArt color={product.color} accent={product.accent} /></div><div><small>{product.category}</small><b>{product.name}</b><p>{formatPrice(product.price)}</p><div className="quantity"><button onClick={() => changeQuantity(product.id, -1)}><Minus /></button><span>{quantity}</span><button onClick={() => changeQuantity(product.id, 1)}><Plus /></button></div></div><button className="remove" onClick={() => changeQuantity(product.id, -quantity)}><X /></button></div>)}</div>{cart.length > 0 && <div className="cart-summary"><div><span>상품금액</span><span>{formatPrice(subtotal)}</span></div><div><span>배송비</span><span>{subtotal >= 50000 ? "무료" : "3,000원"}</span></div><p><b>결제 예상금액</b><strong>{formatPrice(subtotal + (subtotal >= 50000 ? 0 : 3000))}</strong></p><button onClick={() => { setCartOpen(false); setLoginOpen(true); }}>주문하기</button><small>보유 포인트 2,000P부터 1,000P 단위로 사용 가능</small></div>}</aside>
      <aside className={`drawer wishlist-drawer ${wishlistOpen ? "open" : ""}`} aria-label="찜한 상품 목록">
        <div className="drawer-head"><h2>찜한 상품 <small>{wishlist.length}</small></h2><button aria-label="찜 목록 닫기" onClick={() => setWishlistOpen(false)}><X /></button></div>
        <div className="wishlist-lines">{wishlistLoading && wishlist.length === 0 ? <p className="wishlist-loading">찜 목록을 불러오는 중...</p> : wishlist.length === 0 ? <div className="empty-cart"><Heart /><b>아직 찜한 상품이 없어요.</b><p>상품의 하트를 눌러 취향을 모아보세요.</p><button onClick={() => setWishlistOpen(false)}>상품 둘러보기</button></div> : wishlist.map((item) => {
          const winterMatch = winterProducts.find(({ product }) => product.name === item.title);
          const product = products.find((entry) => entry.name === item.title) ?? winterMatch?.product ?? { id: item.productId, name: item.title, category: item.category, price: item.price, color: "#24343c", accent: "#d8c7ae", material: "", description: "" };
          const imageUrl = item.imageUrl ?? winterMatch?.image;
          return <article className="wishlist-line" key={item.productId}><button className="wishlist-product" onClick={() => { router.push(`/products/${product.id}`); setWishlistOpen(false); }}><span className="wishlist-thumb">{imageUrl ? <img src={imageUrl} alt="" /> : <HatArt color={product.color} accent={product.accent} />}</span><span><small>{item.category}</small><b>{item.title}</b><strong>{formatPrice(item.price)}</strong></span></button><div className="wishlist-controls"><div className="wishlist-quantity" aria-label={`${item.title} 수량`}><button aria-label="수량 줄이기" disabled={wishlistLoading || item.quantity <= 1} onClick={() => void changeWishlistQuantity(item.productId, item.quantity - 1)}><Minus /></button><span>{item.quantity}</span><button aria-label="수량 늘리기" disabled={wishlistLoading} onClick={() => void changeWishlistQuantity(item.productId, item.quantity + 1)}><Plus /></button></div><button className="wishlist-remove" disabled={wishlistLoading} onClick={() => void toggleWishlist(product, imageUrl)}><X /> 삭제</button></div></article>;
        })}</div>
      </aside>
      <aside className={`drawer menu-drawer ${menuOpen ? "open" : ""}`}><div className="drawer-head"><span className="logo"><span>다</span>써바</span><button onClick={() => setMenuOpen(false)}><X /></button></div>{authUser && <div className="mobile-account"><span>{(authUser.user_metadata?.name || authUser.email || "회").slice(0, 1).toUpperCase()}</span><p><b>{authUser.user_metadata?.name || "다써바 회원"}</b><small>{authUser.email}</small></p></div>}{[{ label: "SHOP", href: "#shop" }, { label: "NEW", href: "#winter-new" }, { label: "BEST", href: "#best" }, { label: "1+1 기획전", href: "#one-plus-one" }, { label: "단체제작", href: "#custom" }, { label: "COMMUNITY", href: "#community" }].map((item) => <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<span>→</span></a>)}<Link href="/admin" onClick={() => setMenuOpen(false)}>ADMIN <span>→</span></Link><button className="mobile-login" onClick={() => { setMenuOpen(false); if (authUser) void signOut(); else setLoginOpen(true); }}><UserRound /> {authUser ? "로그아웃" : "로그인 / 회원가입"}</button></aside>
      {loginOpen && <section className="modal login-modal" aria-live="polite"><button className="modal-close" aria-label="인증 창 닫기" onClick={closeAuth}><X /></button><span className="login-mark">다</span><h2>{authMode === "login" ? "다시 만나서 반가워요." : "다써바와 처음 만나셨나요?"}</h2><p>{authMode === "login" ? "로그인하고 주문 배송과 포인트를 확인하세요." : "간단한 정보만 입력하면 바로 가입할 수 있어요."}</p>{authMode === "signup" && <label>이름<input type="text" placeholder="이름을 입력해 주세요" autoComplete="name" value={authName} onChange={(event) => setAuthName(event.target.value)} /></label>}<label>이메일<input type="email" placeholder="hello@example.com" autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} /></label><label>비밀번호<input type="password" placeholder="8자 이상 입력" autoComplete={authMode === "login" ? "current-password" : "new-password"} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submitAuth(); }} /></label>{authMode === "login" && <div className="login-help"><span>브라우저를 닫으면 자동으로 로그아웃됩니다.</span><button type="button">비밀번호 찾기</button></div>}{authMessage && <p className={`auth-message ${authMessage.includes("완료") || authMessage.includes("보냈어요") || authMessage.includes("로그인됐어요") ? "success" : ""}`}>{authMessage}</p>}<button className="login-submit" disabled={authLoading} onClick={() => void submitAuth()}>{authLoading ? "처리 중..." : authMode === "login" ? "로그인" : "회원가입 완료하기"}</button><div className="divider"><span>또는</span></div><button className="signup-button" onClick={() => { setAuthMode((mode) => mode === "login" ? "signup" : "login"); setAuthMessage(""); setAuthPassword(""); }}>{authMode === "login" ? "이메일로 10초 만에 가입하기" : "이미 계정이 있어요 · 로그인"}</button><small>가입 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.</small></section>}
      {selected && <section className="modal product-modal"><button className="modal-close" onClick={() => setSelected(null)}><X /></button><div className="modal-product-art"><HatArt color={selected.color} accent={selected.accent} label={selected.name} large /></div><div className="modal-product-copy"><small>{selected.category} · {selected.material}</small><h2>{selected.name}</h2><p>{selected.description}</p><strong>{formatPrice(selected.price)}</strong><label>컬러<select><option>대표 컬러</option><option>크림</option><option>네이비</option></select></label><label>사이즈<select><option>FREE (54–60cm)</option></select></label><button onClick={() => { addToCart(selected); setSelected(null); setCartOpen(true); }}><ShoppingBag /> 장바구니 담기</button><div className="modal-benefits"><span>신규회원 3,000P</span><span>구매 적립 1%</span><span>무료 교환 1회</span></div></div></section>}
    </main>
  );
}
