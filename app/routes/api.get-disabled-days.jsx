import { json } from '@remix-run/node';
import db from '../db.server'; // Assuming you have a db setup

export const loader = async () => {
  const disabledDays = await db.disableDay.findMany({
    select: {
      day_id: true,
    }
  })
  return json(disabledDays.map(row => row.day_id));
};

