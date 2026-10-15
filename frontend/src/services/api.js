const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorData.message || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  // Handle empty or blob responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return response;
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => request('/auth/me'),

  // Clearance
  getDepartments: () => request('/clearance/departments'),
  applyClearance: (data) =>
    request('/clearance/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyRequests: () => request('/clearance/my-requests'),
  getClearanceDetail: (id) => request(`/clearance/${id}`),
  getStaffQueue: () => request('/clearance/staff/queue'),
  makeStaffDecision: (approvalId, decisionData) =>
    request(`/clearance/staff/decision/${approvalId}`, {
      method: 'POST',
      body: JSON.stringify(decisionData),
    }),

  // Grievance
  fileGrievance: (data) =>
    request('/grievance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyGrievances: () => request('/grievance/my-grievances'),
  getGrievanceQueue: () => request('/grievance/queue'),
  resolveGrievance: (id, data) =>
    request(`/grievance/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  triggerSlaCheck: () =>
    request('/grievance/trigger-sla-check', {
      method: 'POST',
    }),

  // Admin
  getAdminAnalytics: () => request('/admin/analytics'),
  getAuditLogs: (limit = 50) => request(`/admin/audit-logs?limit=${limit}`),
  getAllRequests: () => request('/admin/all-requests'),

  // Certificate
  verifyCertificate: (certId, certHash) => {
    const params = new URLSearchParams();
    if (certId) params.append('cert_id', certId);
    if (certHash) params.append('cert_hash', certHash);
    return request(`/certificate/verify?${params.toString()}`);
  },
  getCertificateDownloadUrl: (requestId) =>
    `${API_BASE}/certificate/download/${requestId}`,
};
