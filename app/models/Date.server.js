import db from "../db.server";

// Fetch a single disabled date by ID
export async function getDisableDate(id) {
  const disableDate = await db.disableDate.findFirst({ where: { id } });

  if (!disableDate) {
    return null;
  }

  return disableDate;
}

// Fetch all disabled dates, ordered by date descending
export async function getDisableDates(shop) {
  const disableDates = await db.disableDate.findMany({
    where: { shop },
    orderBy: { date: "desc" },
  });

  return disableDates;
}

// Create a new disabled date
export async function createDisableDate(data) {
  const { title, date } = data;

  const newDisableDate = await db.disableDate.create({
    data: {
      title,
      date,
    },
  });

  return newDisableDate;
}

// Update an existing disabled date by ID
export async function updateDisableDate(id, data) {
  const updatedDisableDate = await db.disableDate.update({
    where: { id },
    data,
  });

  return updatedDisableDate;
}

// Delete a disabled date by ID
export async function deleteDisableDate(id) {
  const deletedDisableDate = await db.disableDate.delete({
    where: { id },
  });

  return deletedDisableDate;
}

// Validate the data for creating or updating a disabled date
export function validateDisableDate(data) {
  const errors = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.date) {
    errors.date = "Date is required";
  } else if (isNaN(new Date(data.date).getTime())) {
    errors.date = "Invalid date";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}

// Example usage: Fetch all disabled dates and log them
export async function logAllDisableDates() {
  const disableDates = await getDisableDates();
  console.log(disableDates);
}


export function validatDate(data) {
  const errors = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.date) {
    errors.date = "Date is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}