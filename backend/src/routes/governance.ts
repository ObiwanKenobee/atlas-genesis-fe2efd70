import express from 'express';
import { query } from '../db';
import { emailService } from '../services/email';

const router = express.Router();

router.post('/proposals', async (req, res) => {
  const { title, body, choices, startAt, endAt } = req.body;
  try {
    const result = await query('INSERT INTO proposals (title, body, choices, start_at, end_at) VALUES ($1,$2,$3,$4,$5) RETURNING *', [title, body, choices || [], startAt || null, endAt || null]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

router.get('/proposals', async (req, res) => {
  try {
    const result = await query('SELECT * FROM proposals ORDER BY start_at DESC');
    res.json({ items: result.rows });
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

router.post('/proposals/:id/vote', async (req, res) => {
  const id = req.params.id;
  const { voterId, choice, weight } = req.body;
  try {
    const result = await query('INSERT INTO votes (proposal_id, voter_id, choice, weight) VALUES ($1,$2,$3,$4) RETURNING *', [id, voterId || null, choice, weight || 1]);

    // Send vote confirmation email
    if (voterId) {
      try {
        const voterResult = await query('SELECT email, display_name FROM users WHERE id = $1', [voterId]);
        const proposalResult = await query('SELECT title FROM proposals WHERE id = $1', [id]);

        if (voterResult.rowCount > 0 && proposalResult.rowCount > 0) {
          const voter = voterResult.rows[0];
          const proposal = proposalResult.rows[0];

          await emailService.sendGovernanceVoteConfirmation(
            voter.email,
            voter.display_name || voter.email,
            {
              proposalTitle: proposal.title,
              choice: choice,
              weight: weight || 1
            }
          );
        }
      } catch (emailError) {
        console.error('Failed to send vote confirmation email:', emailError);
      }
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ code: 'server_error', message: err.message });
  }
});

export default router;
