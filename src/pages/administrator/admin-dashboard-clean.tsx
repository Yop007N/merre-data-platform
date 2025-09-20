import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAdmin
} from '../../presentation/hooks';
import {
  useAdminUseCases
} from '../../presentation/providers';
import {
  UserDetail,
  UserStatistics,
  QueryFilters
} from '../../domain';

interface AdminDashboardProps {
  className?: string;
}

const AdminDashboardClean: React.FC<AdminDashboardProps> = ({ className }) => {
  // Clean Architecture dependencies
  const adminUseCases = useAdminUseCases();

  // Hooks
  const {
    admin,
    users,
    userStatistics,
    systemOverview,
    loading,
    error,
    isAuthenticated,
    getAllUsers,
    getSystemOverview,
    searchUsers,
    deleteUserData,
    updateUserStatus,
    clearError
  } = useAdmin(adminUseCases);

  // Local state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [filters, setFilters] = useState<QueryFilters>({
    page: 1,
    pageSize: 10,
    sortBy: 'registrationDate',
    sortOrder: 'desc'
  });

  const navigate = useNavigate();

  // Initialize dashboard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login-admin');
      return;
    }

    // Load initial data
    const initializeDashboard = async () => {
      try {
        await Promise.all([
          getSystemOverview(),
          getAllUsers(filters)
        ]);
      } catch (error) {
        console.error('Error initializing admin dashboard:', error);
      }
    };

    initializeDashboard();
  }, [isAuthenticated, navigate, getSystemOverview, getAllUsers]);

  // Search handlers
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchUsers(query, filters);
    } else {
      await getAllUsers(filters);
    }
  };

  const handleClearSearch = async () => {
    setSearchQuery('');
    await getAllUsers(filters);
  };

  // User management handlers
  const handleUserDetails = (userId: string) => {
    navigate(`/detalle/${userId}`);
  };

  const handleToggleUserStatus = async (user: UserDetail) => {
    try {
      const result = await updateUserStatus(user.userId, !user.profile.profileCompleted);
      if (result.success) {
        // Refresh users list
        if (searchQuery.trim()) {
          await searchUsers(searchQuery, filters);
        } else {
          await getAllUsers(filters);
        }
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const result = await deleteUserData(selectedUser.userId);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        // Refresh data
        await getSystemOverview();
        if (searchQuery.trim()) {
          await searchUsers(searchQuery, filters);
        } else {
          await getAllUsers(filters);
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const openDeleteModal = (user: UserDetail) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedUser(null);
    setShowDeleteModal(false);
  };

  // Statistics calculations
  const getCompletionRate = (): number => {
    if (!userStatistics) return 0;
    return userStatistics.totalUsers > 0
      ? (userStatistics.completedAssessments / userStatistics.totalUsers) * 100
      : 0;
  };

  // Loading state
  if (loading && !admin) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button
          className="btn btn-outline-danger btn-sm ms-2"
          onClick={() => {
            clearError();
            window.location.reload();
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard ${className || ''}`}>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h3 mb-0">Panel de Administración</h1>
            <p className="text-muted">Bienvenido, {admin?.email}</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {userStatistics && (
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <h5 className="card-title text-primary">Total Usuarios</h5>
                  <h2 className="display-4">{userStatistics.totalUsers}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-success">
                <div className="card-body text-center">
                  <h5 className="card-title text-success">Usuarios Activos</h5>
                  <h2 className="display-4">{userStatistics.activeUsers}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-info">
                <div className="card-body text-center">
                  <h5 className="card-title text-info">Evaluaciones Completadas</h5>
                  <h2 className="display-4">{userStatistics.completedAssessments}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-warning">
                <div className="card-body text-center">
                  <h5 className="card-title text-warning">Tasa de Completitud</h5>
                  <h2 className="display-4">{getCompletionRate().toFixed(1)}%</h2>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar usuarios por email o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              />
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => handleSearch(searchQuery)}
                disabled={loading}
              >
                <i className="fas fa-search"></i> Buscar
              </button>
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleClearSearch}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Lista de Usuarios
                  {searchQuery && (
                    <small className="text-muted ms-2">
                      (Resultados para: "{searchQuery}")
                    </small>
                  )}
                </h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-3">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : users.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Email</th>
                          <th>Nombre</th>
                          <th>Universidad</th>
                          <th>Fecha de Registro</th>
                          <th>Evaluaciones</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.userId}>
                            <td>{user.email}</td>
                            <td>
                              {user.profile?.firstName && user.profile?.lastName
                                ? `${user.profile.firstName} ${user.profile.lastName}`
                                : 'N/A'}
                            </td>
                            <td>{user.profile?.university || 'N/A'}</td>
                            <td>
                              {new Date(user.registrationDate).toLocaleDateString()}
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {user.assessments?.length || 0}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  user.profile?.profileCompleted ? 'bg-success' : 'bg-warning'
                                }`}
                              >
                                {user.profile?.profileCompleted ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleUserDetails(user.userId)}
                                  title="Ver detalles"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => handleToggleUserStatus(user)}
                                  title={
                                    user.profile?.profileCompleted
                                      ? 'Desactivar usuario'
                                      : 'Activar usuario'
                                  }
                                >
                                  <i
                                    className={`fas ${
                                      user.profile?.profileCompleted
                                        ? 'fa-user-slash'
                                        : 'fa-user-check'
                                    }`}
                                  ></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => openDeleteModal(user)}
                                  title="Eliminar usuario"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                    <p className="text-muted">
                      {searchQuery
                        ? 'No se encontraron usuarios que coincidan con la búsqueda'
                        : 'No hay usuarios registrados'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeleteModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  ¿Estás seguro de que quieres eliminar al usuario{' '}
                  <strong>{selectedUser.email}</strong>?
                </p>
                <p className="text-danger">
                  <small>
                    <i className="fas fa-exclamation-triangle"></i> Esta acción no se puede deshacer.
                    Se eliminarán todos los datos asociados al usuario.
                  </small>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDeleteModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteUser}
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Eliminar Usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardClean;