import type {
  ColorKey,
  ColorMeta,
  FeaturedStory,
  JourneyStory,
  Product,
  ProductType,
  Testimonial,
} from "./types";

const UPLOADS = "https://dreamkit.vn/wp-content/uploads";

/** Colour metadata keyed by {@link ColorKey}. */
export const COLOR_META: Readonly<Record<ColorKey, ColorMeta>> = {
  black: { label: "Đen", hex: "#1c1c1c" },
  white: { label: "Trắng", hex: "#f3f0e9" },
  red: { label: "Đỏ", hex: "#c0392b" },
  blue: { label: "Xanh Dương", hex: "#2f5fb0" },
  green: { label: "Xanh Lá", hex: "#2e7d52" },
  orange: { label: "Cam", hex: "#d2691e" },
  purple: { label: "Tím", hex: "#6c5b9e" },
  yellow: { label: "Vàng", hex: "#d9a93a" },
  gray: { label: "Xám", hex: "#8a8a8a" },
  cream: { label: "Kem", hex: "#e8e0cf" },
  pink: { label: "Hồng", hex: "#e08cae" },
};

/** Product type labels ("Loại" facet). */
export const TYPE_LABELS: Readonly<Record<ProductType, string>> = {
  jersey: "Áo Jersey",
  polo: "Áo polo",
  set: "Set quần áo bóng đá",
};

/** Colours surfaced in the primary filter row (mirrors the source site). */
export const FILTER_COLORS: readonly ColorKey[] = [
  "black",
  "red",
  "blue",
  "green",
];

