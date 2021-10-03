import React, { Component } from "react";
import axiosInstance from "../axiosApi";

import logo from './logo.png'



class Signup extends Component{
    constructor(props){
        super(props);
        this.state = {
            username: "",
            password: "",
            password2: "",
            email:"",
            errors:{}
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    async handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await axiosInstance.post('/user/create/', {
                username: this.state.username,
                password: this.state.password,
                password2: this.state.password2
            });
            this.props.handleLogin(event, this.state)
            return response;
        } catch (error) {
            console.log(error.stack);
            this.setState({
                errors:error.response.data
            });
        }
    }


    // Login stylying: From https://www.positronx.io/build-react-login-sign-up-ui-template-with-bootstrap-4/
    render() {
        return (
                <form onSubmit={this.handleSubmit}>
                    <img
                        src={logo}
                        width="300"
                        height="auto"
                        className="d-inline-block align-top"
                        alt="Task Flow logo"
                    />
                    
                    <h3>Signup</h3>

                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            name="username"
                            className="form-control" 
                            type="email" 
                            value={this.state.username} 
                            onChange={this.handleChange}
                            placeholder="Enter Email"/>
                        <label className="invalid-input">
                            { this.state.errors.username ? this.state.errors.username : null}
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input 
                            name="password" 
                            className="form-control"
                            type="password" 
                            value={this.state.password} 
                            onChange={this.handleChange}
                            placeholder="Enter Password"/>
                        <label className="invalid-input">
                            { this.state.errors.password ? this.state.errors.password : null}
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password:</label>
                        <input 
                            name="password2"
                            className="form-control" 
                            type="password" 
                            value={this.state.password2} 
                            onChange={this.handleChange}
                            placeholder="Confirm Password"/>
                        <label className="invalid-input">
                            { this.state.errors.password2 ? this.state.errors.password2 : null}
                        </label>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" value="Submit">
                        Register
                    </button>
                    <p className="forgot-password text-right">
                        Already registered <a href="/taskflow/login/">sign in?</a>
                    </p>
                </form>
        )
    }
}

export default Signup;