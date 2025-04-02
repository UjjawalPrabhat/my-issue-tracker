import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getComments, addComment } from '../../../services/comments';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const CommentSection = ({ issueId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch comments with better error handling
  const fetchComments = async () => {
    if (!issueId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching comments for issue:", issueId);
      
      const commentsData = await getComments(issueId);
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of comments
  useEffect(() => {
    fetchComments();
  }, [issueId]);

  // Handle comment submission with direct Firebase approach
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      if (!user || !user.uid) {
        throw new Error('You must be logged in to add comments');
      }
      
      // Create simple comment data
      const commentData = {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName || user.email.split('@')[0] || 'Anonymous',
        userEmail: user.email,
        issueId: issueId,
        createdAt: new Date().toISOString()
      };
      
      // Use direct Firebase approach to add document
      const commentsRef = collection(db, 'comments');
      const newCommentRef = await addDoc(commentsRef, commentData);
      
      // Create the comment object with ID for UI
      const addedComment = {
        id: newCommentRef.id,
        ...commentData
      };
      
      // Add to state and clear input
      setComments(prevComments => [...prevComments, addedComment]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Comments</h3>
          {comments.length > 0 && (
            <button
              onClick={fetchComments}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error && comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchComments}
              className="mt-2 text-blue-600 underline"
            >
              Try Again
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <ul className="space-y-4 mb-6">
            {comments.map(comment => (
              <li key={comment.id} className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-900">{comment.userName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.timestamp || comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{comment.text}</p>
              </li>
            ))}
          </ul>
        )}
        
        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label htmlFor="comment" className="sr-only">Add a comment</label>
            <textarea
              id="comment"
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
            ></textarea>
          </div>
          <div className="mt-3 flex justify-between items-center">
            {error && submitting && (
              <p className="text-red-600 text-sm">
                {error}
              </p>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${submitting || !newComment.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;
