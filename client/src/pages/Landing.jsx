import { useNavigate } from 'react-router-dom';
import { Ticket, ArrowRight, CheckCircle, Clock, Users } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Ticket className="w-20 h-20 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Image Enhancement Ticketing System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your image enhancement requests with our easy-to-use ticketing system.
            Submit requests, track progress, and collaborate seamlessly.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Easy Submission
            </h3>
            <p className="text-gray-600">
              Simply provide the folder path from your L: drive and submit your enhancement request
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Real-time Tracking
            </h3>
            <p className="text-gray-600">
              Monitor your ticket status in real-time with instant email notifications
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Collaboration
            </h3>
            <p className="text-gray-600">
              Communicate with admins through comments and get updates on your requests
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Sign Up</h4>
              <p className="text-sm text-gray-600">
                Register with your @aristasystems.in email
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Submit Ticket</h4>
              <p className="text-sm text-gray-600">
                Provide folder path and enhancement details
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Track Progress</h4>
              <p className="text-sm text-gray-600">
                Monitor your ticket status in your dashboard
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Get Results</h4>
              <p className="text-sm text-gray-600">
                Receive notifications when work is completed
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Get Started Now
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg"
            >
              <span>User Login</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate('/admin-login')}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-lg font-semibold shadow-lg"
            >
              <span>Admin Login</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-6 text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;