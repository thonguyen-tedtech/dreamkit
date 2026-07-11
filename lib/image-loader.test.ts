import { describe, expect, it } from "vitest";
import localImageLoader, { pickLocalImageVariant } from "./image-loader";

describe("pickLocalImageVariant", () => {
  it("picks the smallest variant that still covers the requested width", () => {
    expect(pickLocalImageVariant("9231-1", 640)).toEqual({ width: 768, height: 512 });
  });

  it("picks the exact variant when the requested width matches one", () => {
    expect(pickLocalImageVariant("9231-1", 600)).toEqual({ width: 600, height: 400 });
  });

  it("falls back to the largest variant when the request exceeds all of them", () => {
    expect(pickLocalImageVariant("9231-1", 3840)).toEqual({ width: 1536, height: 1024 });
  });

  it("returns null for a basename with no known variants", () => {
    expect(pickLocalImageVariant("ANH-BIA", 600)).toBeNull();
  });
});

describe("localImageLoader", () => {
  it("maps a local image request to its nearest on-disk variant", () => {
    expect(localImageLoader({ src: "/images/9231-1-600x400.jpg", width: 768, quality: 75 })).toBe(
      "/images/9231-1-768x512.jpg",
    );
  });

  it("resolves the correct basename when another series shares a prefix", () => {
    expect(localImageLoader({ src: "/images/que-600x400.jpg", width: 1200, quality: 75 })).toBe(
      "/images/que-1200x800.jpg",
    );
  });

  it("passes through a local image with no known variants unchanged", () => {
    expect(localImageLoader({ src: "/images/ANH-BIA.jpg", width: 1920, quality: 75 })).toBe(
      "/images/ANH-BIA.jpg",
    );
  });

  it("passes through a remote (dreamkit.vn) image unchanged", () => {
    const src = "https://dreamkit.vn/wp-content/uploads/2025/10/GOAT-TM-1.jpg";
    expect(localImageLoader({ src, width: 768, quality: 75 })).toBe(src);
  });
});
