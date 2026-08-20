import { useEffect } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

const APP_BLOCK_ID =
  "b75bc1447309d19a739549a4a75e5f60/calculatepilot_calculator";

const ALLOWED_PATH = /^(financial|health|math|other)\/[a-z0-9-]+$/;

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const calculatorPath = (url.searchParams.get("path") || "").trim();
  const calculatorName = (url.searchParams.get("name") || "").trim();

  if (!ALLOWED_PATH.test(calculatorPath)) {
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
  const ownerId = installationJson.data?.currentAppInstallation?.id;

  if (!ownerId) {
    throw new Response("Unable to identify this app installation", {
      status: 500,
    });
  }

  const metafieldResponse = await admin.graphql(
    `
      #graphql
      mutation SaveSelectedCalculator($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
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
            value: calculatorPath,
          },
          {
            ownerId,
            namespace: "calculatepilot",
            key: "selected_calculator_name",
            type: "single_line_text_field",
            value: calculatorName.slice(0, 255) || "CalculatePilot Calculator",
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

  const themeEditorUrl =
    `https://${session.shop}/admin/themes/current/editor` +
    `?template=index` +
    `&addAppBlockId=${encodeURIComponent(APP_BLOCK_ID)}` +
    `&target=newAppsSection`;

  return { themeEditorUrl, calculatorName };
};

export default function CalculatorSelectionRoute() {
  const { themeEditorUrl, calculatorName } = useLoaderData();

  useEffect(() => {
    window.top.location.assign(themeEditorUrl);
  }, [themeEditorUrl]);

  return (
    <s-page heading="CalculatePilot">
      <s-section heading="Opening Shopify Theme Editor">
        <s-paragraph>
          {calculatorName || "Your calculator"} is selected. Review the app
          block in the theme editor and save your theme.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}
