import {
  getAllInterviewReports,
  generateInterviewReport,
  getInterviewReportById,
  generateResumePdf,
  evaluateMockInterviewAnswer,
  completeMockInterview
} from "../services/interview.api"
import { useCallback, useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context-value"
import { useParams } from "react-router"

export const useInterview = () => {
  const context = useContext(InterviewContext)
  const { interviewId } = useParams()

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider")
  }

  const { loading, setLoading, report, setReport, reports, setReports } = context

  const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    setLoading(true)
    try {
      const response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile
      })
      setReport(response.interviewReport)
      return response.interviewReport
    } catch (error) {
      console.error("generateReport error:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getReportById = useCallback(async (interviewId) => {
    setLoading(true)
    try {
      const response = await getInterviewReportById(interviewId)
      setReport(response.interviewReport)
      return response.interviewReport
    } catch (error) {
      console.error("getReportById error:", error)
      return null
    } finally {
      setLoading(false)
    }
  }, [setLoading, setReport])

  const getReports = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getAllInterviewReports()
      setReports(response.interviewReports)
      return response.interviewReports
    } catch (error) {
      console.error("getReports error:", error)
      return null
    } finally {
      setLoading(false)
    }
  }, [setLoading, setReports])

  const getResumePdf = async (interviewReportId) => {
    setLoading(true)
    try {
      const response = await generateResumePdf({ interviewReportId })
      const url = window.URL.createObjectURL(
        new Blob([response], { type: "application/pdf" })
      )
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `resume_${interviewReportId}.pdf`)
      document.body.appendChild(link)
      link.click()
      //clean up DOM element after clicking
      link.remove()
      //release blob URL from memory
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("getResumePdf error:", error)
    } finally {
      setLoading(false)
    }
  }

  const submitMockAnswer = async ({ interviewReportId, questionType, questionIndex, answer }) => {
    try {
      const response = await evaluateMockInterviewAnswer({
        interviewReportId,
        questionType,
        questionIndex,
        answer
      })
      return response.feedback
    } catch (error) {
      console.error("submitMockAnswer error:", error)
      return null
    }
  }

  const submitMockInterview = async ({ interviewReportId, answers }) => {
    try {
      const response = await completeMockInterview({
        interviewReportId,
        answers
      })
      return response.evaluation
    } catch (error) {
      console.error("submitMockInterview error:", error)
      return null
    }
  }

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId)
    } else {
      getReports()
    }
  }, [getReportById, getReports, interviewId])

  return {
    loading,
    report,
    reports,
    generateReport,
    getReportById,
    getReports,
    getResumePdf,
    submitMockAnswer,
    submitMockInterview
  }
}
