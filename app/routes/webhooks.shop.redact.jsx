import { authenticate } from "../shopify.server";
import db from "../db.server";

// Mandatory Shopify compliance webhook, sent ~48 hours after an app is
// uninstalled. Deletes all data this app stores locally for the shop.
// (The selected-calculator metafield lives on Shopify's own store, not
// in our database, and is removed by Shopify itself along with the app.)
export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop} — purging local data`);

  await db.session.deleteMany({ where: { shop } });

  return new Response();
};
