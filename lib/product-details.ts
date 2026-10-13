import { products, type Product } from "./catalog";

const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`;

export type DetailProduct = Product & { imageUrl?: string; features: string[]; colors: string[] };

const winterProducts: DetailProduct[] = [
  { id:101,name:"위빙 레더 퍼 트루퍼",category:"겨울모자",price:68900,badge:"NEW",color:"#2d2927",accent:"#ead7b8",material:"에코 퍼 · 비건 레더",description:"입체적인 위빙 텍스처와 크림 퍼를 조합한 프리미엄 트루퍼 햇.",imageUrl:`${storageBase}/winter-01.png`,features:["귀를 감싸는 보온 설계","부드러운 에코 퍼 안감","사이즈 조절 스트랩"],colors:["브라운","크림"] },
  { id:102,name:"블랙 레더 윈터 트루퍼",category:"겨울모자",price:74900,badge:"NEW",color:"#161616",accent:"#e7dfd2",material:"페이크 레더 · 롱 퍼",description:"매끈한 블랙 레더와 풍성한 퍼로 완성한 한겨울 시그니처 아이템.",imageUrl:`${storageBase}/winter-02.png`,features:["방풍 레더 크라운","풍성한 롱 퍼","턱 고정 버클"],colors:["블랙"] },
  { id:103,name:"네이비 패디드 이어플랩",category:"겨울모자",price:45900,color:"#263348",accent:"#111111",material:"패디드 나일론 · 퍼",description:"가볍게 누빈 네이비 원단과 블랙 퍼가 찬바람을 막아주는 이어플랩.",imageUrl:`${storageBase}/winter-03.png`,features:["가벼운 패딩 충전재","부드러운 퍼 안감","생활 방수 원단"],colors:["네이비","블랙"] },
  { id:104,name:"테디 플리스 트래퍼",category:"겨울모자",price:52900,badge:"LIMITED",color:"#6e564f",accent:"#b4a39a",material:"테디 플리스 · 보아 안감",description:"귀와 목까지 폭신하게 감싸는 브라운 테디 플리스 트래퍼.",imageUrl:`${storageBase}/winter-04.png`,features:["양면 보아 플리스","귀·목 보온 설계","하단 조절 버클"],colors:["브라운"] },
  { id:105,name:"차콜 울 이어플랩 캡",category:"겨울모자",price:49800,color:"#424242",accent:"#5a5350",material:"울 블렌드 · 스냅 이어플랩",description:"단정한 볼캡 실루엣에 접어 올릴 수 있는 이어플랩을 더한 데일리 캡.",imageUrl:`${storageBase}/winter-05.png`,features:["울 블렌드 원단","접이식 이어플랩","메탈 스냅 디테일"],colors:["차콜"] },
  { id:106,name:"아이보리 퍼 토크",category:"겨울모자",price:55900,badge:"NEW",color:"#1b1b1b",accent:"#f1eadc",material:"비건 레더 · 시어링",description:"미니멀한 블랙 크라운과 아이보리 시어링 밴드의 감각적인 대비.",imageUrl:`${storageBase}/winter-06.png`,features:["비건 레더 크라운","볼륨 시어링 밴드","가벼운 착용감"],colors:["블랙·아이보리"] },
  { id:107,name:"헤링본 방한 헌팅캡",category:"겨울모자",price:46900,color:"#383838",accent:"#181818",material:"울 헤링본 · 방한 이어커버",description:"클래식한 헤링본 울과 실용적인 이어커버를 결합한 윈터 헌팅캡.",imageUrl:`${storageBase}/winter-07.png`,features:["헤링본 울 텍스처","내장형 이어커버","뒷면 밴딩"],colors:["차콜"] },
];

const regularProducts: DetailProduct[] = products.map((product) => ({
  ...product,
  features: ["편안한 데일리 핏", product.material, "사이즈 조절 가능"],
  colors: product.id === 6 ? ["블랙","네이비","아이보리"] : ["대표 컬러","블랙"],
}));

export const allDetailProducts = [...regularProducts, ...winterProducts];
export const getDetailProduct = (id: number) => allDetailProducts.find((product) => product.id === id);
