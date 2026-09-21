/** Registry types + helpers for Cremona blocks. */
import type { ComponentType } from "react";
import type { BlockMeta, VariantDef } from "@cremona/core";

export interface BlockDefinition {
  meta: BlockMeta;
  /** React implementation */
  Component: ComponentType<Record<string, unknown>>;
  /** Optional per-variant props overrides (icon components etc.) */
  variantProps?: Record<string, Record<string, unknown>>;
}

export interface CatalogEntry {
  category: string;
  slug: string;
  items: {
    file: string;
    name: string;
    description: string;
    added: string;
    kind?: string;
    variants?: string[];
    cols?: number;
    categorySlug?: string;
  }[];
}

export type { BlockMeta, VariantDef };
