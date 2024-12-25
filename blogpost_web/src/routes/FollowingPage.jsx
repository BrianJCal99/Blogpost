import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabase from '../utils/supabase';

const FollowingPage = () => {
  const { id } = useParams(); // Extract the user ID from the URL
  const [following, setFollowing] = useState([]); // State to store following users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);

        // Fetch the users the target user is following by querying the user_relationship table
        const { data, error } = await supabase
          .from('follow')
          .select('followee_id')
          .eq('follower_id', id);

        if (error) throw error;

        // If there are following users, fetch their details (names)
        if (data && data.length > 0) {
          const followingIds = data.map((relationship) => relationship.followee_id);

          // Fetch the user details for each followed user
          const { data: followingData, error: userError } = await supabase
            .from('user')
            .select('id, user_name, unique_user_name')
            .in('id', followingIds);

          if (userError) throw userError;

          setFollowing(followingData || []);
        } else {
          setFollowing([]); // No following users
        }
      } catch (err) {
        console.error(err.message);
        setError('Failed to fetch following users.');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Following</h3>
      <div className="list-group">
        {following.length === 0 ? (
          <div className="list-group-item">0 following</div>
        ) : (
          following.map((user) => (
            <Link 
              key={user.id}
              to={`/user/${user.id}`} 
              className="list-group-item list-group-item-action text-primary">
              <strong>{user.user_name}</strong>
              <span className="text-muted"> @{user.unique_user_name}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowingPage;
