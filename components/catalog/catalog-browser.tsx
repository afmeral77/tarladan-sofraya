"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BadgeCheck, Check, GitCompareArrows, Image as ImageIcon, MapPin, Package, X } from "lucide-react";
import { formatDate, formatNumber, formatPrice, productHref, productImageUrl, producerHref, unitLabel } from "@/lib/catalog/format";
import type { CatalogProduct } from "@/lib/catalog/types";

type Props = { products: CatalogProduct[] };

export function CatalogBrowser({ products }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareMessage, setCompareMessage] = useState("");
  const selectedProducts = useMemo(
    () => selectedIds.map((id) => products.find((product) => product.id === id)).filter((product): product is CatalogProduct => Boolean(product)),
    [products, selectedIds],
  );

  function toggleCompare(product: CatalogProduct) {
    setSelectedIds((current) => {
      if (current.includes(product.id)) {
        setCompareMessage("");
        return current.filter((id) => id !== product.id);
      }
      if (current.length >= 3) {
        setCompareMessage("Aynı anda en fazla üç ürünü karşılaştırabilirsiniz.");
        return current;
      }
      setCompareMessage("");
      return [...current, product.id];
    });
  }

  return (
    <>
      <div className="catalog-product-grid">
        {products.map((product) => {
          const imageUrl = productImageUrl(product.image_path);
          const selected = selectedIds.includes(product.id);
          const producer = product.producer;
          if (!producer) return null;
          const isVerified = producer?.verification_status === "approved" && producer.is_public;
          return (
            <article className="catalog-product-card" key={product.id}>
              <div className="catalog-product-photo">
                {imageUrl ? (
                  <img src={imageUrl} alt={`${product.name} ürünü`} loading="lazy" />
                ) : (
                  <div className="catalog-photo-empty" aria-label="Ürün fotoğrafı henüz eklenmemiş">
                    <ImageIcon size={27} strokeWidth={1.4} aria-hidden="true" />
                    <span>Fotoğraf bekleniyor</span>
                  </div>
                )}
                <span className="catalog-category-tag">{product.category?.name ?? "Tarım ürünü"}</span>
              </div>
              <div className="catalog-product-body">
                <div className="catalog-producer-row">
                  <Link href={producerHref(producer.user_id)} className="catalog-producer-link">
                    {producer.public_name}
                  </Link>
                  {isVerified && <span className="verified-mark" title="Üretici doğrulanmış"><BadgeCheck size={15} aria-label="Üretici doğrulanmış" /></span>}
                </div>
                <h2><Link href={productHref(product.slug, product.id)}>{product.name}</Link></h2>
                <p className="catalog-origin"><MapPin size={13} aria-hidden="true" /> {product.origin_city || producer?.city || "Bölge bilgisi yok"}{(product.origin_region || producer?.region) ? ` · ${product.origin_region || producer?.region}` : ""}</p>
                <div className="catalog-card-facts">
                  <span><Package size={14} aria-hidden="true" /> {product.inventory ? `${formatNumber(product.inventory.available_quantity)} ${unitLabel(product.unit)} stokta` : "Stok bilgisi yok"}</span>
                  {product.harvest?.harvest_date && <span>Hasat: {formatDate(product.harvest.harvest_date)}</span>}
                  {product.quality_grade && <span>Kalite: {product.quality_grade}</span>}
                </div>
                <div className="catalog-card-bottom">
                  <div><strong>{formatPrice(product.price_per_unit, product.unit)}</strong><span>Min. {formatNumber(product.minimum_order_qty)} {unitLabel(product.unit)}</span></div>
                  <Link href={productHref(product.slug, product.id)} className="catalog-detail-link">Ürünü incele <span aria-hidden="true">→</span></Link>
                </div>
                <button
                  type="button"
                  className={`catalog-compare-button${selected ? " selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleCompare(product)}
                >
                  {selected ? <Check size={15} aria-hidden="true" /> : <GitCompareArrows size={15} aria-hidden="true" />}
                  {selected ? "Karşılaştırmada" : "Karşılaştırmaya ekle"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {compareMessage && <p className="catalog-compare-message" role="status">{compareMessage}</p>}
      {selectedProducts.length > 0 && (
        <section className="catalog-compare-dock" aria-label="Ürün karşılaştırması">
          <div className="catalog-compare-heading">
            <div><span className="eyebrow"><span className="eyebrow-dot" /> KARŞILAŞTIRMA</span><h2>Seçtiklerinizi yan yana görün.</h2></div>
            <button type="button" className="catalog-clear-compare" onClick={() => { setSelectedIds([]); setCompareMessage(""); }}><X size={15} aria-hidden="true" /> Temizle</button>
          </div>
          <div className="catalog-compare-scroll" tabIndex={0} aria-label="Karşılaştırma tablosu; mobilde yatay kaydırılabilir">
            <table>
              <thead><tr><th scope="col">Ürün</th><th scope="col">Üretici / bölge</th><th scope="col">Birim fiyatı</th><th scope="col">Kalite</th><th scope="col">Stok</th><th scope="col">Minimum</th><th scope="col">Hasat</th><th scope="col"><span className="visually-hidden">İşlem</span></th></tr></thead>
              <tbody>{selectedProducts.map((product) => (
                <tr key={product.id}>
                  <th scope="row"><Link href={productHref(product.slug, product.id)}>{product.name}</Link></th>
                  <td>{product.producer?.public_name ?? "—"}<small>{product.origin_city || product.producer?.city || ""}{product.origin_region ? ` · ${product.origin_region}` : ""}</small></td>
                  <td>{formatPrice(product.price_per_unit, product.unit)}</td>
                  <td>{product.quality_grade || "—"}</td>
                  <td>{product.inventory ? `${formatNumber(product.inventory.available_quantity)} ${unitLabel(product.unit)}` : "—"}</td>
                  <td>{formatNumber(product.minimum_order_qty)} {unitLabel(product.unit)}</td>
                  <td>{product.harvest?.harvest_date ? formatDate(product.harvest.harvest_date) : "—"}</td>
                  <td><button type="button" className="catalog-remove-compare" onClick={() => toggleCompare(product)} aria-label={`${product.name} ürününü karşılaştırmadan çıkar`}><X size={16} aria-hidden="true" /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
