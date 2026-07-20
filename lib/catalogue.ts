import { slugifyProductId } from "./product-admin";
import type { CatalogueCollection, CatalogueItem, ColorKey, Product, ProductType } from "./types";

const CATALOGUE_IMAGES = "/images/catalogue";

/** Fixed order of the catalogue page's category tabs. */
export const CATALOGUE_TYPE_TABS: readonly ProductType[] = ["set", "jersey", "polo"];

function item(
  id: string,
  filename: string,
  alt: string,
  colors: readonly ColorKey[],
  /** Largest resolution available for this file: full original, or a 2048px export. */
  fullVariant: "original" | "2048" = "original",
) {
  const fullSuffix = fullVariant === "2048" ? "-2048x2048" : "";
  return {
    id,
    image: `${CATALOGUE_IMAGES}/${filename}-400x400.jpg`,
    fullImage: `${CATALOGUE_IMAGES}/${filename}${fullSuffix}.jpg`,
    alt,
    colors,
  };
}

/** Product catalogue collections mirrored from dreamkit.vn/catalogue/. */
export const CATALOGUE_COLLECTIONS: readonly CatalogueCollection[] = [
  {
    id: "than-ma",
    title: "BỘ SƯU TẬP THẦN MÃ (THÁNH GIÓNG)",
    items: [
      item("than-ma-1", "H1", "Thiết kế Thần Mã 1", ["white"], "2048"),
      item("than-ma-2", "H2", "Thiết kế Thần Mã 2", ["black"], "2048"),
      item("than-ma-3", "H3", "Thiết kế Thần Mã 3", ["red"], "2048"),
      item("than-ma-4", "H4", "Thiết kế Thần Mã 4", ["yellow"], "2048"),
      item("than-ma-5", "H5", "Thiết kế Thần Mã 5", ["blue"], "2048"),
    ],
  },
  {
    id: "goat",
    title: "BỘ SƯU TẬP G.O.A.T",
    items: [
      item("goat-1", "GOAT1", "Thiết kế G.O.A.T 1", ["blue"], "2048"),
      item("goat-2", "GOAT2", "Thiết kế G.O.A.T 2", ["yellow"], "2048"),
      item("goat-3", "GOAT3", "Thiết kế G.O.A.T 3", ["blue"], "2048"),
      item("goat-4", "GOAT4", "Thiết kế G.O.A.T 4", ["black"], "2048"),
      item("goat-5", "GOAT5", "Thiết kế G.O.A.T 5", ["red"], "2048"),
    ],
  },
  {
    id: "rvbb",
    title: "BỘ SƯU TẬP RỪNG VÀNG BIỂN BẠC",
    items: [
      item(
        "rvbb-1",
        "z7679967897854_82d328d6efeccc5ea3e9cab803c9762e-1",
        "Thiết kế Rừng Vàng Biển Bạc 1",
        ["gray"],
      ),
      item(
        "rvbb-2",
        "z7679967897591_a543d9575ad7dfca3e7cb5902ccd54cb-1",
        "Thiết kế Rừng Vàng Biển Bạc 2",
        ["blue"],
      ),
      item(
        "rvbb-3",
        "z7679968033646_70a60587f87fe7a1045b919258a50017-1",
        "Thiết kế Rừng Vàng Biển Bạc 3",
        ["red"],
      ),
      item(
        "rvbb-4",
        "z7679967982223_93c35820c32e498bcdc64bc8e4983f60-1",
        "Thiết kế Rừng Vàng Biển Bạc 4",
        ["green"],
      ),
      item(
        "rvbb-5",
        "z7679968132054_cabbd122554a4c492775a367d3076487-1",
        "Thiết kế Rừng Vàng Biển Bạc 5",
        ["black"],
      ),
    ],
  },
  {
    id: "tay-son",
    title: "BỘ SƯU TẬP TÂY SƠN",
    items: [
      item("tay-son-1", "TS1-1", "Thiết kế Tây Sơn 1", ["red", "white"], "2048"),
      item("tay-son-2", "TS2-1", "Thiết kế Tây Sơn 2", ["white", "blue"], "2048"),
      item("tay-son-3", "TS3-1", "Thiết kế Tây Sơn 3", ["black", "orange"], "2048"),
    ],
  },
  {
    id: "doi-vai-nguoi-linh",
    title: "BỘ SƯU TẬP ĐÔI VAI NGƯỜI LÍNH",
    items: [
      item(
        "doi-vai-1",
        "z7644358926737_d2dfdd8ea6be4dd591a837e1d5d496d6-1",
        "Thiết kế Đôi Vai Người Lính 1",
        ["green"],
      ),
      item(
        "doi-vai-2",
        "z7644357452747_1fde0ba21907122eec4492bdbc3d471f-1",
        "Thiết kế Đôi Vai Người Lính 2",
        ["yellow"],
      ),
      item(
        "doi-vai-3",
        "z7644358761979_f34cb5e6c2701ce04893b962925cd4df-1",
        "Thiết kế Đôi Vai Người Lính 3",
        ["blue"],
      ),
      item(
        "doi-vai-4",
        "z7644359034931_1f73481a40aa98f65ae75933bca6c9ee-1",
        "Thiết kế Đôi Vai Người Lính 4",
        ["red"],
      ),
    ],
  },
  {
    id: "me-ca-day",
    title: "BỘ SƯU TẬP MẺ CÁ ĐẦY",
    items: [
      item(
        "me-ca-day-1",
        "z7644357507200_6976c261e53fef2f6aba747dcaaa5d8f-1",
        "Thiết kế Mẻ Cá Đầy 1",
        ["blue"],
      ),
      item(
        "me-ca-day-2",
        "z7644357670028_6aad48902aeca217f2f2ee9d31d45f0f-1",
        "Thiết kế Mẻ Cá Đầy 2",
        ["red"],
      ),
      item(
        "me-ca-day-3",
        "z7644357779853_69b0c8bf9d9049642f9fcc911aa6ec63-1",
        "Thiết kế Mẻ Cá Đầy 3",
        ["purple"],
      ),
    ],
  },
  {
    id: "nhip-cau-nang",
    title: "BỘ SƯU TẬP NHỊP CẦU NÂNG",
    items: [
      item(
        "nhip-cau-nang-1",
        "z7644358597690_60ff983c130ee8d8cc6950ab30dc58f5-1",
        "Thiết kế Nhịp Cầu Nâng 1",
        ["white"],
        "2048",
      ),
      item(
        "nhip-cau-nang-2",
        "z7644358597690_60ff983c130ee8d8cc6950ab30dc58f52-1",
        "Thiết kế Nhịp Cầu Nâng 2",
        ["orange"],
        "2048",
      ),
      item(
        "nhip-cau-nang-3",
        "z7644358597690_60ff983c130ee8d8cc6950ab30dc58f55-1",
        "Thiết kế Nhịp Cầu Nâng 3",
        ["black"],
        "2048",
      ),
    ],
  },
  {
    id: "cuu-sinh",
    title: "BỘ SƯU TẬP CỨU SINH",
    items: [
      item(
        "cuu-sinh-1",
        "z7644358216433_5279ee0af54f998ec739b41f1f64c6f3-1",
        "Thiết kế Cứu Sinh 1",
        ["orange"],
      ),
      item(
        "cuu-sinh-2",
        "z7644357942454_989f5e693c39a8d5da2971f19c65b19c-1",
        "Thiết kế Cứu Sinh 2",
        ["blue"],
      ),
      item(
        "cuu-sinh-3",
        "z7644358325552_eafbd80f0c792c4fc3fe392e820a5e49-1",
        "Thiết kế Cứu Sinh 3",
        ["white"],
      ),
      item(
        "cuu-sinh-4",
        "z7644358051580_eff17c6785f6385be68119c052af19cf-1",
        "Thiết kế Cứu Sinh 4",
        ["green"],
      ),
    ],
  },
];

