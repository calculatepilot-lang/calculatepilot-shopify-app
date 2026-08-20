import { useEffect } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

const allowedCalculators = new Set([
  "percentage-calculator",
  "profit-margin-calculator",
  "discount-calculator",
]);

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);

  const slug = params.slug;

  if (!slug || !allowedCalculators.has(slug)) {
    throw new Response("Calculator not found", { status: 404 });
  }

  const installationResponse = await admin.graphql(`
    #graphql
    query CurrentAppInstallation {
      currentAppInstallation {
        id
      }
    }
  `);

  const installationJson = await installationResponse.json();
  const ownerId = installationJson.data.currentAppInstallation.id;

  const metafieldResponse = await admin.graphql(
    `
      #graphql
      mutation SaveSelectedCalculator($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            ownerId,
            namespace: "calculatepilot",
            key: "selected_calculator",
            type: "single_line_text_field",
            value: slug,
          },
        ],
      },
    },
  );

  const metafieldJson = await metafieldResponse.json();
  const errors = metafieldJson.data?.metafieldsSet?.userErrors || [];

  if (errors.length > 0) {
    console.error("CalculatePilot metafield error:", errors);
    throw new Response("Unable to select calculator", { status: 500 });
  }

  const shop = session.shop;

  const themeEditorUrl =
    `https://${shop}/admin/themes/current/editor` +
    `?template=index` +
    `&addAppBlockId=b75bc1447309d19a739549a4a75e5f60/calculatepilot_calculator` +
    `&target=newAppsSection`;

  return { themeEditorUrl };
};

export default function CalculatorSelectionRoute() {
  const { themeEditorUrl } = useLoaderData();

  useEffect(() => {
    window.top.location.href = themeEditorUrl;
  }, [themeEditorUrl]);

  return (
    <s-page heading="CalculatePilot">
      <s-section heading="Opening Shopify Theme Editor">
        <s-paragraph>
          Your calculator has been selected. Opening the theme editor...
        </s-paragraph>
      </s-section>
    </s-page>
  );
}