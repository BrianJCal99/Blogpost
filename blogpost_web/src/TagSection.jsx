import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "./utils/supabase";

const TagSection = ({ postId }) => {
    const [tags, setTags] = useState([]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const { data, error } = await supabase
                    .from("post_tag")
                    .select(`
                        tag (
                            id,
                            name
                        )
                    `)
                    .eq("post_id", postId);

                if (error) throw error;

                const tagList = data.map((tagRelation) => tagRelation.tag);
                setTags(tagList);
            } catch (err) {
                console.error("Error fetching tags:", err.message);
            }
        };
        fetchTags();
    }, [postId]);

    return (
        <div className="d-flex flex-column align-items-start">
            <div className="d-flex align-items-center">
                <div className="list-group">
                    {tags.length === 0 ? (
                        <div className="list-group-item">No tags available for this post.</div>
                    ) : (
                        tags.map((tag) => (
                            <Link 
                                key={tag.id}
                                to={`/tag/${tag.id}`} 
                                className="list-group-item list-group-item-action">
                                #{tag.name}
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TagSection;
