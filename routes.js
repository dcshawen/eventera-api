import express from 'express';
import sql from 'mssql';
import 'dotenv/config';

const router = express.Router();
const dbConnectionString = process.env.DB_CONNECTION_STRING;

// Must be defined before other routes to avoid conflicts.
// GET: /api/tickets
router.get('/tickets', async (req, res) => {
	try {
		await sql.connect(dbConnectionString);
		const result = await sql.query`SELECT * FROM dbo.Ticket`;
		console.dir(result);
		res.json(result.recordset);
	} catch (err) {
		res.status(500).send('Database query failed');
	}
});

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
router.post('/', async (req, res) => {
    console.log('Body received:', req.body);

    const { 
        PurchaserName: purchaserName, 
        AstronomicalEventId: eventId,
        CreditNumber: creditNumber,
        ExpDate: expDate,
        CreditKey: creditKey,
        PurchaserEmail: purchaserEmail,
        PurchaserPhone: purchaserPhone,
        PurchaserStreetNo: purchaserStreetNo,
        PurchaserStreetName: purchaserStreetName,
        PurchaserCity: purchaserCity,
        PurchaserProvince: purchaserProvince,
        PurchaserPostalCode: purchaserPostalCode,
        PurchaserCountry: purchaserCountry
    } = req.body;

		console.log('Parsed PurchaserName:', purchaserName);
		console.log('Parsed AstronomicalEventId:', eventId);

    if (!purchaserName || !eventId) {
        return res.status(400).json({ 
            message: "Missing required fields. Please provide 'PurchaserName' and 'AstronomicalEventId' in the request body." 
        });
    }
		
    const ticket = {
        PurchaserName: purchaserName,
        PurchaseDateTime: new Date().toISOString(),
        AstronomicalEventId: parseInt(eventId),
        CreditNumber: creditNumber,
        ExpDate: expDate,
        CreditKey: creditKey,
        PurchaserEmail: purchaserEmail,
        PurchaserPhone: purchaserPhone,
        PurchaserStreetNo: purchaserStreetNo,
        PurchaserStreetName: purchaserStreetName,
        PurchaserCity: purchaserCity,
        PurchaserProvince: purchaserProvince,
        PurchaserPostalCode: purchaserPostalCode,
        PurchaserCountry: purchaserCountry
    };

	try {
		await sql.connect(dbConnectionString);
		const result = await sql.query`INSERT INTO dbo.Ticket (
            PurchaserName, PurchaseDateTime, AstronomicalEventID,
            CreditNumber, ExpDate, CreditKey,
            PurchaserEmail, PurchaserPhone,
            PurchaserStreetNo, PurchaserStreetName, PurchaserCity, PurchaserProvince, PurchaserPostalCode, PurchaserCountry
        )
			VALUES (
                ${purchaserName}, GETDATE(), ${eventId},
                ${creditNumber}, ${expDate}, ${creditKey},
                ${purchaserEmail}, ${purchaserPhone},
                ${purchaserStreetNo}, ${purchaserStreetName}, ${purchaserCity}, ${purchaserProvince}, ${purchaserPostalCode}, ${purchaserCountry}
            );
			SELECT SCOPE_IDENTITY() AS TicketId;`;
		
		const ticketId = result.recordset[0].TicketId;

		// Return the created ticket
		res.status(201).json(ticket);

	} catch (err) {
		return res.status(500).send('Database insert failed');
	}
});

export default router;