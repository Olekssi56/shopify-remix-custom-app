// routes/api/shipdates.js
import { json } from '@remix-run/node';
import { getDisableDates } from "../models/Date.server";

export async function loader() {
  const shipDates = await getDisableDates();
  return json(shipDates.map(row => row.date));
}