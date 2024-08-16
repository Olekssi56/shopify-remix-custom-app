import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
  Icon,
  InlineStack,
} from "@shopify/polaris";

import { getDisableDates } from "../models/Date.server";
import { AlertDiamondIcon, ImageIcon } from "@shopify/polaris-icons";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const dates = await getDisableDates(session.shop);

  return json({
    dates,
  });
}

const EmptyDateState = ({ onAction }) => (
  <EmptyState
    heading="Insert Disable Date for Ship"
    action={{
      content: "Insert Disable Date",
      onAction,
    }}
    // image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>This is disable dates for ship</p>
  </EmptyState>
);

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

const DateTable = ({ dates }) => (
  <IndexTable
    resourceName={{
      singular: "Disable date",
      plural: "Disable dates",
    }}
    itemCount={dates.length}
    headings={[
      { title: "Title" },
      { title: "Disable Date" },
      { title: "Date created" }
    ]}
    selectable={false}
  >
    {dates.map((date) => (
      <DateTableRow key={date.id} date={date} />
    ))}
  </IndexTable>
);

const DateTableRow = ({ date }) => (
  <IndexTable.Row id={date.id} position={date.id}>    
    <IndexTable.Cell>
      <Link to={`qrcodes/${date.id}`}>{truncate(date.title)}</Link>
    </IndexTable.Cell>
    <IndexTable.Cell>
      {new Date(date.date).toDateString()}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {new Date(date.createdAt).toDateString()}
    </IndexTable.Cell>
  </IndexTable.Row>
);

export default function Index() {
  const { dates } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page>
      <ui-title-bar title="Disable Dates">
        <button variant="primary" onClick={() => navigate("/app/dates/new")}>
          Insert new disable date
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {dates.length === 0 ? (
              <EmptyDateState onAction={() => navigate("dates/new")} />
            ) : (
              <DateTable dates={dates} />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
