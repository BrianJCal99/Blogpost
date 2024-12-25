import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "./utils/supabase";

const FollowSection = ({ targetUserID, currentUserID }) => {
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        // Check if the current user is following the target user
        const { data: relationshipData, error: relationshipError } = await supabase
          .from("follow")
          .select("id")
          .eq("follower_id", currentUserID)
          .eq("followee_id", targetUserID)
          .maybeSingle();

        if (relationshipError) {
          console.error('Supabase error fetching follow data:', relationshipError);
          throw relationshipError;
        }

        setFollowing(Boolean(relationshipData));
      } catch (error) {
        console.error("Error fetching follow status:", error.message);
      }
    };

    const fetchFollowCounts = async () => {
      try {
        // Get the number of followers for the target user
        const { data: followersData, error: followersError } = await supabase
          .from("follow")
          .select("id")
          .eq("followee_id", targetUserID);

        if (followersError) {
          console.error('Supabase error fetching followers count:', followersError);
          throw followersError;
        }

        setFollowersCount(followersData.length);

        // Get the number of users the target user is following
        const { data: followingData, error: followingError } = await supabase
          .from("follow")
          .select("id")
          .eq("follower_id", targetUserID);

        if (followingError) {
          console.error('Supabase error fetching following count:', followingError);
          throw followingError;
        }

        setFollowingCount(followingData.length);
      } catch (error) {
        console.error("Error fetching follow counts:", error.message);
      }
    };

    checkFollowStatus();
    fetchFollowCounts();
  }, [targetUserID, currentUserID]);

  const handleFollowToggle = async () => {
    try {
      if (following) {
        // Unfollow user by deleting the relationship
        const { error } = await supabase
          .from("follow")
          .delete()
          .eq("follower_id", currentUserID)
          .eq("followee_id", targetUserID);

        if (error) throw error;
        setFollowing(false);
        setFollowersCount(followersCount - 1); // Update follower count
      } else {
        // Follow user by inserting a new relationship
        const { error } = await supabase
          .from("follow")
          .insert([{ follower_id: currentUserID, followee_id: targetUserID }]);

        if (error) throw error;
        setFollowing(true);
        setFollowersCount(followersCount + 1); // Update follower count
      }
    } catch (error) {
      console.error("Error toggling follow status:", error.message);
    }
  };

  return (
    <div className="card-body bg-white">
      <div className="card-text m-3">
        <Link to={`/user/${targetUserID}/followers`} className="btn btn-sm mr-3">
          Followers <strong>{followersCount}</strong>
        </Link>
        <Link to={`/user/${targetUserID}/following`} className="btn btn-sm ml-3">
          Following <strong>{followingCount}</strong>
        </Link>
      </div>
      <div className="card-text m-3">
        {targetUserID !== currentUserID && (
          <button className="btn btn-sm btn-outline-primary" onClick={handleFollowToggle}>
            {following ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
};

export default FollowSection;
