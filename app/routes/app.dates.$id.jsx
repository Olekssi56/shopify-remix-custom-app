import { useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import {
    useActionData,
    useLoaderData,
    useNavigation,
    useSubmit,
    useNavigate,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
    Card,
    Layout,
    Page,
    Text,
    TextField,
    InlineError,
    BlockStack,
    PageActions,
    DatePicker
} from "@shopify/polaris";

import db from "../db.server";
import { getDisableDate, validatDate } from "../models/Date.server";

export async function loader({ request, params }) {
    const { admin } = await authenticate.admin(request);

    if (params.id === "new") {
        return json({
            destination: "product",
            title: "",
        });
    }

    return json(await getDisableDate(Number(params.id)));
}

export async function action({ request, params }) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    /** @type {any} */
    const data = {
        ...Object.fromEntries(await request.formData()),
        shop,
    };

    if (data.action === "delete") {
        await db.disableDate.delete({ where: { id: Number(params.id) } });
        return redirect("/app");
    }

    const errors = validatDate(data);

    if (errors) {
        return json({ errors }, { status: 422 });
    }

    const disableDate =
        params.id === "new"
            ? await db.disableDate.create({ data })
            : await db.disableDate.update({ where: { id: Number(params.id) }, data });

    return redirect(`/app`);
}

export default function DisableDateForm() {
    const errors = useActionData()?.errors || {};

    const [{ month, year }, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    const handleMonthChange = useCallback(
        (month, year) => setDate({ month, year }),
        [],
    );
    const [selectedDates, setSelectedDates] = useState(
        new Date(),
    );

    const dateInfo = useLoaderData();
    const [formState, setFormState] = useState(dateInfo);
    const [cleanFormState, setCleanFormState] = useState(dateInfo);
    const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

    const nav = useNavigation();
    const isSaving =
        nav.state === "submitting" && nav.formData?.get("action") !== "delete";
    const isDeleting =
        nav.state === "submitting" && nav.formData?.get("action") === "delete";

    const navigate = useNavigate();

    const submit = useSubmit();
    function handleSave() {
        const data = {
            title: formState.title,
            date: formState.date,
        };

        setCleanFormState({ ...formState });
        submit(data, { method: "post" });
    }

    return (
        <Page>
            <ui-title-bar title={dateInfo.id ? "Edit Disable Date" : "Create Disable Date"}>
                <button variant="breadcrumb" onClick={() => navigate("/app")}>
                    Disable Dates /
                </button>
            </ui-title-bar>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        <Card>
                            <BlockStack gap="500">
                                <Text as={"h2"} variant="headingLg">
                                    Input title
                                </Text>
                                <TextField
                                    id="title"
                                    helpText="Only store staff can see this title"
                                    label="title"
                                    labelHidden
                                    autoComplete="off"
                                    value={formState.title}
                                    onChange={(title) => setFormState({ ...formState, title })}
                                    error={errors.title}
                                />
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap="500">
                                <Text as={"h2"} variant="headingLg">
                                    Select Date
                                </Text>
                                {errors.date ? (
                                    <InlineError
                                        message={errors.date}
                                        fieldID="date"
                                    />
                                ) : null}
                                <DatePicker
                                    month={month}
                                    year={year}
                                    onChange={({ start }) => {
                                        setSelectedDates(start)
                                        setFormState({ ...formState, date: new Date(start).toISOString() })
                                    }}
                                    onMonthChange={handleMonthChange}
                                    selected={selectedDates}
                                />
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                        secondaryActions={[
                            {
                                content: "Delete",
                                loading: isDeleting,
                                disabled: !dateInfo.id || !dateInfo || isSaving || isDeleting,
                                destructive: true,
                                outline: true,
                                onAction: () =>
                                    submit({ action: "delete" }, { method: "post" }),
                            },
                        ]}
                        primaryAction={{
                            content: "Save",
                            loading: isSaving,
                            disabled: !isDirty || isSaving || isDeleting,
                            onAction: handleSave,
                        }}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    );
}
