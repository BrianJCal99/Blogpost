import React from "react";
import { createContext, useState, useEffect } from "react";
import supabase from "../utils/supabase";
import { useNavigate } from "react-router-dom";

export const SessionContext  = createContext(null);

export const SessionProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const {data: { subscription }} = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log(event, session)
            if (event === 'INITIAL_SESSION') {
              setSession(session)    
            } if (event === 'SIGNED_IN') {
              setSession(session)
            } else if (event === 'SIGNED_OUT') {
              setSession(session)
              navigate('/signin')
            }
          });
    
        return () => {
          subscription.unsubscribe()
        }
      }, [navigate]);
    
      return (
        <SessionContext.Provider value={session}>
          { children }
        </SessionContext.Provider>
      )
}
