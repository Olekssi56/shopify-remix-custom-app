import { json } from '@remix-run/node';
import db from '../db.server'; // Assuming you have a db setup

export const action = async ({ request }) => {
  const formData = await request.formData();
  const disabledDays = formData.getAll('disabledDays'); // Array of selected disabled days
  
  // Clear existing disabled days
  await db.disableDay.deleteMany({});

  // Save new disabled days
  for (const day_id of disabledDays) {
    await db.disableDay.create({
      data: {
        day_id
      },
    });
  };

  return json({ success: true });
};
