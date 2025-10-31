import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import TicketCard from '../components/TicketCard';
import FilterBar from '../components/FilterBar';
import { Send, FolderOpen } from 'lucide-react';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    folderPath: '',
    query: '',
  });
  const [filters, setFilters] = useState({
    filter: 'all',
    sort: 'newest',
    startDate: '',
    endDate: '',
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTickets();
  }, [user, navigate, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketAPI.getMyTickets(filters);
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.folderPath || !formData.query) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await ticketAPI.create(formData);
      alert('Ticket submitted successfully!');
      setFormData({ folderPath: '', query: '' });
      fetchTickets();
    } catch (error) {
      alert('Failed to submit ticket');
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
        {/* Ticket Submission Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit New Ticket</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder Path (L: Drive)
              </label>
              <div className="relative">
                <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.folderPath}
                  onChange={(e) =>
                    setFormData({ ...formData, folderPath: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="L:\YourFolder\SubFolder"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Example: L:\Images\ProjectName
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query / Enhancement Request
              </label>
              <textarea
                value={formData.query}
                onChange={(e) =>
                  setFormData({ ...formData, query: e.target.value })
                }
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what enhancements you need for the images..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
            >
              <Send className="w-5 h-5" />
              <span>{loading ? 'Submitting...' : 'Submit Ticket'}</span>
            </button>
          </form>
        </div>

        {/* Filter Bar */}
        <FilterBar onFilterChange={handleFilterChange} />

        {/* Tickets List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Tickets</h2>
          
          {loading && tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">No tickets found</p>
              <p className="text-gray-500 text-sm mt-2">
                Submit your first ticket above to get started
              </p>
            </div>
          ) : (
            <div>
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  isAdmin={false}
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

export default Dashboard;