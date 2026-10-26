import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import { LoginPage, RegisterPage } from '../pages/AuthPages.jsx';
import { CreateJob, EditJob, ManageApplications, ManageJobs, RecruiterApplications, RecruiterDashboard, RecruiterNotifications, RecruiterSettings } from '../pages/RecruiterPages.jsx';
import { MyApplications, SavedJobs, SeekerDashboard, SeekerNotifications, SeekerProfile, SeekerSettings, UpSkill } from '../pages/SeekerPages.jsx';
import { HomePage, JobDetailsPage, JobsPage, NotFoundPage, UpSkillLandingPage } from '../pages/PublicPages.jsx';
import { ProtectedRoute, PublicRoute } from './RouteGuards.jsx';

function Guarded({ role, children }) {
  return <ProtectedRoute role={role}>{children}</ProtectedRoute>;
}

export default function AppRoutes() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="jobs" element={<JobsPage />} />
      <Route path="jobs/:jobId" element={<JobDetailsPage />} />
      <Route path="up-skill" element={<UpSkillLandingPage />} />
      <Route path="unauthorized" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="job-seeker" element={<Guarded role="seeker"><DashboardLayout role="seeker" /></Guarded>}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<SeekerDashboard />} />
      <Route path="jobs" element={<JobsPage />} />
      <Route path="saved-jobs" element={<SavedJobs />} />
      <Route path="applications" element={<MyApplications />} />
      <Route path="profile" element={<SeekerProfile />} />
      <Route path="up-skill" element={<UpSkill />} />
      <Route path="notifications" element={<SeekerNotifications />} />
      <Route path="settings" element={<SeekerSettings />} />
    </Route>
    <Route path="recruiter" element={<Guarded role="recruiter"><DashboardLayout role="recruiter" /></Guarded>}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<RecruiterDashboard />} />
      <Route path="jobs" element={<ManageJobs />} />
      <Route path="jobs/create" element={<CreateJob />} />
      <Route path="jobs/:jobId/edit" element={<EditJob />} />
      <Route path="jobs/:jobId/applications" element={<ManageApplications />} />
      <Route path="applications" element={<RecruiterApplications />} />
      <Route path="notifications" element={<RecruiterNotifications />} />
      <Route path="profile" element={<RecruiterSettings />} />
      <Route path="settings" element={<RecruiterSettings />} />
    </Route>
  </Routes>;
}
