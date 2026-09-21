import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { HealthCheck, type HealthCheckItem } from "../src/status/health-check/react.js";
import {
  ShoppingCart,
  CreditCard,
  Search,
  Webhook,
  Sparkles,
  BrainCircuit,
  Database,
  Server,
  Globe,
} from "lucide-react";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/status/health-check");

// icon identities for the custom-copy variants (resolved from the golden HTML lucide classes)
const ecommerce: HealthCheckItem[] = [
  { icon: ShoppingCart, name: "Checkout", region: "us-east-1", status: "operational", latency: "68 ms" },
  { icon: CreditCard, name: "Payments", region: "Stripe · primary", status: "operational", latency: "112 ms" },
  { icon: Search, name: "Product Search", region: "eu-west-1", status: "degraded", latency: "640 ms" },
  { icon: Webhook, name: "Order Webhooks", region: "queue · 3 retries", status: "operational", latency: "24 ms" },
];

const aiStack: HealthCheckItem[] = [
  { icon: Sparkles, name: "LLM Gateway", region: "us-east-1", status: "operational", latency: "184 ms" },
  { icon: BrainCircuit, name: "Embeddings", region: "us-east-1", status: "operational", latency: "92 ms" },
  { icon: Database, name: "Vector DB", region: "Pinecone · prod", status: "down", latency: "n/a" },
  { icon: Server, name: "Model Server", region: "gpu-cluster-04", status: "degraded", latency: "1.2 s" },
];

const minimalStack: HealthCheckItem[] = [
  { icon: Globe, name: "Web App", region: "edge · global", status: "operational", latency: "38 ms" },
  { icon: Server, name: "API", region: "us-east-1", status: "operational", latency: "54 ms" },
  { icon: Database, name: "Postgres", region: "primary", status: "operational", latency: "6 ms" },
];

runGoldenParity("status/health-check", {
  blockDir,
  Component: HealthCheck,
  variants: [
    { label: "e-commerce · partial degradation", props: { title: "Shop Status", items: ecommerce } },
    { label: "ai stack · outage", props: { title: "Inference Stack", items: aiStack } },
    { label: "minimal stack · all operational", props: { title: "Production", items: minimalStack } },
  ],
});
