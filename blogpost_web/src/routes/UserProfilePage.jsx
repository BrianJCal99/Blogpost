import React, { useContext, useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { SessionContext } from '../context/userSession.context';
import supabase from '../utils/supabase';
import Card from '../Card';
import FollowSection from '../FollowSection';

function CardComponent({ id, title, abstract, user, created_at, created_by, image_url, tags, likes }) {
    const date = new Date(created_at).toISOString().split('T')[0];

    return (
        <Card
            post_id={id}
            title={title}
            abstract={abstract}
            post_user={user?.unique_user_name}
            post_user_id={created_by}
            date={date}
            image_url={image_url}
        />
    );
}

const UserProfilePage = () => {
    const session = useContext(SessionContext);
    const [postsList, setPostsList] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state
    const [currentUser, setCurrentUser] = useState(); // Current user data

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch current user data
                const { data: userData, error: userError } = await supabase
                    .from('user')
                    .select('*')
                    .eq('id', session?.user?.id)
                    .single();

                if (userError) throw userError;
                setCurrentUser(userData);

                // Fetch posts for the current user with tags and likes
                const { data: postData, error: postError } = await supabase
                    .from('post')
                    .select(`
                        id, 
                        created_by, 
                        created_at, 
                        title, 
                        abstract, 
                        text, 
                        image_url, 
                        user:created_by (
                            first_name,
                            last_name,
                            user_name,
                            unique_user_name,
                            email
                        )`)
                    .eq('created_by', session?.user?.id);

                if (postError) throw postError;
                setPostsList(postData);
            } catch (error) {
                console.error('Error fetching data:', error.message);
                setPostsList(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session?.user?.id]);

    if (loading) {
        return <div className="container mt-5 text-center">Loading user posts...</div>;
    }

    if (!postsList) {
        return <div className="container mt-5 text-center">You haven't posted anything yet...</div>;
    }

    return (
        <div className='container'>
            {session ? (
                <div className="card text-center">
                    <div className="card-header bg-white">
                        {session?.user?.user_metadata?.userName}
                    </div>
                    <div className="card-body bg-white">
                        <h5 className="card-title">@{session?.user?.user_metadata?.uniqueUserName}</h5>
                        <h6 className="card-subtitle">{session?.user?.user_metadata?.firstName + " " + session?.user?.user_metadata?.lastName || "User Name"}</h6>
                        <h6 className="card-subtitle">{session?.user.email || "User Email"}</h6>
                    </div>
                    <FollowSection targetUserID={session?.user?.id} currentUserID={session?.user?.id} />
                    <div className="card-footer bg-white small text-muted">
                        Joined on {new Date(session?.user?.created_at).toISOString().split('T')[0]}
                    </div>
                </div>
            ) : (
                <div className="container text-center my-3">
                    <div className="alert alert-primary m-3" role="alert">
                        Please{" "}
                        <Link to="/signin" className="btn btn-primary m-3">
                            Sign in
                        </Link>
                        to continue.
                    </div>
                </div>
            )}
            <div className="row my-4">
                {postsList.length === 0 ? (
                    <div className="text-center w-100">
                        <h4>Hmmm... Looks like you haven't posted anything yet.</h4>
                        <h5>Start blogging now.</h5>
                        <Link to="/newpost" className="btn btn-primary m-3">New Post</Link>
                    </div>
                ) : (
                    <div className="row">
                        {postsList.map((article) => (
                            <CardComponent key={article.id} {...article} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;
