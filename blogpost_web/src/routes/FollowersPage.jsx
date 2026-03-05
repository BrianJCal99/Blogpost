import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabase from '../utils/supabase';

const FollowersPage = () => {
  const { id } = useParams(); // Extract the user ID from the URL
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);

        // Fetch the followers by querying the user_relationship table
        const { data, error } = await supabase
          .from('follow')
          .select('follower_id')
          .eq('followee_id', id);

        if (error) throw error;

        // If there are followers, fetch their details (names)
        if (data && data.length > 0) {
          const followerIds = data.map((relationship) => relationship.follower_id);

          // Fetch the user details for each follower
          const { data: followerData, error: userError } = await supabase
            .from('user')
            .select('id, user_name, unique_user_name')
            .in('id', followerIds);

          if (userError) throw userError;

          setFollowers(followerData || []);
        } else {
          setFollowers([]); // No followers
        }
      } catch (err) {
        console.error(err.message);
        setError('Failed to fetch followers.');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Followers</h3>
      <div className="list-group">
        {followers.length === 0 ? (
          <div className="list-group-item">0 followers</div>
        ) : (
          followers.map((user) => (
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

export default FollowersPage;
