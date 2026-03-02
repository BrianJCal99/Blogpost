import React, {useState} from 'react';
import {Outlet} from 'react-router-dom';
import Button from './Button';
import Input from './Input';

const Footer = () => {

    const [contact, setContact] = useState({
        email:''
    })

    const handleChange = (event) => {
        const {name, value} = event.target
        setContact ((preValue)=>{
            return {
                ...preValue,
                [name]: value
            }
        })
    }

    const handleClick = async() => {
        await fetch ('http://localhost:3001/',{
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                email: contact.email
            })
        })
        .then(response=>response.json())
        .then (data => JSON.parse(data))
        .catch(error =>{
            console.log("Error: " + error)
        })
    }

    return (
        <div>
            <footer className="bg-dark text-center text-white mt-5">
                <div className="container p-4">
                    <section className="">
                        <div className="col-auto">
                            <p className="pt-2 text-uppercase">
                                <strong>Sign up for our daily insider</strong>
                            </p>
                            </div>
                        <div className="row d-flex justify-content-center">
                            <div className="col-md-5 col-12">
                                <div className="form-outline form-white mb-4">
                                {/*<input type="email" id="email" className="form-control" placeholder="Enter your email"/>*/}
                                <Input 
                                name= 'email'
                                type= 'text'
                                placeholder ='Enter your email'
                                onChange = {handleChange}
                                value = {contact.email}
                                />
                                </div>
                            </div>
                                

                            <div className="col-auto">
                                {/*<button type="submit" className="btn btn-outline-light mb-4">Subscribe</button>*/}
                                <Button
                                type= 'submit'
                                text= 'Subscribe'
                                onClick = {handleClick}
                                />
                            </div>

                            

                        </div>
                    </section>
                    <section className="">
                    <div className="row">
                        <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
                        <h5 className="text-uppercase">Explore</h5>

                        <ul className="list-unstyled mb-0">
                            <li>
                            <a href="#!" className="text-white nav-link">Home</a>
                            </li>
                            <li>
                            <a href="#!" className="text-white nav-link">Questions</a>
                            </li>
                            <li>
                            <a href="#!" className="text-white nav-link">Articles</a>
                            </li>
                            <li>
                            <a href="#!" className="text-white nav-link">Tutorials</a>
                            </li>
                        </ul>
                        </div>

                        <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
                        <h5 className="text-uppercase">Support</h5>

                        <ul className="list-unstyled mb-0">
                            <li>
                            <a href="#!" className="text-white nav-link">FAQs</a>
                            </li>
                            <li>
                            <a href="#!" className="text-white nav-link">Help</a>
                            </li>
                            <li>
                            <a href="#!" className="text-white nav-link">Contact Us</a>
                            </li>
                        </ul>
                        </div>

                        <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
                        <h5 className="text-uppercase">Stay connected</h5>

                        <ul className="list-unstyled mb-0">
                            <li>
                                <a className="btn btn-light btn-floating m-1" href="#!" role="button"><i className="fab fa-facebook-f"></i><img width="25" height="25" src="https://img.icons8.com/ios/50/facebook-new.png" alt="facebook-new"/></a>
                                <a className="btn btn-light btn-floating m-1" href="#!" role="button"><i className="fab fa-twitter"></i><img width="25" height="25" src="https://img.icons8.com/ios/50/twitterx--v1.png" alt="twitterx--v1"/></a>
                                <a className="btn btn-light btn-floating m-1" href="#!" role="button"><i className="fab fa-instagram"></i><img width="25" height="25" src="https://img.icons8.com/ios/50/instagram-new--v1.png" alt="instagram-new--v1"/></a>
                            </li>
                        </ul>
                        </div>
                    </div>
                    </section>

                    <section className="mb-4">
                    <h3 className="mt-3 mb-3">
                        BLOGPOST
                    </h3>
                    <div className="row">
                        <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
                            <a href="#!" className="text-white nav-link">Privacy Policy</a>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
                            <a href="#!" className="text-white nav-link">Terms</a>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
                            <a href="#!" className="text-white nav-link">Code of Conduct</a>
                        </div>
                    </div>
                    </section>
                </div>
            </footer>
            <Outlet />
        </div>
    )
}

export default Footer;