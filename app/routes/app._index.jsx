import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

const calculators = [
  {
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    category: "Math",
    description: "Calculate percentages quickly and easily.",
  },
  {
    name: "Profit Margin Calculator",
    slug: "profit-margin-calculator",
    category: "Business",
    description: "Calculate profit margin, markup, and related values.",
  },
  {
    name: "Discount Calculator",
    slug: "discount-calculator",
    category: "Shopping",
    description: "Calculate discounts and final prices.",
  },
];

export default function Index() {
  return (
    <s-page heading="CalculatePilot">
      <s-section heading="Calculator Library">
        <s-paragraph>
          Browse CalculatePilot calculators and add them to your Shopify
          storefront.
        </s-paragraph>
      </s-section>

      <s-section heading="Available calculators">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {calculators.map((calculator) => (
            <div
              key={calculator.slug}
              style={{
                border: "1px solid #e3e3e3",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  margin: "0 0 8px",
                  color: "#616161",
                }}
              >
                {calculator.category}
              </p>

              <h3
                style={{
                  fontSize: "16px",
                  margin: "0 0 8px",
                }}
              >
                {calculator.name}
              </h3>

              <p
                style={{
                  margin: "0 0 18px",
                  lineHeight: "1.5",
                }}
              >
                {calculator.description}
              </p>

              <s-button
                href={`/app/calculators/${calculator.slug}`}
                variant="primary"
              >
                Add to store
              </s-button>
            </div>
          ))}
        </div>
      </s-section>

      <s-section heading="How CalculatePilot works">
        <s-paragraph>
          Choose a calculator from the CalculatePilot library, configure it
          for your store, then add the CalculatePilot app block to your
          Shopify theme.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}