import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;
const dbPath = path.join(__dirname, 'db.json');

app.use(bodyParser.json());

// Endpoint to check if the server is running
app.get('/ping', (req: Request, res: Response) => {
    res.send(true);
});

// Endpoint to submit form data
app.post('/submit', (req: Request, res: Response) => {
    const { name, email, phone, github_link, stopwatch_time } = req.body;

    if (!name || !email || !phone || !github_link || !stopwatch_time) {
        return res.status(400).send('Missing required fields');
    }

    const newSubmission = {
        name,
        email,
        phone,
        github_link,
        stopwatch_time
    };

    let submissions = [];

    // Read existing submissions from db.json
    if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        submissions = JSON.parse(data);
    }

    // Add the new submission to the list
    submissions.push(newSubmission);

    // Save the updated list back to db.json
    fs.writeFileSync(dbPath, JSON.stringify(submissions, null, 2), 'utf8');

    res.status(201).send('Submission saved successfully');
});

// Endpoint to read a specific submission by index
app.get('/read', (req: Request, res: Response) => {
    const index = parseInt(req.query.index as string);

    if (isNaN(index)) {
        return res.status(400).send('Invalid index');
    }

    if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        const submissions = JSON.parse(data);

        if (index >= 0 && index < submissions.length) {
            return res.status(200).json(submissions[index]);
        } else {
            return res.status(404).send('Submission not found');
        }
    } else {
        return res.status(404).send('No submissions found');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