export const PRODUCTS: readonly Product[] = [
  {
    id: "danang-storm-green",
    name: "Set quần áo bóng đá Concept Da Nang Storm Green",
    price: 210_000,
    category: "Set quần áo bóng đá",
    colors: ["green", "black"],
    primaryColor: "green",
    image: `${UPLOADS}/2025/11/STORM-GREEN-300x300.jpg`,
    type: "set",
    isNew: true,
  },
  {
    id: "danang-storm-black",
    name: "Set quần áo bóng đá Concept Da Nang Storm Black",
    price: 210_000,
    category: "Set quần áo bóng đá",
    colors: ["black", "red", "purple", "yellow", "blue"],
    primaryColor: "black",
    image: `${UPLOADS}/2025/11/STORM-GREEN-BLACK-300x300.jpg`,
    type: "set",
    isNew: true,
  },
  {
    id: "danang-storm-white",
    name: "Set quần áo bóng đá Concept Da Nang Storm White",
    price: 220_000,
    category: "Set quần áo bóng đá",
    colors: ["white", "orange", "gray", "blue", "green"],
    primaryColor: "white",
    image: `${UPLOADS}/2025/11/STORM-WHITE-BLUE-300x300.jpg`,
    type: "set",
    isNew: true,
  },
  {
    id: "danang-storm-orange",
    name: "Set quần áo bóng đá Concept Da Nang Storm Orange",
    price: 210_000,
    category: "Set quần áo bóng đá",
    colors: ["orange", "red", "purple", "blue"],
    primaryColor: "orange",
    image: `${UPLOADS}/2025/11/STORM-ORANGE-GREEN-300x300.jpg`,
    type: "set",
    isNew: true,
  },
  {
    id: "danang-storm-blue",
    name: "Set quần áo bóng đá Concept Da Nang Storm blue",
    price: 210_000,
    category: "Set quần áo bóng đá",
    colors: ["blue"],
    primaryColor: "blue",
    image: `${UPLOADS}/2025/11/STORM-BLUE-300x300.jpg`,
    type: "set",
    isNew: true,
  },
  {
    id: "danang-away",
    name: "Set quần áo bóng đá Concept Danang Away",
    price: 210_000,
    category: "Áo bóng đá",
    colors: ["black", "red", "white", "yellow", "blue"],
    primaryColor: "red",
    image: `${UPLOADS}/2025/10/DANANG-AWAY3-768x768.jpg`,
    type: "set",
    isNew: false,
  },
  {
    id: "goat-1",
    name: "Set quần áo bóng đá Concept GOAT 1",
    price: 220_000,
    category: "Áo bóng đá",
    colors: ["blue"],
    primaryColor: "blue",
    image: `${UPLOADS}/2025/10/GOAT-HOME-WHITE-280x280.jpg`,
    type: "set",
    isNew: false,
  },
  {
    id: "thailand",
    name: "Set quần áo bóng đá Concept Thailand",
    price: 210_000,
    category: "Áo bóng đá",
    colors: ["red", "blue", "white"],
    primaryColor: "red",
    image: `${UPLOADS}/2025/10/THAILAND-AVA-800x800.jpg`,
    type: "set",
    isNew: false,
  },
  {
    id: "vietnam-giang-son",
    name: "Vietnam Jersey – Sắp xếp lại giang sơn",
    price: 365_000,
    category: "Áo Jersey",
    colors: ["red", "white", "yellow"],
    primaryColor: "red",
    image: `${UPLOADS}/2024/11/z6482215021927_1e7853efb62ce916be716393253d1a0f-300x300.jpg`,
    type: "jersey",
    isNew: true,
  },
  {
    id: "an-giang",
    name: "Set quần áo bóng đá – Concept An Giang",
    price: 220_000,
    category: "Set quần áo bóng đá",
    colors: ["cream"],
    primaryColor: "cream",
    image: `${UPLOADS}/2025/03/AN-GIANG-AVARTAR-300x300.jpg`,
    type: "set",
    isNew: false,
  },
  {
    id: "england",
    name: "Set quần áo bóng đá Concept England",
    price: 210_000,
    category: "Set quần áo bóng đá",
    colors: ["white"],
    primaryColor: "white",
    image: `${UPLOADS}/2024/11/ENG-1-FRONT-300x300.jpg`,
    type: "set",
    isNew: false,
  },
  {
    id: "vietnam-rvbb",
    name: "Set quần áo bóng đá – Việt Nam Rừng Vàng Biển Bạc",
    price: 210_000,
    category: "Set quần áo bóng đá",
    colors: ["black", "red", "gray", "blue", "green"],
    primaryColor: "green",
    image: `${UPLOADS}/2024/11/VN-RVBB-AWAY-RED-300x300.jpg`,
    type: "set",
    isNew: false,
  },
  {
    id: "brazil",
    name: "Set quần áo bóng đá Concept Brazil",
    price: 210_000,
    category: "Set quần áo bóng đá",
    colors: ["orange", "purple", "white", "yellow"],
    primaryColor: "yellow",
    image: `${UPLOADS}/2024/11/gen-h-tong-300x300.jpg`,
    type: "set",
    isNew: false,
  },
  {
    id: "spain",
    name: "Set quần áo bóng đá Concept Tây Ban Nha",
    price: 210_000,
    category: "Set quần áo bóng đá",
    colors: ["red"],
    primaryColor: "red",
    image: `${UPLOADS}/2024/11/SPAIN-1-FRONT2-300x300.jpg`,
    type: "set",
    isNew: false,
  },
  {
    id: "goat",
    name: "Set quần áo bóng đá Concept GOAT",
    price: 210_000,
    category: "Áo bóng đá",
    colors: ["white"],
    primaryColor: "white",
    image: `${UPLOADS}/2025/10/GOAT-HOME-1-GOLD-scaled-300x300.jpg`,
    type: "polo",
    isNew: false,
  },
  {
    id: "argentina",
    name: "Set quần áo bóng đá Concept Argentina",
    price: 220_000,
    category: "Áo bóng đá",
    colors: ["blue"],
    primaryColor: "blue",
    image: `${UPLOADS}/2024/11/gen-h-z7195942007819_db522f4d24bf24bd339b4166925a0983-300x300.jpg`,
    type: "set",
    isNew: false,
  },
];

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "thongtin-land",
    club: "CLB Thongtin.land",
    quote:
      "Một thiết kế phủ công nghệ lên vùng đất Tây Nguyên — đúng tinh thần đội bóng muốn thể hiện.",
    image: "/images/9231-1-600x400.jpg",
  },
  {
    id: "fetch-fc",
    club: "Fetch FC",
    quote:
      "Chất lượng vải và đường may vượt mong đợi, cả đội ai cũng tự hào khi khoác lên người.",
    image: "/images/752-1-600x400.jpg",
  },
  {
    id: "top-dogs",
    club: "Top Dogs FC",
    quote:
      "Thiết kế riêng dành cho nhà đương kim vô địch — câu chuyện của chúng tôi được kể trọn vẹn.",
    image: "/images/DSC01414-600x400.jpg",
  },
  {
    id: "goat",
    club: "Trung tâm bóng đá G.O.A.T",
    quote:
      "Dreamkit đồng hành cùng dự án đào tạo trẻ của chúng tôi bằng cả sự tâm huyết.",
    image: "/images/DSC00250-600x400.jpg",
  },
  {
    id: "mie-stars",
    club: "Mie Stars FC",
    quote: "Quy trình tư vấn rõ ràng, giao hàng đúng hẹn, sản phẩm đẹp đúng ý.",
    image: "/images/que-600x400.jpg",
  },
  {
    id: "huong-dan-vien",
    club: "CLB Hướng Dẫn Viên Cần Thơ",
    quote: "Bộ kit mang đậm bản sắc đội bóng, ai nhìn cũng nhận ra ngay.",
    image: "/images/CHAUCAM18569-600x429.jpg",
  },
];

