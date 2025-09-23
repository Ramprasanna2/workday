import { Candidate } from '../model/model';
import axios from 'axios'; // For calling your Flask ATS endpoint

// Create a new candidate
export const createCandidate = async (candidateData: any) => {
  const candidate = new Candidate(candidateData);
  await candidate.save();
  return candidate;
};

// Get all candidates
export const getAllCandidates = async () => {
  return await Candidate.find();
};

// Update candidate status
export const updateCandidateStatus = async (id: string, status: string) => {
  return await Candidate.findByIdAndUpdate(id, { status }, { new: true });
};

// Run ATS scan for candidates
export const runATSScanForCandidates = async (candidateIds?: string[]) => {
  let candidates;
  if (candidateIds && candidateIds.length > 0) {
    candidates = await Candidate.find({ _id: { $in: candidateIds } });
  } else {
    candidates = await Candidate.find();
  }

  // Call your Flask ATS endpoint
  const response = await axios.post('http://127.0.0.1:5000/run-ats', {
    candidates: candidates.map(c => ({
      id: c._id.toString(),
      resumeUrl: c.resumeUrl,
      role: c.role,
    })),
  });

  // Update candidates with ATS results
  const results = response.data.results;
  for (const result of results) {
    const { id, score, matchedKeywords } = result;
    let status = 'Applied';
    if (score >= 80) status = 'Shortlisted';
    else if (score >= 40) status = 'Review';
    else status = 'Rejected';

    await Candidate.findByIdAndUpdate(id, {
      atsScore: score,
      matchedKeywords,
      status,
    });
  }

  return results;
};
