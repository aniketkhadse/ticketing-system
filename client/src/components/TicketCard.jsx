import { useState } from 'react';
import { format } from 'date-fns';
import { Copy, FolderOpen, MessageSquare, ExternalLink } from 'lucide-react';
import { ticketAPI } from '../utils/api';

const TicketCard = ({ ticket, isAdmin, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [status, setStatus] = useState(ticket.status);
  const [adminComment, setAdminComment] = useState(ticket.adminComment || '');
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'solved':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'solved':
        return '✅ Solved';
      case 'error':
        return '❌ Error';
      default:
        return '⏳ Pending';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const openFolder = (path) => {
    // For Windows file paths, convert to file:// URL
    const filePath = path.replace(/\\/g, '/');
    window.open(`file:///${filePath}`, '_blank');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      await ticketAPI.addComment(ticket.ticketId, newComment);
      setNewComment('');
      onUpdate();
      alert('Comment added successfully!');
    } catch (error) {
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await ticketAPI.updateStatus(ticket.ticketId, { status, adminComment });
      onUpdate();
      alert('Ticket updated successfully!');
    } catch (error) {
      alert('Failed to update ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{ticket.ticketId}</h3>
          <p className="text-sm text-gray-600">
            By: {ticket.userName} ({ticket.userEmail})
          </p>
          <p className="text-xs text-gray-500">
            {format(new Date(ticket.createdAt), 'MMM dd, yyyy • hh:mm a')}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
          {getStatusText(ticket.status)}
        </span>
      </div>

      {/* Folder Path */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <FolderOpen className="w-5 h-5 text-gray-600" />
            <p className="text-sm text-gray-800 font-mono break-all">{ticket.folderPath}</p>
          </div>
          <div className="flex space-x-2 ml-2">
            <button
              onClick={() => copyToClipboard(ticket.folderPath)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Copy path"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => openFolder(ticket.folderPath)}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              title="Open folder"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Query */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Query:</h4>
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.query}</p>
      </div>

      {/* Admin Comment */}
      {ticket.adminComment && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">Admin Comment:</h4>
          <p className="text-sm text-blue-900">{ticket.adminComment}</p>
        </div>
      )}

      {/* Admin Controls */}
      {isAdmin && (
        <div className="border-t pt-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="solved">Solved</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Comment
              </label>
              <input
                type="text"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a comment..."
              />
            </div>
          </div>
          <button
            onClick={handleUpdateStatus}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Updating...' : 'Update Ticket'}
          </button>
        </div>
      )}

      {/* Comments Section */}
      <div className="border-t pt-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-3"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">
            {showComments ? 'Hide' : 'Show'} Comments ({ticket.comments?.length || 0})
          </span>
        </button>

        {showComments && (
          <div>
            {/* Existing Comments */}
            {ticket.comments && ticket.comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {ticket.comments.map((comment, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      comment.authorType === 'admin' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-semibold text-gray-800">
                        {comment.author}
                        {comment.authorType === 'admin' && (
                          <span className="ml-2 text-blue-600">(Admin)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM dd, hh:mm a')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;