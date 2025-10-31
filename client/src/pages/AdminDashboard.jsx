import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import TicketCard from '../components/TicketCard';
import FilterBar from '../components/FilterBar';
import { BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    solved: 0,
    error: 0,
  });
  const [filters, setFilters] = useState({
    filter: 'all',
    sort: 'newest',
    startDate: '',
    endDate: '',
  });

  const { admin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    fetchTickets();
  }, [admin, navigate, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketAPI.getAllTickets(filters);
      const ticketsData = response.data.tickets;
      setTickets(ticketsData);

      // Calculate stats
      const stats = {
        total: ticketsData.length,
        pending: ticketsData.filter((t) => t.status === 'pending').length,
        solved: ticketsData.filter((t) => t.status === 'solved').length,
        error: ticketsData.filter((t) => t.status === 'error').length,
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.solved}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.error}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar onFilterChange={handleFilterChange} />

        {/* Tickets List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Tickets</h2>

          {loading && tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">No tickets found</p>
              <p className="text-gray-500 text-sm mt-2">
                Tickets will appear here when users submit them
              </p>
            </div>
          ) : (
            <div>
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  isAdmin={true}
                  onUpdate={fetchTickets}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;