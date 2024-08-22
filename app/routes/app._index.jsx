import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  ChoiceList,
  FormLayout,
  Button,
  Spinner
} from "@shopify/polaris";
import React, { useState, useEffect } from 'react';

import { getDisableDates } from "../models/Date.server";
import { AlertDiamondIcon, ImageIcon } from "@shopify/polaris-icons";
import '../css/custom.css'; // Import the custom CSS file

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
      <Link to={`dates/${date.id}`}>{truncate(date.title)}</Link>
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

  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch disabled days from the server on component mount
  useEffect(() => {
    const fetchDisabledDays = async () => {
      const response = await fetch('/api/get-disabled-days');
      const days = await response.json();
      setSelectedDays(days); // Set fetched disabled days as selected in ChoiceList
    };

    fetchDisabledDays();
  }, []);

  const handleChange = (value) => {
    setSelectedDays(value);
  };

  const handleSave = async () => {
    setLoading(true); // Show the loading spinner
    try {
      const formData = new URLSearchParams();
      selectedDays.forEach(day => formData.append('disabledDays', day));
      console.log("aaaaaaaaaaaaaaaaaaa", selectedDays)

      const response = await fetch('/api/save-disabled-days', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        // Handle successful save
      } else {
        // Handle error
      }
    } catch (error) {
      console.error('Error while saving disabled days:', error);
    } finally {
      setLoading(false); // Hide the loading spinner
    }

  };


  return (
    <Page>
      <ui-title-bar title="Disable Dates">
        <button variant="primary" onClick={() => navigate("/app/dates/new")}>
          Insert new disable date
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <FormLayout>
              <ChoiceList
                title="Disable Days of the Week"
                choices={[
                  { label: 'Monday', value: "1" },
                  { label: 'Tuesday', value: "2" },
                  { label: 'Wednesday', value: "3" },
                  { label: 'Thursday', value: "4" },
                  { label: 'Friday', value: "5" },
                  { label: 'Saturday', value: "6" },
                  { label: 'Sunday', value: "0" },
                ]}
                selected={selectedDays}
                onChange={handleChange}
                allowMultiple
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 20 }}>
                <Button primary onClick={handleSave}>Save</Button>
              </div>
              {loading && (
                <div style={{ position: "absolute", top: 0, right: 0, right: 0, bottome: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: 300 }}>
                  <Spinner accessibilityLabel="Saving disabled days" size="large" />
                </div>
              )}
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
      <div style={{ height: 20 }}></div>
      <Layout>
        <Layout.Section>
          <Card padding="10">
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
