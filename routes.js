import express from 'express';
import sql from 'mssql';
import 'dotenv/config';

const router = express.Router();
const dbConnectionString = process.env.DB_CONNECTION_STRING;

/* // Must be defined before other routes to avoid conflicts.
// GET: /api/tickets
router.get('/tickets', async (req, res) => {
	// This route is a placeholder for future implementation
	return res.status(501).send('Not implemented yet');
}); */

// GET: /api/events
router.get('/', async (req, res) => {
	try {
		await sql.connect(dbConnectionString);
		const result = await sql.query`SELECT * FROM dbo.AstronomicalEvent
			INNER JOIN dbo.Category ON dbo.AstronomicalEvent.CategoryID = dbo.Category.CategoryID
			ORDER BY dbo.AstronomicalEvent.StartDateTime DESC`;
		console.dir(result);
		res.json(result.recordset);
	} catch (err) {
		res.status(500).send('Database query failed');
	}
});

// GET: /api/events/:id
router.get('/:id', async (req, res) => {
	const eventId = req.params.id;

	if (isNaN(eventId)) {
		return res.status(400).send('Invalid event ID');
	}

	try {
		await sql.connect(dbConnectionString);
		const result = await sql.query`SELECT * FROM dbo.AstronomicalEvent 
			LEFT JOIN dbo.Ticket ON dbo.AstronomicalEvent.AstronomicalEventID = dbo.Ticket.AstronomicalEventID
			WHERE dbo.AstronomicalEvent.AstronomicalEventID = ${eventId}`;
		console.dir(result);
		if (result.recordset.length === 0) {
			return res.status(404).send('Event not found');
		}

		const event = { ...result.recordset[0] };
		event.Tickets = [];

		result.recordset.forEach(row => {
			if (row.PurchaserName) {
				event.Tickets.push({
					TicketID: row.TicketID,
					PurchaserName: row.PurchaserName,
					PurchaseDateTime: row.PurchaseDateTime,
					AstronomicalEventID: row.AstronomicalEventID
				});
			}
		});

		delete event.TicketID;
		delete event.PurchaserName;
		delete event.PurchaseDateTime;

		res.json(event);
	} catch (err) {
		res.status(500).send('Database query failed');
	}
});

// POST: /api/events
// Expects headers: PurchaserName, AstronomicalEventId
router.post('/', async (req, res) => {
    console.log('Headers received:', req.headers);

    const purchaserName = req.get('PurchaserName');
    const eventId = req.get('AstronomicalEventId');

    if (!purchaserName || !eventId) {
        return res.status(400).json({ 
            message: "Missing required headers. Please provide 'PurchaserName' and 'AstronomicalEventId'." 
        });
    }
		
    const ticket = {
        PurchaserName: purchaserName,
        PurchaseDateTime: new Date().toISOString(),
        AstronomicalEventId: parseInt(eventId),
    };

		try {
			await sql.connect(dbConnectionString);
			const result = await sql.query`INSERT INTO dbo.Ticket (PurchaserName, PurchaseDateTime, AstronomicalEventID)
				VALUES (${purchaserName}, GETDATE(), ${eventId});
				SELECT SCOPE_IDENTITY() AS TicketId;`;
			const ticketId = result.recordset[0].TicketId;
		} catch (err) {
			return res.status(500).send('Database insert failed');
		}
		

    // Return the created ticket
    res.status(201).json(ticket);
});

export default router;