export const JOURNEY_STORIES: readonly JourneyStory[] = [
  {
    id: "buon-me",
    location: "Buôn Mê",
    title: "Hành trình ở Buôn Mê",
    excerpt:
      "Dreamkit đồng hành cùng CLB Thongtin.land trong lần hợp tác đầu tiên, phủ công nghệ lên vùng đất Tây Nguyên.",
    image: "/images/DSC_5276-768x513.jpg",
  },
  {
    id: "thu-do",
    location: "Thủ Đô",
    title: "Hành trình ở Thủ Đô",
    excerpt:
      "Đại diện Dreamkit vinh hạnh nhận giải thưởng cho những thiết kế áo đấu xuất sắc của CLB CAHN.",
    image: "/images/CAHN-600x649.jpg",
  },
  {
    id: "da-nang",
    location: "Đà Nẵng",
    title: "Hành trình ở Đà Nẵng",
    excerpt:
      "Dreamkit hân hạnh đồng hành cùng Trung tâm đào tạo bóng đá GOAT — dự án tâm huyết của thế hệ trẻ Việt.",
    image: `${UPLOADS}/2025/10/GOAT-TM-1.jpg`,
  },
];

export const FEATURED_STORY: FeaturedStory = {
  id: "top-dogs",
  club: "Top Dogs FC",
  title: "Một thiết kế riêng cho nhà đương kim vô địch",
  body:
    "Chiếc áo là câu chuyện về những con người sống ở TP. Hồ Chí Minh hoa lệ, đến với nhau bằng tình yêu bóng đá sau một ngày tất bật với công việc — hướng đến hành trình bảo vệ danh hiệu Ultimate.",
  image: "/images/z7004268926018_7106951106858b4aa62b4753c704e19f-1536x863.jpg",
  palette: [
    { label: "Primary", hex: "#16130f" },
    { label: "Secondary", hex: "#b07d4b" },
  ],
};

/** Wide cover image used as the hero backdrop. */
export const HERO_IMAGE = "/images/ANH-BIA.jpg";

const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

/**
 * Formats a VND price, e.g. 210000 -> "210.000 ₫".
 *
 * Deliberately avoids `style: "currency"`: the whitespace Intl inserts
 * between the number and the currency symbol comes from ICU locale data,
 * which can differ between Node's bundled ICU (server render) and the
 * browser's ICU (client render) — producing a React hydration mismatch even
 * for a "0 ₫" placeholder. Formatting the digits and appending a literal
 * space keeps the string byte-identical across environments.
 */
export function formatPrice(value: number): string {
  return `${VND_FORMATTER.format(value)} ₫`;
}
