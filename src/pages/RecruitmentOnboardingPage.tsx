import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { useAuth } from "../contexts/AuthContext";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// UI Components
const Button = ({ onClick, children, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md ${disabled ? 'bg-gray-300 cursor-not-allowed' : ''} text-white ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon, trend, color }) => (
  <Card className="flex items-center space-x-4 p-4">
    <div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
      {trend && <div className="text-xs text-green-500">{trend}</div>}
    </div>
    <div className={`p-2 rounded-full ${color}`}>
      {icon}
    </div>
  </Card>
);

const Table = ({ children }) => (
  <table className="min-w-full divide-y divide-gray-200">
    {children}
  </table>
);

const TableHead = ({ children }) => (
  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const TableRow = ({ children }) => (
  <tr className="hover:bg-gray-50">
    {children}
  </tr>
);

const TableCell = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
    {children}
  </td>
);

const Badge = ({ children, color }) => (
  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
    {children}
  </span>
);

const LoadingBar = () => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div className="bg-blue-600 h-2.5 rounded-full w-3/4 animate-pulse"></div>
  </div>
);

export function RecruitmentOnboardingPage() {
  const [candidates, setCandidates] = useState([]);
  const [excelLoaded, setExcelLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [atsDataAvailable, setAtsDataAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const parsedCandidates = json.map((row: any, idx: number) => ({
        id: idx + 1,
        name: row['Name'] || 'Unknown',
        email: row['EMAIL ID'] || 'unknown@example.com',
        role: row['Role Applied'] || 'Unspecified',
        status: 'Applied',
        atsScore: null,
        experience: row['Years of Experience'] ? `${row['Years of Experience']} years` : 'N/A',
        resumeUrl: row['RESUME LINK'] || '',
        matchedKeywords: [],
      }));
      setCandidates(parsedCandidates);
      setExcelLoaded(true);
      setAtsDataAvailable(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAtsScan = async () => {
    setIsScanning(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/run-ats', {
        candidates: candidates.map(candidate => ({
          id: candidate.id,
          resumeUrl: candidate.resumeUrl,
          role: candidate.role,
        })),
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const updatedCandidates = candidates.map(candidate => {
        const result = response.data.results.find((r: any) => r.id === candidate.id);
        let status = 'Applied';
        if (result?.score >= 80) {
          status = 'Shortlisted';
        } else if (result?.score >= 40) {
          status = 'Review';
        } else {
          status = 'Rejected';
        }
        return {
          ...candidate,
          atsScore: result?.score || 0,
          matchedKeywords: result?.matchedKeywords || [],
          status: status,
        };
      });
      setCandidates(updatedCandidates);
      setAtsDataAvailable(true);
    } catch (error) {
      console.error('Error running ATS scan:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateToDatabase = async () => {
    if (!user?.employeeId) {
      alert("User not authenticated or employeeId missing!");
      return;
    }

    // Validate candidates before sending
    const invalidCandidates = candidates.filter(
      (candidate) => !candidate.name || !candidate.email || !candidate.role
    );

    if (invalidCandidates.length > 0) {
      alert(`Some candidates are missing required fields (name, email, or role). Please fix the data.`);
      console.error("Invalid candidates:", invalidCandidates);
      return;
    }

    setIsUpdating(true);
    try {
      for (const candidate of candidates) {
        const payload = {
          employeeId: user.employeeId,
          name: candidate.name,
          email: candidate.email,
          role: candidate.role,
          status: candidate.status,
          atsScore: candidate.atsScore,
          matchedKeywords: candidate.matchedKeywords,
          resumeUrl: candidate.resumeUrl,
          experience: candidate.experience,
        };
        await axios.post('http://localhost:5000/workDay/candidates', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      alert("Candidates updated to database successfully!");
    } catch (error) {
      console.error('Error updating candidates:', error.response?.data || error.message);
      alert(`Failed to update candidates. ${error.response?.data?.error || 'Please check the console for details.'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setCandidates(prevCandidates =>
      prevCandidates.map(candidate =>
        candidate.id === id ? { ...candidate, status: newStatus } : candidate
      )
    );
  };

  const deleteCandidate = (id: number) => {
    setCandidates(prevCandidates => prevCandidates.filter(candidate => candidate.id !== id));
  };

  // Calculate stats
  const totalApplications = candidates.length;
  const shortlisted = atsDataAvailable ? candidates.filter(candidate => candidate.status === 'Shortlisted').length : 0;
  const inReview = atsDataAvailable ? candidates.filter(candidate => candidate.status === 'Review').length : 0;
  const rejected = atsDataAvailable ? candidates.filter(candidate => candidate.status === 'Rejected').length : 0;

  // ATS Score Distribution
  const atsScoreChartData = atsDataAvailable ? {
    labels: ['0-39', '40-79', '80-100'],
    datasets: [
      {
        label: 'Number of Candidates',
        data: [
          candidates.filter(candidate => candidate.atsScore < 40).length,
          candidates.filter(candidate => candidate.atsScore >= 40 && candidate.atsScore < 80).length,
          candidates.filter(candidate => candidate.atsScore >= 80).length,
        ],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
        borderWidth: 0,
      },
    ],
  } : {
    labels: ['0-39', '40-79', '80-100'],
    datasets: [
      {
        label: 'Number of Candidates',
        data: [0, 0, 0],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-green-100 text-green-800';
      case 'Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Recruitment Onboarding</h1>
      {!excelLoaded ? (
        <Card className="mb-8">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mb-4 bg-green-600 hover:bg-green-700"
            >
              Upload Candidate Excel
            </Button>
            <p className="text-sm text-gray-500">Supported formats: .xlsx, .xls, .csv (Max size: 10MB)</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex justify-end mb-4 space-x-2">
            <Button
              onClick={handleAtsScan}
              disabled={isScanning}
              className="bg-green-600 hover:bg-green-700"
            >
              {isScanning ? 'Scanning...' : 'Run ATS Scan'}
            </Button>
            {atsDataAvailable && (
              <Button
                onClick={handleUpdateToDatabase}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? 'Updating...' : 'Update to Database'}
              </Button>
            )}
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Applications"
              value={totalApplications}
              trend="+12% this month"
              icon={<span>👥</span>}
              color="bg-blue-100"
            />
            <StatCard
              title="Shortlisted"
              value={shortlisted}
              icon={<span>✅</span>}
              color="bg-green-100"
            />
            <StatCard
              title="In Review"
              value={inReview}
              icon={<span>⏳</span>}
              color="bg-yellow-100"
            />
            <StatCard
              title="Rejected"
              value={rejected}
              icon={<span>❌</span>}
              color="bg-red-100"
            />
          </div>
          {/* ATS Score Distribution */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-4">ATS Score Distribution</h2>
            {atsDataAvailable ? (
              <div className="relative h-64">
                <Bar
                  data={atsScoreChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Run ATS Scan to see score distribution</p>
              </div>
            )}
          </Card>
          {/* Candidate Table */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Candidate Tracking ({candidates.length})</h2>
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead>ATS Score</TableHead>
                    <TableHead>Matched Keywords</TableHead>
                    <TableHead>Actions</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate: any) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-gray-500">{candidate.email}</div>
                        <div className="text-xs text-gray-400">{candidate.experience}</div>
                      </TableCell>
                      <TableCell>{candidate.role}</TableCell>
                      <TableCell>
                        <Badge color={getStatusColor(candidate.status)}>
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {candidate.resumeUrl ? (
                          <a
                            href={candidate.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Resume
                          </a>
                        ) : (
                          <span className="text-gray-400">No Resume</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isScanning ? (
                          <LoadingBar />
                        ) : atsDataAvailable ? (
                          <>
                            <div className="w-24 bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${candidate.atsScore}%` }}
                              ></div>
                            </div>
                            <div className="text-center mt-1">{candidate.atsScore}%</div>
                          </>
                        ) : (
                          <div className="text-gray-500 text-center">Not Scanned</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isScanning ? (
                          <LoadingBar />
                        ) : atsDataAvailable ? (
                          <div className="flex flex-wrap gap-1">
                            {candidate.matchedKeywords.length > 0 ? (
                              candidate.matchedKeywords.map((kw: string, idx: number) => (
                                <Badge key={idx} color="bg-blue-100 text-blue-800">{kw}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-500">No keywords matched</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500">Not Scanned</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {candidate.status !== 'Rejected' && (
                            <Button
                              onClick={() => handleStatusChange(candidate.id, 'Rejected')}
                              className="bg-red-500 hover:bg-red-600 text-sm px-3 py-1"
                            >
                              Reject
                            </Button>
                          )}
                          {candidate.status === 'Applied' && atsDataAvailable && (
                            <Button
                              onClick={() => handleStatusChange(candidate.id, 'Review')}
                              className="bg-yellow-500 hover:bg-yellow-600 text-sm px-3 py-1"
                            >
                              Review
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteCandidate(candidate.id)}
                            className="bg-gray-500 hover:bg-gray-600 text-sm px-3 py-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
