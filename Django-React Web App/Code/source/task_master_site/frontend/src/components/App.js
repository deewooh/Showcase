import React, { Component, useState} from "react";
import { Switch, Route, Link } from "react-router-dom";
import './App.css';

// import our 'customised' axios object to handle fetching from backend
import axiosInstance from "../axiosApi";

// Some React-Bootstrap to make our stuff look good
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';


// Our custom components
import Login from "./login";
import Signup from "./signup";
import UserProfile from "./profile";
import Task from "./task";
import Connections from "./connections";
import About from "./About";

// Some more static imports (mainly images)
import logo from './logo.png'
import logo_light from './logo_light.png'




class App extends Component {
    constructor() {
        super();
        this.state = {
            // Ternary operator looks at local storage
            // If it contains a token then logged_in = true
            // otherwise false
            logged_in: localStorage.getItem('access_token') ? true : false,
            user_id: '',
            username: '',
            errors: {},
        };

        this.handleLogout = this.handleLogout.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
    }

    componentDidMount(){
        this.updateSession()
    }

    async updateSession() {
        
        if(localStorage.getItem('access_token')){
            try {
                const response = await axiosInstance.get('/current/');
                this.setState({
                    logged_in: true,
                    user_id: response.data.id,
                    username: response.data.username,
                  });
                return response;
            } catch (error) {
                throw error;
            }
        } else {
            this.setState({
                logged_in: false,
                user_id: '',
                username: '',
              });
              return
        }
        
    }

    // Remember anything that uses axiosInstance(post/get/...) requires an await
    // Function needs to start with async
    async handleLogin(event, data) {
        event.preventDefault();
        try {
            const response = await axiosInstance.post('/token/obtain/', {
                username: data.username,
                password: data.password,
            });
            axiosInstance.defaults.headers['Authorization'] = "JWT " + response.data.access;
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            this.updateSession();
            this.setState({
                logged_in: true,
                user_id: response.data.id,
                username: response.data.username,
            });
            return null;
        } catch (error) {
            console.log(error.response.data)
            this.setState({
                errors: error.response.data
            });
            return error.response.data;
        }
    };


    async handleLogout() {
        try {
            const response = await axiosInstance.post('/blacklist/', {
                "refresh_token": localStorage.getItem("refresh_token")
            });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            axiosInstance.defaults.headers['Authorization'] = null;
            this.updateSession();
            return response;
        }
        catch (e) {
            console.log(e);
        }
    };
    
    
    render() {
        let isLoggedIn = this.state.logged_in;
        const userView = () => {
            // View if the user is logged in
            if(isLoggedIn){
                return (
                    <div>

                        <Navbar className="navbar">
                            
                            <Navbar.Brand href="/taskflow/">
                                <img
                                    src={logo_light}
                                    width="170"
                                    height="auto"
                                    className="d-inline-block align-top"
                                    alt="Task Flow logo"
                                />
                            </Navbar.Brand>
                            <Nav.Link className="nav-link" href="/taskflow/tasks/">Tasks</Nav.Link>
                            {/* <Nav.Link className="nav-link" href="/frontend/">Home</Nav.Link> */}
                            <Nav.Link className="nav-link" href="/taskflow/profile/">Profile</Nav.Link>
                            <Nav.Link className="nav-link" href="/taskflow/connections/">Connections</Nav.Link>
                            <Navbar.Collapse className="justify-content-end">
                                <Navbar.Text className="text-white nav-text">
                                    Signed in as: {this.state.username}
                                </Navbar.Text>
                            </Navbar.Collapse>
                            <button className="btn btn-orange" onClick={this.handleLogout}>Logout</button>
                        </Navbar>

                        <main className="container">
                            <h1 className="text-dblue text-uppercase text-center my-4">TASK FLOW</h1>

                            <div className="mainDiv">
                                <Switch>
                                    {/*The following route is an example of how to use 'props'
                                        This allows effectively pass a state between all our
                                        components*/}
                                    
                                    <Route exact path={"/taskflow/profile/"}>
                                    
                                        <UserProfile data={this.state} handleLogout={this.handleLogout}/>
                                    
                                    </Route>
                                    

                                    {/* <Route exact path={"/taskflow/tasks"}>
                                        <Task data={this.state}/>
                                    </Route> */}

                                    <Route exact path={"/taskflow/connections/"}>
                                        <Connections data={this.state}/>
                                    </Route>

                                    <Route exact path={"/taskflow/about/"}>
                                        <About data={this.state}/>
                                    </Route>
                                    
                                    {/* Default page if nothing*/}
                                    <Route path={"/taskflow/"}>
                                        <Task data={this.state}/>
                                    </Route>

                                </Switch> 
                            </div>
                            <hr className="horizontal-div"/>
                        </main>
                        <Navbar className="navbar bottom-nav">
                            <Nav.Link className="nav-link bottom-link" href="/taskflow/about/">About Us</Nav.Link>
                            <Navbar.Brand href="/taskflow/">
                                <img
                                    src={logo}
                                    width="120"
                                    height="auto"
                                    className="d-inline-block align-top"
                                    alt="Task Flow logo"
                                />
                            </Navbar.Brand>
                        </Navbar>
                    </div>
                );
            } else {
                // View if the user is NOT logged in
                return (
                    <div className="App">
                        <main className="container">
                            <h1 className="text-white text-uppercase text-center my-4">TASK FLOW</h1>
                            <div className="auth-wrapper">
                                <div className="auth-inner">
                                    <Switch>
                                        {/*We lifted the function of login to App.js as we need
                                        the user_id and username for multiple components
                                        For more info https://reactjs.org/docs/lifting-state-up.html */}
                                        <Route exact path={"/taskflow/login/"}>
                                            <Login handleLogin={this.handleLogin} errors={this.state.errors}/>
                                        </Route>
                                        
                                        {/*We also pass in the handle login function to the 
                                        signup component as we want the user to login 
                                        automatically after signing in*/}
                                        <Route exact path={"/taskflow/signup/"}> 
                                            <Signup handleLogin={this.handleLogin}/>
                                        </Route>
                                            <Login handleLogin={this.handleLogin}/>
                                        <Route path={"/taskflow/"}>
                                            <Signup handleLogin={this.handleLogin}/>
                                        </Route>
                                    </Switch>
                                </div> 
                            </div>
                        </main>
                    </div>
                );
            }
        }
        
        // What ultimately gets rendered, put anything you want to display on all pages here
        // Eg a logo once we design one XD
        return (
            
            <div className="site">
                {userView()}
            </div>
        );

    }







}

export default App;