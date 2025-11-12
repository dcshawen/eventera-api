import express from 'express';
import sql from 'mssql';
import 'dotenv/config';

const router = express.Router();
const dbConnectionString = process.env.DB_CONNECTION_STRING;

// GET: /api/events
router.get('/', async (req, res) => {
	try {
		await sql.connect(dbConnectionString);
		const result = await sql.query`SELECT * FROM dbo.AstronomicalEvent`;
		console.dir(result);
		res.json(result.recordset);
	} catch (err) {
		res.status(500).send('Database query failed');
	}
});

export default router;