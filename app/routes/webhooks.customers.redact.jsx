import { authenticate } from "../shopify.server";

// Mandatory Shopify compliance webhook.
// CalculatePilot stores no customer PII, so there is nothing to redact.
export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(
    `Received ${topic} webhook for ${shop} (customer ${payload?.customer?.id ?? "unknown"}) — no customer data is stored by this app`,
  );

  return new Response();
};