/**
 * Groups products by `collectionName` and turns each group's `collectionImages`
 * into a catalogue gallery. Products with no collection name or no collection
 * images don't contribute a collection. Image URLs shared by several products
 * in the same collection are deduplicated; an item's colours are the union of
 * the colour tagged on that image by every product that supplied it.
 */
export function buildCatalogueCollectionsFromProducts(
  products: readonly Product[],
): readonly CatalogueCollection[] {
  const order: string[] = [];
  const imagesByName = new Map<string, Map<string, ColorKey[]>>();
  /** First product seen for each collection name; supplies the category tab, detail link and video URL. */
  const representativeByName = new Map<string, Product>();

  for (const product of products) {
    const name = product.collectionName?.trim();
    const images = product.collectionImages ?? [];
    if (!name || images.length === 0) {
      continue;
    }

    let imageColors = imagesByName.get(name);
    if (!imageColors) {
      imageColors = new Map();
      imagesByName.set(name, imageColors);
      order.push(name);
      representativeByName.set(name, product);
    }

    for (const entry of images) {
      const colors = imageColors.get(entry.url) ?? [];
      if (!colors.includes(entry.color)) {
        colors.push(entry.color);
      }
      imageColors.set(entry.url, colors);
    }
  }

  return order.map((name) => {
    const id = slugifyProductId(name);
    const items: CatalogueItem[] = [...imagesByName.get(name)!.entries()].map(
      ([url, colors], index) => ({
        id: `${id}-${index}`,
        image: url,
        fullImage: url,
        alt: name,
        colors,
      }),
    );
    const representative = representativeByName.get(name)!;
    return {
      id,
      title: name,
      items,
      productType: representative.type,
      productId: representative.id,
      videoUrl: representative.videoUrl,
    };
  });
}

/** Returns every colour that appears in at least one catalogue item. */
export function getCatalogueFilterColors(
  collections: readonly CatalogueCollection[],
): readonly ColorKey[] {
  const seen = new Set<ColorKey>();
  for (const collection of collections) {
    for (const entry of collection.items) {
      for (const color of entry.colors) {
        seen.add(color);
      }
    }
  }
  return [...seen];
}
