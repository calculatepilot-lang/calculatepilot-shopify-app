import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

const CATALOG_URL = "https://www.calculatepilot.com/calculators.json";

const CATEGORY_LABELS = {
  financial: "Financial",
  health: "Health & Fitness",
  math: "Math",
  other: "Everyday",
};

function normalizeCalculator(item) {
  if (!item || typeof item.name !== "string" || typeof item.href !== "string") {
    return null;
  }

  const match = item.href.match(/^\/(financial|health|math|other)\/([a-z0-9-]+)\.html$/i);
  if (!match) return null;

  const categoryKey = match[1].toLowerCase();

  return {
    name: item.name.trim(),
    href: item.href,
    path: `${categoryKey}/${match[2].toLowerCase()}`,
    categoryKey,
    category: CATEGORY_LABELS[categoryKey],
  };
}

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  try {
    const response = await fetch(CATALOG_URL, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`CalculatePilot catalogue returned ${response.status}`);
    }

    const source = await response.json();
    const calculators = Array.isArray(source)
      ? source.map(normalizeCalculator).filter(Boolean)
      : [];

    calculators.sort((a, b) => a.name.localeCompare(b.name));

    return { calculators, catalogueError: null };
  } catch (error) {
    console.error("CalculatePilot catalogue error:", error);
    return {
      calculators: [],
      catalogueError:
        "The calculator library could not be loaded. Refresh the app and try again.",
    };
  }
};

export default function Index() {
  const { calculators, catalogueError } = useLoaderData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filteredCalculators = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return calculators.filter((calculator) => {
      const matchesCategory =
        category === "all" || calculator.categoryKey === category;
      const matchesQuery =
        normalizedQuery === "" ||
        calculator.name.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [calculators, query, category]);

  return (
    <s-page heading="CalculatePilot">
      <s-section heading="Calculator Library">
        <s-paragraph>
          Search the CalculatePilot library and add a calculator to your
          Shopify storefront.
        </s-paragraph>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(240px, 1fr) minmax(180px, 240px)",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          <label style={{ display: "grid", gap: "6px" }}>
            <span style={{ fontWeight: 600 }}>Search calculators</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try mortgage, BMI, percentage..."
              style={{
                width: "100%",
                minHeight: "40px",
                padding: "8px 12px",
                border: "1px solid #8a8a8a",
                borderRadius: "8px",
                font: "inherit",
                background: "#fff",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "6px" }}>
            <span style={{ fontWeight: 600 }}>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={{
                width: "100%",
                minHeight: "40px",
                padding: "8px 12px",
                border: "1px solid #8a8a8a",
                borderRadius: "8px",
                font: "inherit",
                background: "#fff",
              }}
            >
              <option value="all">All calculators</option>
              <option value="financial">Financial</option>
              <option value="health">Health &amp; Fitness</option>
              <option value="math">Math</option>
              <option value="other">Everyday</option>
            </select>
          </label>
        </div>
      </s-section>

      <s-section heading="Available calculators">
        {catalogueError ? (
          <div
            style={{
              padding: "16px",
              border: "1px solid #d72c0d",
              borderRadius: "10px",
            }}
          >
            {catalogueError}
          </div>
        ) : filteredCalculators.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            No calculators match your search.
          </div>
        ) : (
          <>
            <p style={{ margin: "0 0 16px", color: "#616161" }}>
              {filteredCalculators.length} calculator
              {filteredCalculators.length === 1 ? "" : "s"} found
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {filteredCalculators.map((calculator) => (
                <div
                  key={calculator.path}
                  style={{
                    border: "1px solid #e3e3e3",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      margin: 0,
                      color: "#616161",
                    }}
                  >
                    {calculator.category}
                  </p>

                  <h3 style={{ fontSize: "16px", margin: 0 }}>
                    {calculator.name}
                  </h3>

                  <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                    <s-button
                      href={`/app/calculators/select?path=${encodeURIComponent(
                        calculator.path,
                      )}&name=${encodeURIComponent(calculator.name)}`}
                      variant="primary"
                    >
                      Add to theme
                    </s-button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </s-section>

      <s-section heading="How it works">
        <s-paragraph>
          Search for a calculator, choose Add to theme, then review the
          CalculatePilot app block in Shopify's theme editor and save your
          theme.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}
