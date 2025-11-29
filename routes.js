import express from 'express';
import sql from 'mssql';
import 'dotenv/config';

const router = express.Router();
const dbConnectionString = process.env.DB_CONNECTION_STRING;


// GET: /api/events
router.get('/', async (req, res) => {
	try {
		await sql.connect(dbConnectionString);
		const result = await sql.query`SELECT 
				dbo.AstronomicalEvent.AstronomicalEventID,
				dbo.AstronomicalEvent.Title,
				dbo.AstronomicalEvent.Description,
				dbo.AstronomicalEvent.StartDateTime,
				dbo.AstronomicalEvent.Filename,
				dbo.AstronomicalEvent.CategoryID,
				dbo.Category.Title AS Category
			FROM dbo.AstronomicalEvent
			INNER JOIN dbo.Category ON dbo.AstronomicalEvent.CategoryID = dbo.Category.CategoryID
			ORDER BY dbo.AstronomicalEvent.StartDateTime DESC`;
		
		// Extract filename from path
		result.recordset.forEach(event => {
			if (event.Filename) {
				event.Filename = event.Filename.split('/').pop();
			}
		});

		console.dir(result);
		res.json(result.recordset);
	} catch (err) {
		res.status(500).send('Database query failed');
	}
});

// GET: /api/tickets
router.get('/tickets', async (req, res) => {
	try {
		await sql.connect(dbConnectionString);
		const result = await sql.query`SELECT * FROM dbo.Ticket`;
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
		
		// Execute two queries: one for the event, one for its tickets
		const result = await sql.query`
			SELECT * FROM dbo.AstronomicalEvent WHERE AstronomicalEventID = ${eventId};
			SELECT * FROM dbo.Ticket WHERE AstronomicalEventID = ${eventId};
		`;

		// result.recordsets[0] contains the results of the first query (Event)
		if (result.recordsets[0].length === 0) {
			return res.status(404).send('Event not found');
		}

		const event = result.recordsets[0][0];
		
		// Extract filename from path
		if (event.Filename) {
			event.Filename = event.Filename.split('/').pop();
		}

		// result.recordsets[1] contains the results of the second query (Tickets)
		event.Tickets = result.recordsets[1];

		res.json(event);
	} catch (err) {
		res.status(500).send('Database query failed');
	}
});

// POST: /api/events
router.post('/', async (req, res) => {
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