const materialController = require('../coordinator/materialController');

// Mentor material APIs are read-only views that reuse coordinator logic
// but are exposed under /mentor/* routes.

// Section / subject utilities
const getSectionSubjects = (req, res) => materialController.getSectionSubjects(req, res);

// Topic hierarchy
const getTopicHierarchy = (req, res) => materialController.getTopicHierarchy(req, res);
const getActivitiesForSubject = (req, res) => materialController.getActivitiesForSubject(req, res);
const getSubActivitiesForActivity = (req, res) => materialController.getSubActivitiesForActivity(req, res);

// Materials
const getTopicMaterials = (req, res) => materialController.getTopicMaterials(req, res);

// Batch overview
const getBatches = (req, res) => materialController.getBatches(req, res);
const getBatchAnalytics = (req, res) => materialController.getBatchAnalytics(req, res);

module.exports = {
	getSectionSubjects,
	getTopicHierarchy,
	getActivitiesForSubject,
	getSubActivitiesForActivity,
	getTopicMaterials,
	getBatches,
	getBatchAnalytics,
};

