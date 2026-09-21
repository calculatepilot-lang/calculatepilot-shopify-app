import { authenticate } from "../shopify.server";

// Mandatory Shopify compliance webhook.
// CalculatePilot stores no customer PII — only a shop-level metafield
// (the selected calculator) and the OAuth session. There is no customer
// data to return, so we simply acknowledge the request.
export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(
    `Received ${topic} webhook for ${shop} (customer ${payload?.customer?.id ?? "unknown"}) — no customer data is stored by this app`,
  );

  return new Response();
};
