// controllers/groupAnalyticsController.js
export const getGroupAnalytics = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const timeRange = req.query.timeRange || "7days";

    const analytics = {
      memberGrowth: await calculateMemberGrowth(groupId, timeRange),
      postEngagement: await calculatePostEngagement(groupId, timeRange),
      activeMembers: await getActiveMembers(groupId, timeRange),
      popularContent: await getPopularContent(groupId, timeRange),
      eventParticipation: await getEventParticipation(groupId),
    };

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
