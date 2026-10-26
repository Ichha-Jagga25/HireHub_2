import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoAccounts, seedApplications, seedJobs } from '../data/seedData.js';
import { hashPassword, readStorage, verifyPassword, writeStorage } from '../services/storageService.js';

const AppContext = createContext(null);
const KEYS = { accounts: 'hirehub-accounts', jobs: 'hirehub-jobs', applications: 'hirehub-applications' };
const seedLogosByCompany = new Map(seedJobs.map((job) => [job.company, job.companyLogo]));

function toPublicUser(account) {
  return { id: account.id, name: account.name, email: account.email, role: account.role };
}

function createRecordId(prefix) {
  const uuid = window.crypto?.randomUUID?.();
  return `${prefix}-${uuid || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;
}

function normalizeJobRecord(job) {
  const ownerId = job.ownerId || job.recruiterId || null;
  const companyLogo = job.companyLogo || seedLogosByCompany.get(job.company);
  const normalized = {
    ...job,
    ownerId,
    ...(!ownerId ? { ownershipState: job.ownershipState || 'legacy-unassigned' } : {}),
    ...(companyLogo && companyLogo !== job.companyLogo ? { companyLogo } : {}),
  };
  delete normalized.recruiterId;
  if (ownerId) delete normalized.ownershipState;
  return normalized;
}

function readSession() {
  try {
    const value = sessionStorage.getItem('hirehub-session') || localStorage.getItem('hirehub-session');
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Unable to restore the HireHub session.', error);
    return null;
  }
}

export function AppProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notificationReads, setNotificationReads] = useState(() => readStorage('hirehub-notification-reads', {}));
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    async function initialize() {
      const previousAccounts = readStorage(KEYS.accounts, null);
      const usedAccountIds = new Set();
      const existingAccounts = (previousAccounts || []).map((account) => {
        const id = account.id && !usedAccountIds.has(account.id) ? account.id : createRecordId('user');
        usedAccountIds.add(id);
        return id === account.id ? account : { ...account, id };
      });
      const missingDemoAccounts = demoAccounts.filter((demoAccount) => !existingAccounts.some((account) => (
        account.id === demoAccount.id || account.email.toLowerCase() === demoAccount.email.toLowerCase()
      )));
      const seededDemoAccounts = await Promise.all(missingDemoAccounts.map(async ({ password, ...account }) => {
        const credentials = await hashPassword(password);
        return { ...account, ...credentials };
      }));
      const storedAccounts = [...existingAccounts, ...seededDemoAccounts];
      const accountsWithDemoData = storedAccounts.map((account) => {
        const demoAccount = demoAccounts.find((item) => item.id === account.id);
        if (!demoAccount) return account;
        return {
          ...account,
          profile: {
            ...demoAccount.profile,
            ...(account.profile || {}),
            phone: account.profile?.phone || demoAccount.profile?.phone || '',
            github: account.profile?.github || demoAccount.profile?.github || '',
            linkedin: account.profile?.linkedin || demoAccount.profile?.linkedin || '',
            portfolio: account.profile?.portfolio || demoAccount.profile?.portfolio || '',
            resume: account.profile?.resume || demoAccount.profile?.resume || '',
            ...(demoAccount.role === 'recruiter'
              ? { companyName: account.profile?.companyName || demoAccount.profile?.companyName, companyLogo: account.profile?.companyLogo || '' }
              : {}),
          },
        };
      });
      // Ensure all demo accounts in storedAccounts have valid salt and hash
      const accountsWithCredentials = await Promise.all(accountsWithDemoData.map(async (account) => {
        const demoAccount = demoAccounts.find((d) => d.id === account.id || d.email.toLowerCase() === account.email.toLowerCase());
        if (demoAccount && (!account.salt || !account.hash)) {
          const creds = await hashPassword(demoAccount.password);
          return { ...account, ...creds };
        }
        return account;
      }));

      if (!previousAccounts || JSON.stringify(accountsWithCredentials) !== JSON.stringify(previousAccounts)) {
        writeStorage(KEYS.accounts, accountsWithCredentials);
      }
      const previousJobs = readStorage(KEYS.jobs, null);
      const storedJobs = previousJobs
        ? [
          ...previousJobs.map(normalizeJobRecord),
          ...seedJobs.filter((job) => !previousJobs.some((stored) => stored.id === job.id)).map(normalizeJobRecord),
        ]
        : seedJobs.map(normalizeJobRecord);
      const previousApplications = readStorage(KEYS.applications, null);
      const storedApplications = previousApplications
        ? [
          ...previousApplications.map((application) => {
            const seeded = seedApplications.find((item) => item.id === application.id);
            const normalized = {
              ...application,
              ...(application.userId ? {} : application.applicantId ? { userId: application.applicantId } : {}),
              ...(seeded?.interviewAt && !application.interviewAt ? { interviewAt: seeded.interviewAt } : {}),
            };
            delete normalized.applicantId;
            return normalized;
          }),
          ...seedApplications.filter((application) => !previousApplications.some((stored) => stored.id === application.id)),
        ]
        : seedApplications;
      if (!previousJobs || JSON.stringify(storedJobs) !== JSON.stringify(previousJobs)) writeStorage(KEYS.jobs, storedJobs);
      if (!previousApplications || JSON.stringify(storedApplications) !== JSON.stringify(previousApplications)) writeStorage(KEYS.applications, storedApplications);
      if (!active) return;
      setAccounts(accountsWithCredentials);
      setJobs(storedJobs);
      setApplications(storedApplications);
      const savedSession = readSession();
      const matchingAccount = savedSession && accountsWithCredentials.find((account) => account.id === savedSession.id);
      setUser(matchingAccount ? toPublicUser(matchingAccount) : null);
      setReady(true);
    }
    initialize().catch((error) => {
      console.error('HireHub could not initialize local demo data.', error);
      if (active) {
        setNotice(error.message || 'HireHub could not load local data.');
        setReady(true);
      }
    });
    return () => { active = false; };
  }, []);

  function saveAccounts(next) {
    writeStorage(KEYS.accounts, next);
    setAccounts(next);
  }

  function saveJobs(next) {
    writeStorage(KEYS.jobs, next);
    setJobs(next);
  }

  function saveApplications(next) {
    writeStorage(KEYS.applications, next);
    setApplications(next);
  }

  async function login(email, password, remember = false) {
    const normalizedEmail = email.trim().toLowerCase();
    const currentAccounts = accounts.length ? accounts : (readStorage(KEYS.accounts, null) || []);
    let account = currentAccounts.find((item) => item.email.toLowerCase() === normalizedEmail);
    const demoAccount = demoAccounts.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (!account && demoAccount) {
      const credentials = await hashPassword(demoAccount.password);
      account = { ...demoAccount, ...credentials };
      const updated = [...currentAccounts, account];
      saveAccounts(updated);
    }

    if (!account) {
      throw new Error('The email or password is incorrect.');
    }

    let isValid = false;
    if (account.salt && account.hash) {
      try {
        isValid = await verifyPassword(password, account.salt, account.hash);
      } catch {
        isValid = false;
      }
    }

    if (!isValid && demoAccount && password === demoAccount.password) {
      const credentials = await hashPassword(password);
      const updatedAccount = { ...account, ...credentials };
      const updatedAccounts = currentAccounts.map((a) => a.id === account.id ? updatedAccount : a);
      saveAccounts(updatedAccounts);
      account = updatedAccount;
      isValid = true;
    }

    if (!isValid) {
      throw new Error('The email or password is incorrect.');
    }

    const nextUser = toPublicUser(account);
    sessionStorage.removeItem('hirehub-session');
    localStorage.removeItem('hirehub-session');
    (remember ? localStorage : sessionStorage).setItem('hirehub-session', JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }

  async function register({ name, email, password, role, companyName = '', companyLogo = '' }) {
    const normalizedEmail = email.trim().toLowerCase();
    if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const credentials = await hashPassword(password);
    const account = {
      id: createRecordId('user'),
      name: name.trim(),
      email: normalizedEmail,
      role,
      ...credentials,
      profile: role === 'recruiter'
        ? { companyName: companyName.trim(), companyLogo }
        : { phone: '', college: '', degree: '', branch: '', graduationYear: '', semester: '', cgpa: '', preferredLocation: '', skills: [], projects: '', internships: '', certifications: '', resume: '', github: '', linkedin: '', portfolio: '' },
      savedJobIds: [],
    };
    saveAccounts([...accounts, account]);
    const nextUser = toPublicUser(account);
    sessionStorage.setItem('hirehub-session', JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }

  function logout() {
    sessionStorage.removeItem('hirehub-session');
    localStorage.removeItem('hirehub-session');
    setUser(null);
    setNotice('');
  }

  function updateProfile(updates) {
    if (!user) throw new Error('Sign in to update your profile.');
    if (user.role === 'recruiter') {
      const account = accounts.find((item) => item.id === user.id);
      if (!account) throw new Error('The recruiter account could not be found.');
      const companyName = updates.companyName === undefined
        ? account.profile?.companyName || ''
        : updates.companyName.trim();
      if (!companyName) throw new Error('Enter your company name.');
      const profile = { ...(account.profile || {}), companyName };
      if (Object.hasOwn(updates, 'companyLogo')) profile.companyLogo = updates.companyLogo;
      saveAccounts(accounts.map((item) => item.id === user.id ? { ...item, profile } : item));
      return;
    }
    const nextEmail = (updates.email || user.email).trim().toLowerCase();
    if (accounts.some((account) => account.id !== user.id && account.email.toLowerCase() === nextEmail)) {
      throw new Error('Another account already uses this email address.');
    }
    const nextUser = { ...user, name: (updates.name || user.name).trim(), email: nextEmail };
    const { name, email, ...profileUpdates } = updates;
    saveAccounts(accounts.map((account) => account.id === user.id
      ? { ...account, name: nextUser.name, email: nextUser.email, profile: { ...account.profile, ...profileUpdates } }
      : account));
    setUser(nextUser);
    const storage = localStorage.getItem('hirehub-session') ? localStorage : sessionStorage;
    storage.setItem('hirehub-session', JSON.stringify(nextUser));
  }

  function toggleSavedJob(jobId) {
    if (!user || user.role !== 'seeker') throw new Error('Sign in as a job seeker to save jobs.');
    if (!jobs.some((job) => job.id === jobId && job.status === 'published' && job.visibility === 'public')) {
      throw new Error('This job is not available to save.');
    }
    saveAccounts(accounts.map((account) => {
      if (account.id !== user.id) return account;
      const ids = account.savedJobIds || [];
      return { ...account, savedJobIds: ids.includes(jobId) ? ids.filter((id) => id !== jobId) : [...ids, jobId] };
    }));
  }

  function applyToJob(job) {
    if (!user || user.role !== 'seeker') throw new Error('Sign in as a job seeker to apply.');
    const currentJob = jobs.find((item) => item.id === job.id);
    if (!currentJob || currentJob.status !== 'published' || currentJob.visibility !== 'public') {
      throw new Error('This job is no longer accepting applications.');
    }
    if (applications.some((application) => application.userId === user.id && application.jobId === currentJob.id)) throw new Error('You have already applied to this job.');
    const next = [...applications, { id: createRecordId('app'), userId: user.id, jobId: currentJob.id, status: 'applied', appliedAt: new Date().toISOString().slice(0, 10), note: '' }];
    saveApplications(next);
  }

  function createJob(job) {
    if (!user || user.role !== 'recruiter') throw new Error('Only a recruiter can publish jobs.');
    const companyName = accounts.find((account) => account.id === user.id)?.profile?.companyName;
    const newJob = { ...job, company: companyName || job.company, id: createRecordId('job'), ownerId: user.id, postedAt: new Date().toISOString().slice(0, 10), status: 'published', visibility: 'public' };
    delete newJob.companyLogo;
    delete newJob.recruiterId;
    delete newJob.ownershipState;
    saveJobs([newJob, ...jobs]);
  }

  function updateJob(jobId, updates) {
    if (!user || user.role !== 'recruiter') throw new Error('Only a recruiter can edit jobs.');
    const job = jobs.find((item) => item.id === jobId);
    if (!job || job.ownerId !== user.id) throw new Error('You do not have permission to manage this job.');
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.ownerId;
    delete safeUpdates.recruiterId;
    delete safeUpdates.companyLogo;
    delete safeUpdates.ownershipState;
    saveJobs(jobs.map((item) => item.id === jobId ? { ...item, ...safeUpdates } : item));
  }

  function updateApplication(applicationId, status, note = '') {
    if (!user || user.role !== 'recruiter') throw new Error('Only a recruiter can manage applications.');
    const application = applications.find((item) => item.id === applicationId);
    const job = application && jobs.find((item) => item.id === application.jobId);
    const applicant = application && accounts.find((item) => item.id === application.userId && item.role === 'seeker');
    if (!application || !job || job.ownerId !== user.id || !applicant) {
      throw new Error('You do not have permission to manage this application.');
    }
    const allowedStatuses = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];
    if (!allowedStatuses.includes(status)) throw new Error('Choose a valid application status.');
    saveApplications(applications.map((item) => item.id === applicationId ? { ...item, status, note } : item));
  }

  function markNotificationsRead() {
    if (!user) return;
    const relevantIds = applications.filter((application) => {
      if (user.role === 'seeker') return application.userId === user.id;
      const job = jobs.find((item) => item.id === application.jobId);
      return job?.ownerId === user.id;
    }).map((application) => application.id);
    const existingIds = notificationReads[user.id] || [];
    if (relevantIds.every((id) => existingIds.includes(id))) return;
    const next = { ...notificationReads, [user.id]: [...new Set([...existingIds, ...relevantIds])] };
    writeStorage('hirehub-notification-reads', next);
    setNotificationReads(next);
  }

  const account = accounts.find((item) => item.id === user?.id);
  const publicJobs = useMemo(() => jobs.filter((job) => job.status === 'published' && job.visibility === 'public').map((job) => {
    const owner = accounts.find((item) => item.id === job.ownerId && item.role === 'recruiter');
    if (!owner?.profile?.companyName) return job;
    return { ...job, company: owner.profile.companyName, companyLogo: owner.profile.companyLogo || '' };
  }), [jobs, accounts]);
  const recruiterJobs = useMemo(() => user?.role === 'recruiter'
    ? jobs.filter((job) => job.ownerId === user.id).map((job) => {
      const owner = accounts.find((item) => item.id === user.id);
      return owner?.profile?.companyName
        ? { ...job, company: owner.profile.companyName, companyLogo: owner.profile.companyLogo || '' }
        : job;
    })
    : [], [jobs, accounts, user]);
  const recruiterJobIds = useMemo(() => new Set(recruiterJobs.map((job) => job.id)), [recruiterJobs]);
  const visibleApplications = useMemo(() => {
    if (user?.role === 'recruiter') {
      return applications.filter((application) => recruiterJobIds.has(application.jobId)
        && accounts.some((item) => item.id === application.userId && item.role === 'seeker'));
    }
    if (user?.role === 'seeker') {
      return applications
        .filter((application) => application.userId === user.id && jobs.some((job) => job.id === application.jobId))
        .map(({ note, ...application }) => application);
    }
    return [];
  }, [applications, jobs, recruiterJobIds, accounts, user]);
  const candidateAccounts = useMemo(() => {
    if (user?.role !== 'recruiter') return [];
    const applicantIds = new Set(visibleApplications.map((application) => application.userId));
    return accounts.filter((item) => item.role === 'seeker' && applicantIds.has(item.id));
  }, [accounts, user, visibleApplications]);
  const value = useMemo(() => ({
    user, profile: account?.profile || {}, savedJobIds: account?.savedJobIds || [],
    jobs: publicJobs, recruiterJobs, applications: visibleApplications, recruiterApplications: user?.role === 'recruiter' ? visibleApplications : [],
    candidateAccounts, notificationReads: notificationReads[user?.id] || [], markNotificationsRead, ready, notice, setNotice, login, register, logout,
    updateProfile, toggleSavedJob, applyToJob, createJob, updateJob, updateApplication,
  }), [user, account, publicJobs, recruiterJobs, visibleApplications, candidateAccounts, notificationReads, ready, notice]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider.');
  return context;
}
