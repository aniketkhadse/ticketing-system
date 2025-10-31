import { useState } from 'react';
import { Filter, Calendar } from 'lucide-react';

const FilterBar = ({ onFilterChange }) => {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFilters(newFilter, sort, dateRange);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    applyFilters(filter, newSort, dateRange);
  };

  const handleDateRangeChange = (start, end) => {
    const newDateRange = { start, end };
    setDateRange(newDateRange);
    applyFilters(filter, sort, newDateRange);
  };

  const clearDateRange = () => {
    setDateRange({ start: '', end: '' });
    applyFilters(filter, sort, { start: '', end: '' });
    setShowDatePicker(false);
  };

  const applyFilters = (currentFilter, currentSort, currentDateRange) => {
    onFilterChange({
      filter: currentFilter,
      sort: currentSort,
      startDate: currentDateRange.start,
      endDate: currentDateRange.end,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Tickets</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-gray-700">
              {dateRange.start && dateRange.end
                ? `${dateRange.start} to ${dateRange.end}`
                : 'Select dates'}
            </span>
            <Calendar className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Date Picker */}
      {showDatePicker && (
        <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  handleDateRangeChange(e.target.value, dateRange.end)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  handleDateRangeChange(dateRange.start, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={clearDateRange}
            className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Date Range
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;