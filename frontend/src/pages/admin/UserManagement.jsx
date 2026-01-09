import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getUsers({ page, limit: 20, search });
      setUsers(response.data.data.users || []);
      setTotal(response.data.data.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUser(userId, { is_active: !currentStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Loi khi cap nhat user!');
    }
  };

  const handleDelete = async (userId, username) => {
    if (!confirm(`Ban co chac muon xoa user "${username}"?`)) return;

    try {
      await adminAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Loi khi xoa user!');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>👥 Quan ly nguoi dung</h1>

      {/* Search */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Tim kiem username, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <button className="btn btn-secondary" onClick={fetchUsers}>
          🔍 Tim
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div className="loading">Dang tai...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Ten hien thi</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Trang thai</th>
                <th style={thStyle}>Ngay tao</th>
                <th style={thStyle}>Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={tdStyle}>{user.username}</td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>{user.display_name}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: user.role === 'admin' ? '#8b5cf6' : '#3b82f6',
                      color: 'white',
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: user.is_active ? '#22c55e' : '#ef4444',
                      color: 'white',
                    }}>
                      {user.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn btn-icon"
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        title={user.is_active ? 'Block user' : 'Unblock user'}
                      >
                        {user.is_active ? '🚫' : '✅'}
                      </button>
                      <button
                        className="btn btn-icon"
                        onClick={() => handleDelete(user.id, user.username)}
                        title="Xoa user"
                        style={{ color: 'var(--error-color)' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {users.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Khong tim thay nguoi dung nao
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)' }}>
          Tong: {total} nguoi dung
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Truoc
          </button>
          <span style={{ padding: '10px' }}>Trang {page}</span>
          <button
            className="btn btn-secondary"
            onClick={() => setPage((p) => p + 1)}
            disabled={users.length < 20}
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
};

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  color: 'var(--text-secondary)',
  fontWeight: '600',
};

const tdStyle = {
  padding: '12px',
};

export default UserManagement;
