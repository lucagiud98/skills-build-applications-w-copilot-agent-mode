import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Activity payload is required'), { status: 400 });
  }

  const payload = input as Record<string, unknown>;
  const userId = typeof payload.userId === 'string' ? payload.userId : '';
  const teamId = typeof payload.teamId === 'string' ? payload.teamId : '';
  const type = typeof payload.type === 'string' ? payload.type.trim() : '';
  const minutes = Number(payload.minutes);

  if (!userId || !teamId || !type || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('Valid userId, teamId, type, and minutes are required'), { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(teamId)) {
    throw Object.assign(new Error('userId and teamId must be valid ObjectIds'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userId),
    Team.findById(teamId),
  ]);

  if (!user || !team) {
    throw Object.assign(new Error('Referenced user and team must exist'), { status: 400 });
  }

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Team payload is required'), { status: 400 });
  }

  const payload = input as Record<string, unknown>;
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const mascot = typeof payload.mascot === 'string' ? payload.mascot.trim() : '';
  const membersValue = payload.members;

  if (!name || !mascot) {
    throw Object.assign(new Error('Team name and mascot are required'), { status: 400 });
  }

  const members = Array.isArray(membersValue) ? membersValue : [];
  const normalizedMembers: string[] = [];

  for (const member of members) {
    if (typeof member !== 'string' || !mongoose.Types.ObjectId.isValid(member)) {
      throw Object.assign(new Error('Team members must be valid ObjectIds'), { status: 400 });
    }
    normalizedMembers.push(member);
  }

  const existingUsers = await User.find({ _id: { $in: normalizedMembers } }).select('_id');
  if (existingUsers.length !== normalizedMembers.length) {
    throw Object.assign(new Error('All team members must reference existing users'), { status: 400 });
  }

  const team = await Team.create({
    name,
    mascot,
    members: normalizedMembers,
  });

  if (normalizedMembers.length > 0) {
    await User.updateMany({ _id: { $in: normalizedMembers } }, { $set: { team: team._id } });
  }

  return team.toObject();
}

export async function getLeaderboard() {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return leaderboard.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = typeof userEmail === 'string' ? userEmail.trim() : '';
  if (!normalizedEmail) {
    throw Object.assign(new Error('User email is required'), { status: 400 });
  }

  const user = await User.findOne({ email: normalizedEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const focusOrder = [user.fitnessGoal, recentActivity?.type].filter(Boolean) as string[];
  const preferredFocus = focusOrder.find((focus) => typeof focus === 'string' && focus.trim().length > 0);

  const workouts = await Workout.find().lean();
  const sorted = [...workouts].sort((left, right) => {
    const leftMatch = left.focus === preferredFocus ? 1 : 0;
    const rightMatch = right.focus === preferredFocus ? 1 : 0;
    return rightMatch - leftMatch;
  });

  if (sorted.length === 0) {
    return [];
  }

  const top = sorted[0];
  const reason = preferredFocus
    ? `Your ${preferredFocus} goal and recent activity pattern make this a strong match.`
    : 'This workout matches your recent activity pattern.';

  return [{ ...top, reason }];
}

export { User };
