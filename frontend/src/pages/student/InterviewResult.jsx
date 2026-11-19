import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { interviewsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { CheckCircle, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

export default function InterviewResult() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    interviewsAPI.getResult(id)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner center />
  if (!data) return <div className="text-center text-gray-500 py-12">Result not found.</div>

  const radarData = [
    { subject: 'Technical', A: data.technical_score || 0 },
    { subject: 'Communication', A: data.communication_score || 0 },
    { subject: 'Problem Solving', A: data.problem_solving_score || 0 },
    { subject: 'Relevance', A: data.answer_relevance_score || 0 },
    { subject: 'Confidence', A: data.confidence_score || 0 },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/student/interview" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Interview Result</h1>
          <p className="text-sm text-gray-500">{data.target_role} • {data.interview_type}</p>
        </div>
      </div>

      {/* Overall score */}
      <div className="card bg-gradient-to-r from-blue-600 to-violet-700 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-extrabold">{data.overall_score?.toFixed(0)}</span>
          </div>
          <div>
            <p className="text-xl font-bold">Overall Score: {data.overall_score?.toFixed(1)}/100</p>
            <p className="text-blue-200 text-sm mt-1">{data.evaluation_summary}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Performance Breakdown</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Score" dataKey="A" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Score Details</h2>
          <div className="space-y-3">
            {[
              { label: 'Technical Knowledge', value: data.technical_score, color: 'bg-blue-500' },
              { label: 'Communication', value: data.communication_score, color: 'bg-purple-500' },
              { label: 'Problem Solving', value: data.problem_solving_score, color: 'bg-orange-500' },
              { label: 'Answer Relevance', value: data.answer_relevance_score, color: 'bg-green-500' },
              { label: 'Confidence', value: data.confidence_score, color: 'bg-teal-500' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{label}</span>
                  <span className="font-semibold">{value?.toFixed(0) || 0}/100</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${color} h-2 rounded-full`} style={{ width: `${value || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.strengths?.length > 0 && (
          <div className="card border-green-100">
            <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2"><CheckCircle size={16} /> Strengths</h3>
            <ul className="space-y-2">
              {data.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <TrendingUp size={14} className="text-green-500 mt-0.5 flex-shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.improvements?.length > 0 && (
          <div className="card border-orange-100">
            <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2"><AlertCircle size={16} /> Areas to Improve</h3>
            <ul className="space-y-2">
              {data.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <AlertCircle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Q&A */}
      {data.questions?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Question & Answer Review</h2>
          <div className="space-y-4">
            {data.questions.map((q, i) => (
              <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{q.question_type?.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-400">Q{i + 1}</span>
                </div>
                <p className="font-medium text-gray-900 text-sm mb-2">{q.question_text}</p>
                {q.answer_transcript && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Your Answer:</p>
                    <p className="text-sm text-gray-700">{q.answer_transcript}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Link to="/student/interview" className="btn-secondary inline-flex items-center gap-2">
        <ArrowLeft size={15} /> Take Another Interview
      </Link>
    </div>
  )
}
