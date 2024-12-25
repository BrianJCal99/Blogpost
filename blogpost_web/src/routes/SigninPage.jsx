import React,{useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import Input from '../Input'

import supabase from '../utils/supabase'

const SigninPage = (props) => {
    // const {setCurrentUser} = useContext(UserContext)
    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: '',
        password: ''
    })

    const {email, password} = user;
       
    const handleChange = (event)=>{
        const {name, value} = event.target
        setUser ((preValue)=>{  
        return {
        ...preValue,
        [name]: value
        }
        })
    }

    const handleSignin = async(event) =>
    {
        event.preventDefault();

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error){
            alert(error.message);
        }else{
            alert("Successfully logged in!")
            navigate ("/myprofile");
        }
    }

    return (
        <div className="p-4 d-flex justify-content-center pb-4">
            <div>
                <h5 className="m-5">Sign in to your BLOGPOST Account</h5>

                <form onSubmit={handleSignin}>
                    <Input 
                        name='email'
                        type='text'
                        placeholder='username/email'
                        onChange={handleChange}
                        value={user.email}
                    />

                    <Input 
                        name='password'
                        type='password'
                        placeholder='password'
                        onChange={handleChange}
                        value={user.password}
                    />

                    <div className="text-center">
                        <button type="submit" className="btn btn-primary btn-block mb-4">Log in</button>
                    </div>
                </form>

                <div className="text-center">
                    <p>Not a member? <Link to="/signup">Sign up</Link></p>
                </div>
            </div>    
        </div>

    )
}
export default SigninPage;