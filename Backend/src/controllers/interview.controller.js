const pdfParseModule = require("pdf-parse")
const pdfParse = pdfParseModule.default || pdfParseModule
const {
  generateInterviewReport,
  generateResumePdf,
  evaluateMockInterviewAnswer,
  evaluateMockInterview
} = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function generateInterViewReportController(req, res) {
  try {
    const { selfDescription, jobDescription } = req.body

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required." })
    }

    // Resume and self description are optional, but at least one is required.
    if (!req.file && !selfDescription) {
      return res.status(400).json({
        message: "Please provide either a resume PDF or a self description."
      })
    }

    // Only parse PDF content when a file was uploaded.
    let resumeText = ""
    if (req.file) {
      const resumeContent = await pdfParse(req.file.buffer)
      resumeText = resumeContent.text
    }

    const interViewReportByAi = await generateInterviewReport({
      resume: resumeText,
      selfDescription: selfDescription || "",
      jobDescription
    })

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeText,
      selfDescription: selfDescription || "",
      jobDescription,
      ...interViewReportByAi
    })

    res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport
    })
  } catch (err) {
    console.error("generateInterViewReportController error:", err)
    res.status(500).json({ message: "Failed to generate interview report." })
  }
}

async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id
    })

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." })
    }

    res.status(200).json({
      message: "Interview report fetched successfully.",
      interviewReport
    })
  } catch (err) {
    console.error("getInterviewReportByIdController error:", err)
    res.status(500).json({ message: "Failed to fetch interview report." })
  }
}

async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
      message: "Interview reports fetched successfully.",
      interviewReports
    })
  } catch (err) {
    console.error("getAllInterviewReportsController error:", err)
    res.status(500).json({ message: "Failed to fetch interview reports." })
  }
}

async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id
    })

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." })
    }

    const { resume, jobDescription, selfDescription } = interviewReport
    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
  } catch (err) {
    console.error("generateResumePdfController error:", err)
    res.status(500).json({ message: "Failed to generate resume PDF." })
  }
}

async function evaluateMockAnswerController(req, res) {
  try {
    const { interviewReportId } = req.params
    const { questionType, questionIndex, answer } = req.body

    if (![ "technical", "behavioral" ].includes(questionType)) {
      return res.status(400).json({ message: "Question type must be technical or behavioral." })
    }

    if (!Number.isInteger(questionIndex) || questionIndex < 0) {
      return res.status(400).json({ message: "A valid question index is required." })
    }

    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: "Answer is required." })
    }

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id
    })

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." })
    }

    const questionList = questionType === "technical"
      ? interviewReport.technicalQuestions
      : interviewReport.behavioralQuestions
    const selectedQuestion = questionList[ questionIndex ]

    if (!selectedQuestion) {
      return res.status(404).json({ message: "Interview question not found." })
    }

    const feedback = await evaluateMockInterviewAnswer({
      jobDescription: interviewReport.jobDescription,
      resume: interviewReport.resume,
      selfDescription: interviewReport.selfDescription,
      questionType,
      question: selectedQuestion.question,
      intention: selectedQuestion.intention,
      modelAnswer: selectedQuestion.answer,
      userAnswer: answer.trim()
    })

    res.status(200).json({
      message: "Mock interview answer evaluated successfully.",
      feedback
    })
  } catch (err) {
    console.error("evaluateMockAnswerController error:", err)
    res.status(500).json({ message: "Failed to evaluate mock interview answer." })
  }
}

async function completeMockInterviewController(req, res) {
  try {
    const { interviewReportId } = req.params
    const { answers } = req.body

    if (!Array.isArray(answers) || answers.length < 6 || answers.length > 8) {
      return res.status(400).json({
        message: "A completed mock interview must contain between 6 and 8 answers."
      })
    }

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id
    })

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." })
    }

    const seenQuestions = new Set()
    const responses = []

    for (const item of answers) {
      if (![ "technical", "behavioral" ].includes(item.questionType)) {
        return res.status(400).json({ message: "Every answer must have a valid question type." })
      }

      if (!Number.isInteger(item.questionIndex) || item.questionIndex < 0) {
        return res.status(400).json({ message: "Every answer must have a valid question index." })
      }

      if (typeof item.answer !== "string" || !item.answer.trim()) {
        return res.status(400).json({ message: "Every interview question must be answered." })
      }

      const questionKey = `${item.questionType}-${item.questionIndex}`
      if (seenQuestions.has(questionKey)) {
        return res.status(400).json({ message: "The same interview question cannot be submitted twice." })
      }
      seenQuestions.add(questionKey)

      const questionList = item.questionType === "technical"
        ? interviewReport.technicalQuestions
        : interviewReport.behavioralQuestions
      const question = questionList[item.questionIndex]

      if (!question) {
        return res.status(400).json({ message: "One or more interview questions were not found." })
      }

      responses.push({
        questionType: item.questionType,
        question: question.question,
        intention: question.intention,
        modelAnswer: question.answer,
        userAnswer: item.answer.trim()
      })
    }

    const evaluation = await evaluateMockInterview({
      jobDescription: interviewReport.jobDescription,
      resume: interviewReport.resume,
      selfDescription: interviewReport.selfDescription,
      responses
    })

    res.status(200).json({
      message: "Mock interview completed successfully.",
      evaluation
    })
  } catch (err) {
    console.error("completeMockInterviewController error:", err)
    res.status(500).json({ message: "Failed to complete mock interview." })
  }
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
  evaluateMockAnswerController,
  completeMockInterviewController
}
