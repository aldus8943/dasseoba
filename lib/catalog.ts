export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  color: string;
  accent: string;
  material: string;
  description: string;
};

export const products: Product[] = [
  { id: 1, name: "에브리데이 워시드 볼캡", category: "볼캡", price: 24900, badge: "BEST", color: "#243342", accent: "#99a8b6", material: "워시드 코튼 100%", description: "부드럽게 길들인 코튼과 안정적인 6패널 핏." },
  { id: 2, name: "플랫 브림 시그니처 캡", category: "볼캡", price: 28900, color: "#d6ccbb", accent: "#76563d", material: "고밀도 트윌 코튼", description: "간결한 자수와 넓은 챙이 만드는 선명한 실루엣." },
  { id: 3, name: "투웨이 스트링 버킷햇", category: "버킷햇", price: 32900, badge: "NEW", color: "#b6a481", accent: "#4a5744", material: "생활 방수 나일론", description: "스트링을 더해 바람 부는 날에도 편안한 아웃도어 햇." },
  { id: 4, name: "소프트 립 숏 비니", category: "비니", price: 21900, color: "#8a302f", accent: "#d9b29c", material: "아크릴 울 블렌드", description: "까슬거림 없이 포근하고 가볍게 접히는 데일리 비니." },
  { id: 5, name: "러닝 라이트 선바이저", category: "선바이저", price: 26900, badge: "LIGHT", color: "#d9dfd1", accent: "#25382b", material: "쿨링 메시", description: "땀은 빠르게 말리고 시야는 넓게 잡아주는 초경량 바이저." },
  { id: 6, name: "클럽 커스텀 볼캡 1+1", category: "단체제작", price: 39900, originalPrice: 49800, badge: "1+1", color: "#101113", accent: "#f0b429", material: "프리미엄 코튼", description: "두 가지 컬러를 골라 즐기는 자수 커스텀 기획 세트." },
  { id: 7, name: "코듀로이 캠프 캡", category: "볼캡", price: 34900, color: "#795548", accent: "#e3c7a8", material: "8W 코듀로이", description: "낮은 크라운과 따뜻한 질감이 조화로운 캠프 캡." },
  { id: 8, name: "리버서블 체크 버킷", category: "버킷햇", price: 37900, badge: "2WAY", color: "#264653", accent: "#e9c46a", material: "코튼 린넨 블렌드", description: "무지와 체크 양면으로 스타일이 바뀌는 버킷햇." },
];

export const formatPrice = (value: number) => `${value.toLocaleString("ko-KR")}원`;
