import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "./utils/supabase";

const UserList = ({limit}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('user')
          .select('id, first_name, last_name, unique_user_name, email'); // Fetch users data

        if (error) throw error;
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="container mt-5 text-center">Loading users...</div>;
  }

  if (!users || users.length === 0) {
    return <div className="text-center">No users available...</div>;
  }

  // If a limit is passed, slice the userList
  const displayedUsers = limit ? users.slice(0, limit) : users;

  return (
    <ul className="list-group">
      {displayedUsers.map((user) => (
        <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <h5>{user.first_name} {user.last_name}</h5>
            <h6 className="small text-muted">@{user.unique_user_name}</h6>
          </div>
          <Link to={`/user/${user.id}`} className="btn btn-outline-primary">
            View Profile
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default UserList;
