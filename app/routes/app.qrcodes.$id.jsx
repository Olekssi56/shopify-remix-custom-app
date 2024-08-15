import { useState } from "react";
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
    Bleed,
    Button,
    ChoiceList,
    Divider,
    EmptyState,
    InlineStack,
    InlineError,
    Layout,
    Page,
    Text,
    TextField,
    Thumbnail,
    BlockStack,
    PageActions,
    DatePicker
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import db from "../db.server";
import { getQRCode, validateQRCode } from "../models/QRCode.server";

export async function loader({ request, params }) {
    const { admin } = await authenticate.admin(request);

    if (params.id === "new") {
        return json({
            destination: "product",
            title: "",
        });
    }

    return json(await getQRCode(Number(params.id), admin.graphql));
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
        await db.qRCode.delete({ where: { id: Number(params.id) } });
        return redirect("/app");
    }

    const errors = validateQRCode(data);

    if (errors) {
        return json({ errors }, { status: 422 });
    }

    const qrCode =
        params.id === "new"
            ? await db.qRCode.create({ data })
            : await db.qRCode.update({ where: { id: Number(params.id) }, data });

    return redirect(`/app/qrcodes/${qrCode.id}`);
}

export default function QRCodeForm() {
    const errors = useActionData()?.errors || {};

    const qrCode = useLoaderData();
    const [formState, setFormState] = useState(qrCode);
    const [cleanFormState, setCleanFormState] = useState(qrCode);
    const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

    const nav = useNavigation();
    const isSaving =
        nav.state === "submitting" && nav.formData?.get("action") !== "delete";
    const isDeleting =
        nav.state === "submitting" && nav.formData?.get("action") === "delete";

    const navigate = useNavigate();

    async function selectProduct() {
        const products = await window.shopify.resourcePicker({
            type: "product",
            action: "select", // customized action verb, either 'select' or 'add',
        });

        if (products) {
            const { images, id, variants, title, handle } = products[0];

            setFormState({
                ...formState,
                productId: id,
                productVariantId: variants[0].id,
                productTitle: title,
                productHandle: handle,
                productAlt: images[0]?.altText,
                productImage: images[0]?.originalSrc,
            });
        }
    }

    const submit = useSubmit();
    function handleSave() {
        const data = {
            title: formState.title,
            productId: formState.productId || "",
            productVariantId: formState.productVariantId || "",
            productHandle: formState.productHandle || "",
            destination: formState.destination,
        };

        setCleanFormState({ ...formState });
        submit(data, { method: "post" });
    }

    return (
        <Page>
            <ui-title-bar title={qrCode.id ? "Edit Disable Date" : "Create Disable Date"}>
                <button variant="breadcrumb" onClick={() => navigate("/app")}>
                    Home /
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
                                <DatePicker
                                    month={new Date().getMonth()}
                                    year={new Date().getFullYear()}
                                    onChange={() => {}}
                                    // selected={selectedDates}
                                    // disableDates={disabledDates}
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
                                disabled: !qrCode.id || !qrCode || isSaving || isDeleting,
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
