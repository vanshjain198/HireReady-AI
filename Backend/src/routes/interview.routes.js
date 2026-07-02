const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)


/**
 * @route POST /api/interview/mock/:interviewReportId/evaluate
 * @description evaluate a user's mock interview answer for a saved interview report question.
 * @access private
 */
interviewRouter.post("/mock/:interviewReportId/evaluate", authMiddleware.authUser, interviewController.evaluateMockAnswerController)

/**
 * @route POST /api/interview/mock/:interviewReportId/complete
 * @description evaluate all 6-8 answers and return the final interview verdict.
 * @access private
 */
interviewRouter.post("/mock/:interviewReportId/complete", authMiddleware.authUser, interviewController.completeMockInterviewController)


module.exports = interviewRouter
