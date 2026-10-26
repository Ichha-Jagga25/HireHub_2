export function matchScore(job, profile = {}) {
  const skills = (profile.skills || []).map((skill) => skill.toLowerCase().trim()).filter(Boolean);
  if (!skills.length || !job.skills?.length) return null;
  const matches = job.skills.filter((skill) => skills.includes(skill.toLowerCase())).length;
  return Math.round((matches / job.skills.length) * 100);
}

export function getEligibility(job, profile = {}) {
  if (!job) return { eligible: false, reason: 'This job is no longer available.' };
  if (job.status !== 'published' || job.visibility !== 'public') return { eligible: false, reason: 'This job is not currently accepting applications.' };
  if (job.deadline && new Date(`${job.deadline}T23:59:59`) < new Date()) return { eligible: false, reason: 'The application deadline has passed.' };
  if (job.branches?.length && !job.branches.includes('Any branch') && profile.branch && !job.branches.includes(profile.branch)) {
    return { eligible: false, reason: `This role is currently open to ${job.branches.join(', ')}.` };
  }
  if (job.minYear && profile.graduationYear && Number(profile.graduationYear) < Number(job.minYear)) {
    return { eligible: false, reason: `Graduation year ${job.minYear} or later is preferred.` };
  }
  return { eligible: true, reason: 'You can apply based on the profile information available.' };
}

export function profileCompletion(profile = {}, name = '') {
  const fields = [name, profile.college, profile.degree, profile.branch, profile.graduationYear, profile.preferredLocation, (profile.skills || []).length ? 'skills' : '', profile.projects];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export function formatDate(value) {
  if (!value) return 'Not specified';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
