import React, { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [topic, setTopic] = useState('');
  const [videos, setVideos] = useState([]);
  const [instagramStatus, setInstagramStatus] = useState('Not connected');
  const [googleDriveStatus, setGoogleDriveStatus] = useState('Not connected');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  const fetchVideos = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/fetch-video`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    setGoogleDriveStatus('Connected');
    setInstagramStatus('Connected');
    fetchVideos();
  }, []);

  const handleGenerateVideo = async () => {
    if (!topic.trim()) {
      setMessage('Please enter a topic or idea.');
      return;
    }

    setIsLoading(true);
    setMessage('Generating script...');

    try {
      const res = await fetch('http://localhost:8000/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      const script = data.script;
      const fileName = data.file_name;

      setMessage('Script generated. Generating video now...');

      const newVideo = {
        id: `vid${Date.now()}`,
        title: topic,
        date: new Date().toISOString().slice(0, 10),
        driveLink: '#',
        instagramLink: '#',
        script: script,
        file_name: fileName,
      };

      setVideos((prev) => [newVideo, ...prev]);
      setTopic('');
      setMessage('Video generated!');
    } catch (error) {
      console.error(error);
      setMessage('Error generating script.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostToInstagram = (videoId) => {
    setMessage(`Posting video ${videoId} to Instagram...`);
    setTimeout(() => {
      setMessage(`Video ${videoId} posted successfully to Instagram!`);
    }, 2000);
  };

  const handlePlayVideo = (fileName) => {
    setCurrentVideoUrl(`http://localhost:8000/videos/${fileName}`);
    setShowVideoModal(true);
  };

  const VideoModal = ({ videoUrl, onClose }) => {
    if (!videoUrl) return null;
    const videoFileName = decodeURIComponent(videoUrl.split('/').pop());

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="relative bg-black rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white hover:text-red-400 text-3xl font-bold z-10"
          >
            &times;
          </button>
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-white text-lg font-semibold truncate">{videoFileName}</h2>
          </div>
          <div className="bg-black">
            <video
              controls
              autoPlay
              src={videoUrl}
              className="w-full h-[400px] sm:h-[500px] object-contain bg-black"
              onEnded={onClose}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">VideoGenAI</h1>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white text-lg">A</div>
          <div>
            <p className="text-sm font-semibold">Ankit Mishra</p>
            <p className="text-xs text-gray-300">ankit.mishra10021997@gmail.com</p>
          </div>
        </div>
        <nav className="flex-grow">
          <ul>
            <li className="mb-4"><a href="#" className="flex items-center text-lg hover:text-blue-400">Dashboard</a></li>
            <li className="mb-4"><a href="#" className="flex items-center text-lg hover:text-blue-400">Videos</a></li>
            <li className="mb-4"><a href="#" className="flex items-center text-lg hover:text-blue-400">Social Accounts</a></li>
            <li className="mb-4"><a href="#" className="flex items-center text-lg hover:text-blue-400">Settings</a></li>
          </ul>
        </nav>
        <button className="mt-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl">Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Your Dashboard!</h2>
        <p className="text-gray-600 mb-8">Generate, manage, and post your short videos with ease.</p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatusCard title="Google Drive Status" value={googleDriveStatus} isConnected={googleDriveStatus === 'Connected'} />
          <StatusCard title="Instagram Status" value={instagramStatus} isConnected={instagramStatus === 'Connected'} />
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-500 text-sm">Videos Generated (Total)</p>
            <p className="text-xl font-semibold text-gray-800">{videos.length}</p>
          </div>
        </div>

        {/* Generate New Video */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Generate New Video</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter a topic or idea (e.g., '5 tips for better sleep')"
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={handleGenerateVideo}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Video'}
            </button>
          </div>
          {message && (
            <p className={`mt-4 text-sm px-4 py-2 rounded-md ${
              isLoading ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {message}
            </p>
          )}
        </div>

        {/* Video Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Video Library</h3>
          {videos.length === 0 ? (
            <p className="text-gray-500">No videos generated yet. Start by generating one above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{video.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{video.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <a href={video.driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-4">View in Drive</a>
                        <button
                          onClick={() => handlePostToInstagram(video.id)}
                          className="text-green-600 hover:underline disabled:opacity-50"
                          disabled={isLoading}
                        >
                          Post to Instagram
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {video.file_name ? (
                          <button
                            onClick={() => handlePlayVideo(video.file_name)}
                            className="text-purple-600 hover:underline flex items-center gap-1"
                          >
                            ▶ Play Video
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">Not Available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <VideoModal videoUrl={currentVideoUrl} onClose={() => setShowVideoModal(false)} />
      )}
    </div>
  );
}

// ✅ Reusable Status Card
function StatusCard({ title, value, isConnected }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
      <svg
        className={`w-8 h-8 ${isConnected ? 'text-green-500' : 'text-red-500'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={
            isConnected
              ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
          }
        />
      </svg>
    </div>
  );
}
