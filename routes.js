import express from 'express';
import sql from 'mssql';
import 'dotenv/config';

const router = express.Router();
const dbConnectionString = process.env.DB_CONNECTION_STRING;

// Must be defined before other routes to avoid conflicts.
// GET: /api/tickets
router.get('/tickets', async (req, res) => {
	// This route is a placeholder for future implementation
	return res.status(501).send('Not implemented yet');
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
		const result = await sql.query`SELECT * FROM dbo.AstronomicalEvent WHERE AstronomicalEventID = ${eventId}`;
		console.dir(result);
		if (result.recordset.length === 0) {
			return res.status(404).send('Event not found');
		}
		res.json(result.recordset[0]);
	} catch (err) {
		res.status(500).send('Database query failed');
	}
});

// POST: /api/events
router.post('/', async (req, res) => {
    const ticket = req.body;

    // To-Do: validate proper JSON structure

    //
    // TO-DO: Add validation for photo object
    //

    await sql.connect(dbConnectionString);

    const result = await sql.query`

		`;

    res.json({ message: 'Comment added successfully.'});
});

export default router;