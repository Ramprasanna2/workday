import express from 'express';
import { Candidate } from '../model/model'; // Assuming your Candidate model is exported here
import {
  createCandidate,
  getAllCandidates,
  updateCandidateStatus,
  runATSScanForCandidates
} from '../service/RecruitmentOnboardingPage'; // You'll need to create this service

const router = express.Router();

// Create a new candidate
router.post('/', async (req, res) => {
  try {
    const candidate = await createCandidate(req.body);
    res.status(201).json(candidate);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await getAllCandidates();
    res.json(candidates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update candidate status (e.g., Shortlisted, Review, Rejected)
router.post('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedCandidate = await updateCandidateStatus(req.params.id, status);
    res.json(updatedCandidate);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Run ATS scan for all candidates (or a subset)
router.post('/ats-scan', async (req, res) => {
  try {
    const { candidateIds } = req.body; // Optional: pass specific candidate IDs to scan
    const results = await runATSScanForCandidates(candidateIds);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get candidates by status (e.g., Shortlisted, Review, Rejected)
router.get('/status/:status', async (req, res) => {
  try {
    const candidates = await Candidate.find({ status: req.params.status });
    res.json(candidates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get candidate by IDW
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
